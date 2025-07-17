import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { createInvitationRecord } from '@/lib/invitationSchema';

// Enhanced invitation sending with new workflow
export const sendEnhancedInvitation = async (inviteData, currentUser) => {
  try {
    if (!currentUser || !currentUser.team_id) {
      throw new Error('Could not identify your team to send the invitation.');
    }

    if (!inviteData.email || !inviteData.role) {
      throw new Error('Email and role are required for sending invitations.');
    }

    // Create invitation record in the new table
    const invitationResult = await createInvitationRecord({
      email: inviteData.email,
      role: inviteData.role,
      team_id: currentUser.team_id,
      invited_by: currentUser.id
    });

    if (!invitationResult.success) {
      // Check if migration is required
      if (invitationResult.error === 'MIGRATION_REQUIRED') {
        toast({
          title: 'Database Migration Required',
          description: 'Enhanced invitation workflow requires database setup. Using legacy invitation for now.',
          variant: 'default'
        });
        
        // Fall back to legacy invitation system
        return await sendLegacyInvitation(inviteData, currentUser);
      }
      
      throw new Error(invitationResult.error);
    }

    // Send email with invitation link
    const emailResult = await sendInvitationEmail({
      email: inviteData.email,
      role: inviteData.role,
      token: invitationResult.token,
      invitedByName: currentUser.preferred_name || currentUser.legal_first_name,
      teamName: currentUser.business_name
    });

    if (!emailResult.success) {
      // Even if email fails, we keep the invitation record for manual follow-up
      console.warn('Email sending failed:', emailResult.error);
      toast({
        title: 'Invitation Created',
        description: `Invitation created for ${inviteData.email}, but email sending may have failed. Please check your email service or contact them manually.`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'Invitation Sent Successfully!',
        description: `An enhanced onboarding invitation has been sent to ${inviteData.email}.`,
        variant: 'success'
      });
    }

    return { success: true, data: invitationResult.data };
  } catch (error) {
    console.error('Error sending enhanced invitation:', error);
    toast({
      title: 'Invitation Failed',
      description: error.message || 'An unexpected error occurred while sending the invitation.',
      variant: 'destructive'
    });
    return { success: false, error: error.message };
  }
};

// Send invitation email using Supabase edge function
const sendInvitationEmail = async (emailData) => {
  try {
    const invitationUrl = `${window.location.origin}/invitation?token=${emailData.token}`;
    
    const { data, error } = await supabase.functions.invoke('send-enhanced-invitation', {
      body: JSON.stringify({
        email: emailData.email,
        role: emailData.role,
        invitationUrl: invitationUrl,
        invitedByName: emailData.invitedByName,
        teamName: emailData.teamName
      })
    });

    if (error) {
      console.error('Email function error:', error);
      // Fallback to the existing admin-invite-user function
      return await fallbackEmailSending(emailData);
    }

    if (data?.error) {
      console.error('Email function returned error:', data.error);
      return await fallbackEmailSending(emailData);
    }

    return { success: true };
  } catch (error) {
    console.error('Exception in email sending:', error);
    return await fallbackEmailSending(emailData);
  }
};

// Fallback to existing email function if enhanced one fails
const fallbackEmailSending = async (emailData) => {
  try {
    const invitationUrl = `${window.location.origin}/invitation?token=${emailData.token}`;
    
    const { data, error } = await supabase.functions.invoke('admin-invite-user', {
      body: JSON.stringify({
        email: emailData.email,
        role: emailData.role,
        invitation_url: invitationUrl,
        enhanced_workflow: true
      })
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return { success: true };
  } catch (error) {
    console.error('Fallback email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Update existing invitation dialogs to use enhanced workflow
export const updateInvitationDialogLogic = (originalHandleInviteSubmit) => {
  return async (inviteEmail, role, currentUser) => {
    if (!inviteEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address to send an invitation.',
        variant: 'destructive'
      });
      return false;
    }

    const result = await sendEnhancedInvitation(
      { email: inviteEmail, role: role },
      currentUser
    );

    return result.success;
  };
};

// Helper function to generate invitation preview
export const generateInvitationPreview = (inviteData, currentUser) => {
  const roleDisplayName = inviteData.role === 'client' ? 'Client' : 'Team Member';
  const inviterName = currentUser.preferred_name || currentUser.legal_first_name;
  const teamName = currentUser.business_name || 'our team';

  return {
    subject: `You're invited to join ${teamName}`,
    preview: `${inviterName} has invited you to join ${teamName} as a ${roleDisplayName}. This is a guided onboarding process where you'll complete your profile information and a team manager will review and finalize your account.`,
    steps: [
      'Click the invitation link in your email',
      'Complete your profile information',
      'Wait for manager review and approval',
      'Receive your account credentials and start collaborating'
    ]
  };
};

// Validation helpers
export const validateInvitationData = (inviteData) => {
  const errors = [];

  if (!inviteData.email) {
    errors.push('Email address is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      errors.push('Please enter a valid email address');
    }
  }

  if (!inviteData.role) {
    errors.push('Role selection is required');
  } else if (!['client', 'admin'].includes(inviteData.role)) {
    errors.push('Invalid role selected');
  }

  return errors;
};

// Legacy fallback function
const sendLegacyInvitation = async (inviteData, currentUser) => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-invite-user', {
      body: JSON.stringify({
        email: inviteData.email,
        role: inviteData.role,
        legacy_fallback: true
      })
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    toast({
      title: 'Invitation Sent (Legacy Mode)',
      description: `Basic invitation sent to ${inviteData.email}. Run database migration for enhanced workflow.`,
      variant: 'default'
    });

    return { success: true, legacy: true };
  } catch (error) {
    console.error('Legacy invitation failed:', error);
    toast({
      title: 'Invitation Failed',
      description: 'Both enhanced and legacy invitation methods failed. Please check your setup.',
      variant: 'destructive'
    });
    return { success: false, error: error.message };
  }
}; 