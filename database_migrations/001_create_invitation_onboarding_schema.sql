-- Enhanced Invitation Workflow Database Schema
-- Migration 001: Create invitation_onboarding and related tables

-- Create custom enum for invitation status
CREATE TYPE invitation_status AS ENUM (
  'pending_invitee_response',
  'pending_manager_review',
  'pending_manager_completion', 
  'completed',
  'expired',
  'cancelled'
);

-- Create the main invitation_onboarding table
CREATE TABLE invitation_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'admin', 'full_admin')),
  team_id UUID NOT NULL, -- Remove foreign key constraint since team_id is not unique
  invited_by UUID REFERENCES public.users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status invitation_status NOT NULL DEFAULT 'pending_invitee_response',
  
  -- Form data stored as JSONB
  invitee_form_data JSONB,
  manager_form_data JSONB,
  
  -- Timestamps for tracking workflow progress
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invitee_submitted_at TIMESTAMP WITH TIME ZONE,
  manager_reviewed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Relationships for tracking who reviewed/completed
  reviewed_by UUID REFERENCES public.users(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- Admin override tracking
  admin_override BOOLEAN DEFAULT FALSE,
  admin_override_reason TEXT,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Indexes for performance
  CONSTRAINT unique_active_email_per_team UNIQUE (email, team_id, status) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Create admin action logs table for audit trail
CREATE TABLE admin_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  invitation_id UUID REFERENCES invitation_onboarding(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.users(id),
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_invitation_onboarding_email ON invitation_onboarding(email);
CREATE INDEX idx_invitation_onboarding_team_id ON invitation_onboarding(team_id);
CREATE INDEX idx_invitation_onboarding_status ON invitation_onboarding(status);
CREATE INDEX idx_invitation_onboarding_token ON invitation_onboarding(token);
CREATE INDEX idx_invitation_onboarding_expires_at ON invitation_onboarding(expires_at);
CREATE INDEX idx_invitation_onboarding_created_at ON invitation_onboarding(created_at);
CREATE INDEX idx_invitation_onboarding_invited_by ON invitation_onboarding(invited_by);

CREATE INDEX idx_admin_action_logs_invitation_id ON admin_action_logs(invitation_id);
CREATE INDEX idx_admin_action_logs_admin_id ON admin_action_logs(admin_id);
CREATE INDEX idx_admin_action_logs_timestamp ON admin_action_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE invitation_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitation_onboarding
CREATE POLICY "Users can view invitations for their team" ON invitation_onboarding
  FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team managers can insert invitations" ON invitation_onboarding
  FOR INSERT 
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'full_admin')
    )
  );

CREATE POLICY "Team managers can update invitations" ON invitation_onboarding
  FOR UPDATE 
  USING (
    team_id IN (
      SELECT team_id FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'full_admin')
    )
  );

-- RLS Policies for admin_action_logs  
CREATE POLICY "Admins can view action logs for their team" ON admin_action_logs
  FOR SELECT 
  USING (
    admin_id IN (
      SELECT id FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'full_admin'
    )
  );

CREATE POLICY "Admins can insert action logs" ON admin_action_logs
  FOR INSERT 
  WITH CHECK (
    admin_id = auth.uid() AND
    admin_id IN (
      SELECT id FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'full_admin'
    )
  );

-- Function to get pending invitations for a team (bypasses RLS for internal use)
CREATE OR REPLACE FUNCTION get_enhanced_pending_invitations(p_team_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  role TEXT,
  team_id UUID,
  invited_by UUID,
  token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  status invitation_status,
  invitee_form_data JSONB,
  manager_form_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  invitee_submitted_at TIMESTAMP WITH TIME ZONE,
  manager_reviewed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  user_id UUID,
  admin_override BOOLEAN,
  admin_override_reason TEXT,
  metadata JSONB,
  invited_by_user JSONB,
  reviewed_by_user JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    io.id,
    io.email,
    io.role,
    io.team_id,
    io.invited_by,
    io.token,
    io.expires_at,
    io.status,
    io.invitee_form_data,
    io.manager_form_data,
    io.created_at,
    io.invitee_submitted_at,
    io.manager_reviewed_at,
    io.completed_at,
    io.cancelled_at,
    io.reviewed_by,
    io.user_id,
    io.admin_override,
    io.admin_override_reason,
    io.metadata,
    -- Invited by user info as JSONB
    CASE 
      WHEN iu.id IS NOT NULL THEN
        jsonb_build_object(
          'id', iu.id,
          'preferred_name', iu.preferred_name,
          'legal_first_name', iu.legal_first_name,
          'email', iu.email
        )
      ELSE NULL
    END as invited_by_user,
    -- Reviewed by user info as JSONB  
    CASE 
      WHEN ru.id IS NOT NULL THEN
        jsonb_build_object(
          'id', ru.id,
          'preferred_name', ru.preferred_name,
          'legal_first_name', ru.legal_first_name,
          'email', ru.email
        )
      ELSE NULL
    END as reviewed_by_user
  FROM invitation_onboarding io
  LEFT JOIN public.users iu ON io.invited_by = iu.id
  LEFT JOIN public.users ru ON io.reviewed_by = ru.id
  WHERE io.team_id = p_team_id
    AND io.status NOT IN ('completed', 'cancelled')
  ORDER BY io.created_at DESC;
END;
$$;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE invitation_onboarding 
  SET status = 'expired'
  WHERE status = 'pending_invitee_response' 
    AND expires_at < NOW()
    AND status != 'expired';
    
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$;

-- Create a trigger to automatically expire old invitations
CREATE OR REPLACE FUNCTION trigger_expire_invitations()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean up expired invitations when any invitation is accessed
  PERFORM cleanup_expired_invitations();
  RETURN NEW;
END;
$$;

-- Optional: Create trigger that runs cleanup on SELECT (can be resource intensive)
-- CREATE TRIGGER auto_expire_invitations
--   BEFORE SELECT ON invitation_onboarding
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION trigger_expire_invitations();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON invitation_onboarding TO authenticated;
GRANT ALL ON admin_action_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_enhanced_pending_invitations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations() TO authenticated;

-- Insert initial test data (optional - remove in production)
-- INSERT INTO invitation_onboarding (
--   email, role, team_id, invited_by, token, expires_at, status
-- ) VALUES (
--   'test@example.com', 
--   'client', 
--   (SELECT team_id FROM public.users LIMIT 1),
--   (SELECT id FROM public.users WHERE role = 'full_admin' LIMIT 1),
--   'test-token-' || gen_random_uuid(),
--   NOW() + INTERVAL '72 hours',
--   'pending_invitee_response'
-- );

COMMENT ON TABLE invitation_onboarding IS 'Enhanced invitation workflow with two-stage onboarding process';
COMMENT ON TABLE admin_action_logs IS 'Audit trail for administrative actions on invitations';
COMMENT ON FUNCTION get_enhanced_pending_invitations(UUID) IS 'Retrieves pending invitations for a team with user relationship data';
COMMENT ON FUNCTION cleanup_expired_invitations() IS 'Marks expired invitations and returns count of updated records'; 