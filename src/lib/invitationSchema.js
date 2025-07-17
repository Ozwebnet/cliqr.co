import { supabase } from './supabaseClient';
import { toast } from '@/components/ui/use-toast';

// Enhanced Invitation States
export const INVITATION_STATES = {
  PENDING_INVITEE_RESPONSE: 'pending_invitee_response',
  PENDING_MANAGER_REVIEW: 'pending_manager_review', 
  PENDING_MANAGER_COMPLETION: 'pending_manager_completion',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// Role-based form field definitions
export const ROLE_FORM_FIELDS = {
  client: {
    public: [
      'legal_first_name',
      'legal_middle_name', 
      'legal_last_name',
      'preferred_name',
      'phone_number',
      'business_name',
      'position_job_title',
      'preferred_contact_method'
    ],
    internal: [
      'internal_notes',
      'client_priority',
      'assigned_manager_id',
      'billing_rate',
      'project_tags'
    ]
  },
  admin: {
    public: [
      'legal_first_name',
      'legal_middle_name',
      'legal_last_name', 
      'preferred_name',
      'phone_number',
      'employment_type',
      'portfolio_url',
      'social_profiles',
      'abn',
      'acn'
    ],
    internal: [
      'skill_set',
      'hourly_rate',
      'bank_account_name',
      'bsb_number',
      'account_number',
      'permissions',
      'internal_notes'
    ]
  }
};

// Database functions for invitation management
export const createInvitationRecord = async (inviteData) => {
  try {
    const token = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72); // 72 hour expiry

    const { data, error } = await supabase
      .from('invitation_onboarding')
      .insert({
        email: inviteData.email,
        role: inviteData.role,
        team_id: inviteData.team_id,
        invited_by: inviteData.invited_by,
        token: token,
        expires_at: expiresAt.toISOString(),
        status: INVITATION_STATES.PENDING_INVITEE_RESPONSE,
        metadata: {
          role_type: inviteData.role,
          invitation_type: 'enhanced_onboarding'
        }
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, token };
  } catch (error) {
    console.error('Error creating invitation record:', error);
    
    // Check if it's a table not found error (migration not run)
    if (error.message?.includes('relation "invitation_onboarding" does not exist')) {
      return { 
        success: false, 
        error: 'MIGRATION_REQUIRED',
        message: 'Database migration required. Please run the setup script.'
      };
    }
    
    return { success: false, error: error.message };
  }
};

export const validateInvitationToken = async (token) => {
  try {
    const { data, error } = await supabase
      .from('invitation_onboarding')
      .select('*')
      .eq('token', token)
      .eq('status', INVITATION_STATES.PENDING_INVITEE_RESPONSE)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { valid: false, error: 'Invalid or expired invitation token' };
      }
      throw error;
    }

    return { valid: true, invitation: data };
  } catch (error) {
    console.error('Error validating invitation token:', error);
    return { valid: false, error: error.message };
  }
};

export const submitInviteeForm = async (token, formData) => {
  try {
    const { data, error } = await supabase
      .from('invitation_onboarding')
      .update({
        invitee_form_data: formData,
        status: INVITATION_STATES.PENDING_MANAGER_REVIEW,
        invitee_submitted_at: new Date().toISOString()
      })
      .eq('token', token)
      .eq('status', INVITATION_STATES.PENDING_INVITEE_RESPONSE)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting invitee form:', error);
    return { success: false, error: error.message };
  }
};

export const completeManagerReview = async (invitationId, managerFormData, managerId) => {
  try {
    const { data, error } = await supabase
      .from('invitation_onboarding')
      .update({
        manager_form_data: managerFormData,
        status: INVITATION_STATES.PENDING_MANAGER_COMPLETION,
        manager_reviewed_at: new Date().toISOString(),
        reviewed_by: managerId
      })
      .eq('id', invitationId)
      .eq('status', INVITATION_STATES.PENDING_MANAGER_REVIEW)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error completing manager review:', error);
    return { success: false, error: error.message };
  }
};

export const finalizeAccountCreation = async (invitationId, password) => {
  try {
    // Get the invitation data
    const { data: invitation, error: fetchError } = await supabase
      .from('invitation_onboarding')
      .select('*')
      .eq('id', invitationId)
      .eq('status', INVITATION_STATES.PENDING_MANAGER_COMPLETION)
      .single();

    if (fetchError) throw fetchError;

    // Combine invitee and manager form data
    const combinedData = {
      ...invitation.invitee_form_data,
      ...invitation.manager_form_data,
      email: invitation.email,
      role: invitation.role,
      team_id: invitation.team_id,
      status: 'active'
    };

    // Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password: password,
      options: {
        data: combinedData
      }
    });

    if (authError) throw authError;

    // Update invitation status
    const { error: updateError } = await supabase
      .from('invitation_onboarding')
      .update({
        status: INVITATION_STATES.COMPLETED,
        completed_at: new Date().toISOString(),
        user_id: authData.user?.id
      })
      .eq('id', invitationId);

    if (updateError) throw updateError;

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Error finalizing account creation:', error);
    return { success: false, error: error.message };
  }
};

export const getEnhancedPendingInvitations = async (teamId) => {
  try {
    // Try using the database function first (preferred method)
    const { data: functionData, error: functionError } = await supabase
      .rpc('get_enhanced_pending_invitations', { p_team_id: teamId });

    if (!functionError && functionData) {
      return { success: true, data: functionData };
    }

    // Fallback to direct table query if function doesn't exist
    const { data, error } = await supabase
      .from('invitation_onboarding')
      .select(`
        *,
        invited_by_user:invited_by(preferred_name, legal_first_name),
        reviewed_by_user:reviewed_by(preferred_name, legal_first_name)
      `)
      .eq('team_id', teamId)
      .neq('status', INVITATION_STATES.COMPLETED)
      .neq('status', INVITATION_STATES.CANCELLED)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching enhanced pending invitations:', error);
    
    // Check if it's a schema-related error
    if (error.message?.includes('invitation_onboarding') || 
        error.message?.includes('relationship') ||
        error.message?.includes('get_enhanced_pending_invitations')) {
      return { 
        success: false, 
        error: 'MIGRATION_REQUIRED',
        message: 'Database migration required. Please run the setup script.'
      };
    }
    
    return { success: false, error: error.message };
  }
};

export const cancelInvitation = async (invitationId) => {
  try {
    const { data, error } = await supabase
      .from('invitation_onboarding')
      .update({
        status: INVITATION_STATES.CANCELLED,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return { success: false, error: error.message };
  }
};

export const resetInvitation = async (invitationId, newToken = null) => {
  try {
    const token = newToken || generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    const { data, error } = await supabase
      .from('invitation_onboarding')
      .update({
        token: token,
        expires_at: expiresAt.toISOString(),
        status: INVITATION_STATES.PENDING_INVITEE_RESPONSE,
        invitee_form_data: null,
        manager_form_data: null,
        invitee_submitted_at: null,
        manager_reviewed_at: null,
        reviewed_by: null
      })
      .eq('id', invitationId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, token };
  } catch (error) {
    console.error('Error resetting invitation:', error);
    return { success: false, error: error.message };
  }
};

// Utility functions
const generateSecureToken = () => {
  return crypto.randomUUID() + '-' + Date.now().toString(36);
};

export const getFormFieldsForRole = (role, type = 'public') => {
  return ROLE_FORM_FIELDS[role]?.[type] || [];
};

export const validateFormData = (formData, requiredFields) => {
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors.push(`${field.replace(/_/g, ' ')} is required`);
    }
  });
  
  return errors;
}; 