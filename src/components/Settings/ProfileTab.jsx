import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { validatePhoneNumber, getPhoneValidationError } from '@/lib/phoneValidation';
import { validateABNFormat, getABNValidationError } from '@/lib/abnValidation';
import { validateACNFormat, getACNValidationError } from '@/lib/acnValidation';

import ProfilePictureSection from '@/components/Settings/Profile/ProfilePictureSection';
import QuickStatsSection from '@/components/Settings/Profile/QuickStatsSection';
import PersonalInfoSection from '@/components/Settings/Profile/PersonalInfoSection';
import ProfessionalInfoSection from '@/components/Settings/Profile/ProfessionalInfoSection';
import ContactLocationSection from '@/components/Settings/Profile/ContactLocationSection';
import OnlinePresenceSection from '@/components/Settings/Profile/OnlinePresenceSection';

const ProfileTab = ({ userSettings, onSettingsUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    legal_first_name: '', legal_middle_name: '', legal_last_name: '', preferred_name: '',
    email: '', phone_number: '', business_name: '', abn: '', acn: '',
    position_job_title: '', preferred_contact_method: 'email',
    employment_type: '', portfolio_url: '',
    social_profiles: '', bio: '', location: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        legal_first_name: user.legal_first_name || '',
        legal_middle_name: user.legal_middle_name || '',
        legal_last_name: user.legal_last_name || '',
        preferred_name: user.preferred_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        business_name: user.business_name || '',
        abn: user.abn || '',
        acn: user.acn || '',
        position_job_title: user.position_job_title || '',
        preferred_contact_method: user.preferred_contact_method || 'email',
        employment_type: user.employment_type || '',
        portfolio_url: user.portfolio_url || '',
        social_profiles: user.social_profiles || '',
        bio: userSettings?.bio || '',
        location: userSettings?.location || ''
      });
    }
  }, [user, userSettings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.legal_first_name.trim()) newErrors.legal_first_name = 'First name is required';
    if (!formData.legal_last_name.trim()) newErrors.legal_last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    const phoneError = getPhoneValidationError(formData.phone_number);
    if (phoneError) newErrors.phone_number = phoneError;
    const abnError = getABNValidationError(formData.abn);
    if (abnError) newErrors.abn = abnError;
    const acnError = getACNValidationError(formData.acn);
    if (acnError) newErrors.acn = acnError;
    const urlFields = ['portfolio_url'];
    urlFields.forEach(field => {
      if (formData[field] && formData[field].trim()) {
        try { new URL(formData[field]); } 
        catch { newErrors[field] = 'Please enter a valid URL (e.g., https://example.com)'; }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors in the form.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const userUpdateData = {
        legal_first_name: formData.legal_first_name, legal_middle_name: formData.legal_middle_name || null,
        legal_last_name: formData.legal_last_name, preferred_name: formData.preferred_name || null,
        phone_number: formData.phone_number || null, business_name: formData.business_name || null,
        abn: formData.abn || null, acn: formData.acn || null, position_job_title: formData.position_job_title || null,
        preferred_contact_method: formData.preferred_contact_method,
        employment_type: formData.employment_type || null,
        portfolio_url: formData.portfolio_url || null,
        social_profiles: formData.social_profiles || null, name: formData.preferred_name || formData.legal_first_name
      };
      const { error: userError } = await supabase.from('users').update(userUpdateData).eq('id', user.id);
      if (userError) throw userError;

      const settingsData = { user_id: user.id, team_id: user.team_id, bio: formData.bio || null, location: formData.location || null };
      const { error: settingsError } = await supabase.from('user_settings').upsert(settingsData, { onConflict: 'user_id' });
      if (settingsError) throw settingsError;

      toast({ title: 'Success', description: 'Profile updated successfully!' });
      onSettingsUpdate();
    } catch (error) {
      toast({ title: 'Error', description: `Failed to update profile: ${error.message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = () => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "Avatar upload isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfilePictureSection 
          preferredName={formData.preferred_name} 
          legalFirstName={formData.legal_first_name} 
          onAvatarUpload={handleAvatarUpload} 
        />
        <QuickStatsSection user={user} formData={formData} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Edit3 className="w-5 h-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <PersonalInfoSection formData={formData} errors={errors} onInputChange={handleInputChange} />
              <ProfessionalInfoSection formData={formData} errors={errors} onInputChange={handleInputChange} />
              <ContactLocationSection formData={formData} onInputChange={handleInputChange} />
              <OnlinePresenceSection formData={formData} errors={errors} onInputChange={handleInputChange} />
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-600">
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfileTab;