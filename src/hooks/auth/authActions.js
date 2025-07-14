import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { validatePassword } from '@/lib/passwordUtils.jsx';
import { fetchUserProfile } from '@/hooks/auth/userProfileActions.js';

export const login = async (email, password, setLoading, setUserState, setRememberMeState) => {
  setLoading(true);
  if (!email || !password) {
    toast({ title: 'Login Failed', description: 'Email and password are required.', variant: 'destructive' });
    setLoading(false);
    return null;
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    setLoading(false);
    return null;
  }
  
  if (data.user) {
    const fullUser = await fetchUserProfile(data.user);
    if (fullUser && fullUser.status === 'active') {
      setUserState(fullUser);
      toast({ title: 'Login Successful', description: `Welcome, ${fullUser.preferred_name || fullUser.email}!` });
      setLoading(false);
      return fullUser;
    } else {
      await supabase.auth.signOut(); 
      setUserState(null); 
      if (fullUser && fullUser.status !== 'active') {
           toast({ title: 'Login Failed', description: 'Account is not active or accessible.', variant: 'destructive' });
      }
      setLoading(false);
      return null;
    }
  }
  setLoading(false);
  return null;
};

export const logout = async (setLoading, setUserState, setRememberMeState) => {
  setLoading(true);
  const { error } = await supabase.auth.signOut();
  if (error) {
    toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
  } else {
    setUserState(null);
    setRememberMeState(false); 
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  }
  setLoading(false);
};

export const signUp = async (formData) => {
  const { 
    email, password, legal_first_name, legal_last_name, preferred_name, phone_number, business_name,
    position_job_title, preferred_contact_method 
  } = formData;

  if (!email || !password || !legal_first_name || !legal_last_name || !phone_number || !business_name || !position_job_title || !preferred_contact_method) {
    toast({ title: 'Sign Up Failed', description: 'Please fill all required fields.', variant: 'destructive' });
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
    toast({ title: 'Password Issue', description: `Password is not strong enough: ${passwordValidationErrors.join(' ')}`, variant: 'destructive' });
    return null;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'full_admin', 
        status: 'active',
        legal_first_name: formData.legal_first_name,
        legal_middle_name: formData.legal_middle_name,
        legal_last_name: formData.legal_last_name,
        preferred_name: formData.preferred_name || formData.legal_first_name,
        phone_number: formData.phone_number,
        business_name: formData.business_name,
        abn: formData.abn,
        acn: formData.acn,
        name: formData.preferred_name || formData.legal_first_name,
        position_job_title: formData.position_job_title,
        preferred_contact_method: formData.preferred_contact_method,
      }
    }
  });

  if (error) {
     toast({ title: 'Sign Up Failed', description: error.message, variant: 'destructive' });
     return null;
  }

  if (data.user) {
    toast({ title: 'Sign Up Successful', description: 'Please check your email to confirm your account.' });
  }
  return data.user;
};

export const sendPasswordResetEmail = async (email, setLoading) => {
  setLoading(true);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  });
  if (error) {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  } else {
    toast({ title: 'Success', description: 'Password reset link sent to your email.' });
  }
  setLoading(false);
};

export const updatePassword = async (newPassword, setLoading) => {
  setLoading(true);
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  } else {
    toast({ title: 'Success', description: 'Password updated successfully.' });
  }
  setLoading(false);
};