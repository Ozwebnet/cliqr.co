import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { validatePassword } from '@/lib/passwordUtils.jsx';

export const createUserByAdmin = async (formData, currentUser) => {
  const { email, password, role, legal_first_name, legal_last_name, preferred_name, phone_number, business_name } = formData;

  if (!email || !password || !role || !legal_first_name || !legal_last_name || !preferred_name || !phone_number || !business_name) {
    toast({ title: 'Creation Failed', description: 'Please fill all required fields.', variant: 'destructive' });
    return null;
  }
  
  const passwordValidationErrors = validatePassword(password, {
      email: formData.email,
      legal_first_name: formData.legal_first_name,
      legal_middle_name: formData.legal_middle_name,
      legal_last_name: formData.legal_last_name,
      preferred_name: formData.preferred_name,
  });

  if (passwordValidationErrors.length > 0) {
    toast({ title: 'Password Issue', description: `Password for new user is not strong enough: ${passwordValidationErrors.join(' ')}`, variant: 'destructive' });
    return null;
  }

  if (!currentUser || !currentUser.team_id) {
    toast({ title: 'Creation Failed', description: 'Could not identify your team to add the user.', variant: 'destructive' });
    return null;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        team_id: currentUser.team_id, 
        status: 'active',
        legal_first_name: formData.legal_first_name,
        legal_middle_name: formData.legal_middle_name,
        legal_last_name: formData.legal_last_name,
        preferred_name: formData.preferred_name,
        phone_number: formData.phone_number,
        business_name: formData.business_name,
        abn: formData.abn,
        acn: formData.acn,
        position_job_title: formData.position_job_title,
        preferred_contact_method: formData.preferred_contact_method,
        name: formData.preferred_name
      },
    }
  });

  if (error) {
    toast({ title: 'Creation Failed', description: error.message, variant: 'destructive' });
    return null;
  }

  toast({ title: 'User Invitation Sent', description: `An invitation email has been sent to ${email}. They need to confirm their email.` });
  return data.user;
};

export const softDeleteUser = async (userId, currentUser) => {
  if (currentUser?.role !== 'full_admin') {
    toast({ title: 'Permission Denied', description: 'You cannot perform this action.', variant: 'destructive' });
    return false;
  }
  const { error } = await supabase
    .from('users')
    .update({ status: 'soft_deleted', deleted_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    toast({ title: 'Error', description: `Failed to move user to bin: ${error.message}`, variant: 'destructive' });
    return false;
  }
  toast({ title: 'User Moved to Bin', description: 'User account has been moved to the recycling bin.' });
  return true;
};

export const permanentlyDeleteUser = async (userId, currentUser) => {
  if (currentUser?.role !== 'full_admin') {
    toast({ title: 'Permission Denied', description: 'You cannot perform this action.', variant: 'destructive' });
    return false;
  }
  
  const { error: publicError } = await supabase.from('users').delete().eq('id', userId);
  if (publicError) {
    toast({ title: 'Error', description: `Failed to delete user profile: ${publicError.message}`, variant: 'destructive' });
    return false;
  }
  
  try {
      const { error: functionError } = await supabase.functions.invoke('admin-delete-user', {
          body: JSON.stringify({ userId })
      });

      if (functionError) {
          console.warn("Error invoking admin-delete-user Edge Function:", functionError.message);
          toast({ 
              title: 'User Profile Deleted', 
              description: 'User profile removed. Full auth deletion might require manual review or has failed.',
              variant: 'default' 
          });
      } else {
           toast({ 
              title: 'User Permanently Deleted', 
              description: 'User account has been fully deleted.',
              variant: 'default' 
          });
      }
  } catch (e) {
       console.warn("Exception invoking admin-delete-user Edge Function:", e.message);
       toast({ 
          title: 'User Profile Deleted', 
          description: 'User profile removed. Full auth deletion might require manual review or has failed.',
          variant: 'default' 
      });
  }
  return true;
};

export const restoreUser = async (userId, currentUser) => {
  if (currentUser?.role !== 'full_admin') {
      toast({ title: 'Permission Denied', description: 'You cannot perform this action.', variant: 'destructive' });
      return false;
  }
  const { error } = await supabase
      .from('users')
      .update({ status: 'active', deleted_at: null })
      .eq('id', userId);

  if (error) {
      toast({ title: 'Error', description: `Failed to restore user: ${error.message}`, variant: 'destructive' });
      return false;
  }
  toast({ title: 'User Restored', description: 'User account has been restored.' });
  return true;
};

export const updateUserByAdmin = async (userIdToUpdate, formData, currentUser) => {
  if (!currentUser || (currentUser.role !== 'full_admin' && currentUser.role !== 'admin')) {
    toast({ title: 'Permission Denied', description: 'You are not authorized to update users.', variant: 'destructive' });
    return false;
  }
  
  const { role: newRole, ...otherUpdates } = formData;

  if (currentUser.role === 'admin' && newRole && newRole !== 'client') {
      toast({ title: 'Permission Denied', description: 'Admins can only edit Client roles.', variant: 'destructive' });
      return false;
  }
  
  if (currentUser.role === 'full_admin' && userIdToUpdate === currentUser.id && newRole && newRole !== currentUser.role) {
      toast({ title: 'Action Denied', description: 'You cannot change your own role.', variant: 'destructive' });
      return false;
  }

  const updates = { ...otherUpdates };
  if (newRole) updates.role = newRole;
  if (formData.preferred_name) updates.name = formData.preferred_name;

  if (Object.keys(updates).length === 0) {
    toast({ title: 'No Changes', description: 'No information provided to update.', variant: 'default' });
    return true; 
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userIdToUpdate);

  if (error) {
    toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    return false;
  }

  return true;
};

export const updateUserEmailByAdmin = async (userIdToUpdate, newEmail, currentUser) => {
  if (currentUser?.role !== 'full_admin') {
    toast({ title: 'Permission Denied', description: 'You are not authorized to update user emails.', variant: 'destructive' });
    return false;
  }

  try {
    const { data, error } = await supabase.functions.invoke('admin-update-user-email', {
      body: JSON.stringify({ userId: userIdToUpdate, newEmail: newEmail })
    });

    if (error) {
      console.error('Error invoking admin-update-user-email function:', error.message);
      toast({ title: 'Email Update Failed', description: `Server error: ${error.message}`, variant: 'destructive' });
      return false;
    }

    if (data && data.error) {
       console.error('Function returned error for email update:', data.error);
       toast({ title: 'Email Update Failed', description: `Could not update email: ${data.error}`, variant: 'destructive' });
       return false;
    }
    
    const { error: publicUserError } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('id', userIdToUpdate);

    if (publicUserError) {
      console.warn('Failed to update email in public.users, but auth email change initiated:', publicUserError.message);
      toast({ title: 'Partial Email Update', description: 'Email change initiated, but display email might not update immediately.', variant: 'default' });
    }
    
    return true;
  } catch (e) {
    console.error('Exception invoking admin-update-user-email function:', e);
    toast({ title: 'Email Update Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    return false;
  }
};