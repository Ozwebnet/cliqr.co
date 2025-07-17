import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { 
  resetInvitation, 
  cancelInvitation, 
  finalizeAccountCreation,
  INVITATION_STATES 
} from '@/lib/invitationSchema';

// Admin override functions for managing stalled invitations
export const adminOverrideInvitation = async (invitationId, action, currentUser, additionalData = {}) => {
  try {
    // Verify admin permissions
    if (!currentUser || currentUser.role !== 'full_admin') {
      throw new Error('Only full administrators can override invitations');
    }

    let result;
    
    switch (action) {
      case 'force_reset':
        result = await forceResetInvitation(invitationId, currentUser, additionalData);
        break;
      case 'force_complete':
        result = await forceCompleteInvitation(invitationId, currentUser, additionalData);
        break;
      case 'emergency_cancel':
        result = await emergencyCancelInvitation(invitationId, currentUser, additionalData);
        break;
      case 'extend_expiry':
        result = await extendInvitationExpiry(invitationId, currentUser, additionalData);
        break;
      case 'manual_activation':
        result = await manualAccountActivation(invitationId, currentUser, additionalData);
        break;
      default:
        throw new Error('Invalid admin override action');
    }

    return result;
  } catch (error) {
    console.error('Admin override error:', error);
    toast({
      title: 'Override Failed',
      description: error.message || 'Failed to execute admin override',
      variant: 'destructive'
    });
    return { success: false, error: error.message };
  }
};

// Force reset invitation (clears all data and starts fresh)
const forceResetInvitation = async (invitationId, currentUser, { reason }) => {
  try {
    const result = await resetInvitation(invitationId);
    
    if (result.success) {
      // Log admin action
      await logAdminAction({
        action: 'force_reset_invitation',
        invitation_id: invitationId,
        admin_id: currentUser.id,
        reason: reason || 'Admin force reset',
        metadata: {
          reset_timestamp: new Date().toISOString(),
          admin_name: currentUser.preferred_name || currentUser.legal_first_name
        }
      });

      toast({
        title: 'Invitation Force Reset',
        description: 'Invitation has been completely reset. A new token has been generated.',
        variant: 'success'
      });
    }

    return result;
  } catch (error) {
    throw new Error(`Force reset failed: ${error.message}`);
  }
};

// Force complete invitation (skips normal workflow)
const forceCompleteInvitation = async (invitationId, currentUser, { password, managerFormData, inviteeFormData }) => {
  try {
    // Update invitation with provided data
    const { error: updateError } = await supabase
      .from('invitation_onboarding')
      .update({
        invitee_form_data: inviteeFormData,
        manager_form_data: managerFormData,
        status: INVITATION_STATES.PENDING_MANAGER_COMPLETION,
        manager_reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser.id,
        admin_override: true,
        admin_override_reason: 'Force completion by admin'
      })
      .eq('id', invitationId);

    if (updateError) throw updateError;

    // Finalize account creation
    const result = await finalizeAccountCreation(invitationId, password);
    
    if (result.success) {
      await logAdminAction({
        action: 'force_complete_invitation',
        invitation_id: invitationId,
        admin_id: currentUser.id,
        reason: 'Admin force completion',
        metadata: {
          completion_timestamp: new Date().toISOString(),
          admin_name: currentUser.preferred_name || currentUser.legal_first_name,
          user_created: result.user?.id
        }
      });

      toast({
        title: 'Account Force Created',
        description: 'Account has been created via admin override.',
        variant: 'success'
      });
    }

    return result;
  } catch (error) {
    throw new Error(`Force completion failed: ${error.message}`);
  }
};

// Emergency cancel invitation
const emergencyCancelInvitation = async (invitationId, currentUser, { reason }) => {
  try {
    const result = await cancelInvitation(invitationId);
    
    if (result.success) {
      await logAdminAction({
        action: 'emergency_cancel_invitation',
        invitation_id: invitationId,
        admin_id: currentUser.id,
        reason: reason || 'Emergency cancellation',
        metadata: {
          cancellation_timestamp: new Date().toISOString(),
          admin_name: currentUser.preferred_name || currentUser.legal_first_name,
          emergency: true
        }
      });

      toast({
        title: 'Invitation Emergency Cancelled',
        description: 'Invitation has been immediately cancelled.',
        variant: 'success'
      });
    }

    return result;
  } catch (error) {
    throw new Error(`Emergency cancellation failed: ${error.message}`);
  }
};

// Extend invitation expiry
const extendInvitationExpiry = async (invitationId, currentUser, { extensionHours = 72 }) => {
  try {
    const newExpiryDate = new Date();
    newExpiryDate.setHours(newExpiryDate.getHours() + extensionHours);

    const { error } = await supabase
      .from('invitation_onboarding')
      .update({
        expires_at: newExpiryDate.toISOString(),
        admin_override: true,
        admin_override_reason: `Expiry extended by ${extensionHours} hours`
      })
      .eq('id', invitationId);

    if (error) throw error;

    await logAdminAction({
      action: 'extend_invitation_expiry',
      invitation_id: invitationId,
      admin_id: currentUser.id,
      reason: `Extended by ${extensionHours} hours`,
      metadata: {
        extension_timestamp: new Date().toISOString(),
        admin_name: currentUser.preferred_name || currentUser.legal_first_name,
        new_expiry: newExpiryDate.toISOString(),
        extension_hours: extensionHours
      }
    });

    toast({
      title: 'Invitation Extended',
      description: `Invitation expiry has been extended by ${extensionHours} hours.`,
      variant: 'success'
    });

    return { success: true };
  } catch (error) {
    throw new Error(`Expiry extension failed: ${error.message}`);
  }
};

// Manual account activation (bypass invitation process)
const manualAccountActivation = async (invitationId, currentUser, { userFormData, password }) => {
  try {
    // Get invitation data
    const { data: invitation, error: fetchError } = await supabase
      .from('invitation_onboarding')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (fetchError) throw fetchError;

    // Create user directly
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password: password,
      options: {
        data: {
          ...userFormData,
          email: invitation.email,
          role: invitation.role,
          team_id: invitation.team_id,
          status: 'active',
          admin_created: true
        }
      }
    });

    if (authError) throw authError;

    // Update invitation status
    const { error: updateError } = await supabase
      .from('invitation_onboarding')
      .update({
        status: INVITATION_STATES.COMPLETED,
        completed_at: new Date().toISOString(),
        user_id: authData.user?.id,
        admin_override: true,
        admin_override_reason: 'Manual activation by admin'
      })
      .eq('id', invitationId);

    if (updateError) throw updateError;

    await logAdminAction({
      action: 'manual_account_activation',
      invitation_id: invitationId,
      admin_id: currentUser.id,
      reason: 'Manual account activation',
      metadata: {
        activation_timestamp: new Date().toISOString(),
        admin_name: currentUser.preferred_name || currentUser.legal_first_name,
        user_created: authData.user?.id,
        manual_activation: true
      }
    });

    toast({
      title: 'Account Manually Activated',
      description: 'User account has been manually created and activated.',
      variant: 'success'
    });

    return { success: true, user: authData.user };
  } catch (error) {
    throw new Error(`Manual activation failed: ${error.message}`);
  }
};

// Log admin actions for audit trail
const logAdminAction = async (actionData) => {
  try {
    await supabase
      .from('admin_action_logs')
      .insert({
        ...actionData,
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.warn('Failed to log admin action:', error);
    // Don't throw error for logging failures
  }
};

// Get invitation audit trail
export const getInvitationAuditTrail = async (invitationId, currentUser) => {
  try {
    if (!currentUser || currentUser.role !== 'full_admin') {
      throw new Error('Only full administrators can view audit trails');
    }

    const { data, error } = await supabase
      .from('admin_action_logs')
      .select(`
        *,
        admin:admin_id(preferred_name, legal_first_name, email)
      `)
      .eq('invitation_id', invitationId)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Audit trail fetch error:', error);
    return { success: false, error: error.message };
  }
};

// Bulk invitation operations
export const bulkInvitationAction = async (invitationIds, action, currentUser, additionalData = {}) => {
  try {
    if (!currentUser || currentUser.role !== 'full_admin') {
      throw new Error('Only full administrators can perform bulk operations');
    }

    const results = [];
    
    for (const invitationId of invitationIds) {
      const result = await adminOverrideInvitation(invitationId, action, currentUser, additionalData);
      results.push({ invitationId, result });
    }

    const successCount = results.filter(r => r.result.success).length;
    const failureCount = results.length - successCount;

    toast({
      title: 'Bulk Operation Complete',
      description: `${successCount} successful, ${failureCount} failed operations.`,
      variant: successCount > 0 ? 'success' : 'destructive'
    });

    return { success: true, results };
  } catch (error) {
    console.error('Bulk operation error:', error);
    return { success: false, error: error.message };
  }
}; 