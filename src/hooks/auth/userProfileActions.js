import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export const fetchUserProfile = async (authUser) => {
  if (!authUser) return null;
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('id, email, role, name, team_id, status, deleted_at, legal_first_name, legal_middle_name, legal_last_name, preferred_name, phone_number, business_name, abn, acn, position_job_title, preferred_contact_method, employment_type, portfolio_url, social_profiles')
    .eq('id', authUser.id)
    .single();

  if (error && error.code !== 'PGRST116') { 
    console.error('Error fetching user profile:', error);
    toast({ title: 'Error', description: `Could not fetch user profile: ${error.message}`, variant: 'destructive' });
    return { ...authUser, status: 'error_fetching_profile' }; 
  }
  
  if (userProfile && userProfile.status === 'soft_deleted') {
      toast({ title: 'Account Disabled', description: 'This account has been deactivated.', variant: 'destructive'});
      return { ...authUser, ...userProfile }; 
  }
  return userProfile ? { ...authUser, ...userProfile } : { ...authUser, status: 'profile_not_found' }; 
};