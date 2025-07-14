import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Building, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { validatePhoneNumber, getPhoneValidationError } from '@/lib/phoneValidation';
import { validateABNFormat, getABNValidationError } from '@/lib/abnValidation';
import { validateACNFormat, getACNValidationError } from '@/lib/acnValidation';

import BrandingSection from '@/components/Settings/Business/BrandingSection';
import BasicInfoSection from '@/components/Settings/Business/BasicInfoSection';
import LegalInfoSection from '@/components/Settings/Business/LegalInfoSection';
import DefaultSettingsSection from '@/components/Settings/Business/DefaultSettingsSection';
import DocumentNumberingSection from '@/components/Settings/Business/DocumentNumberingSection';

const BusinessTab = ({ teamSettings, onSettingsUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    team_name: '',
    team_description: '',
    team_logo_url: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    business_website: '',
    business_abn: '',
    business_acn: '',
    default_currency: 'AUD',
    default_language: 'en',
    invoice_prefix: 'INV',
    proposal_prefix: 'PROP',
    lead_prefix: 'LEAD'
  });
  const [errors, setErrors] = useState({});

  const isFullAdmin = user?.role === 'full_admin';

  useEffect(() => {
    if (teamSettings) {
      setFormData({
        team_name: teamSettings.team_name || '',
        team_description: teamSettings.team_description || '',
        team_logo_url: teamSettings.team_logo_url || '',
        business_address: teamSettings.business_address || '',
        business_phone: teamSettings.business_phone || '',
        business_email: teamSettings.business_email || '',
        business_website: teamSettings.business_website || '',
        business_abn: teamSettings.business_abn || '',
        business_acn: teamSettings.business_acn || '',
        default_currency: teamSettings.default_currency || 'AUD',
        default_language: teamSettings.default_language || 'en',
        invoice_prefix: teamSettings.invoice_prefix || 'INV',
        proposal_prefix: teamSettings.proposal_prefix || 'PROP',
        lead_prefix: teamSettings.lead_prefix || 'LEAD'
      });
    }
  }, [teamSettings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.team_name.trim()) newErrors.team_name = 'Team name is required';
    if (formData.business_email && formData.business_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.business_email)) newErrors.business_email = 'Please enter a valid email address';
    }
    const phoneError = getPhoneValidationError(formData.business_phone);
    if (phoneError) newErrors.business_phone = phoneError;
    const abnError = getABNValidationError(formData.business_abn);
    if (abnError) newErrors.business_abn = abnError;
    const acnError = getACNValidationError(formData.business_acn);
    if (acnError) newErrors.business_acn = acnError;
    if (formData.business_website && formData.business_website.trim()) {
      try { new URL(formData.business_website); } 
      catch { newErrors.business_website = 'Please enter a valid URL (e.g., https://example.com)'; }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isFullAdmin) {
      toast({ title: 'Access Denied', description: 'Only team managers can update business settings.', variant: 'destructive' });
      return;
    }
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors in the form before submitting.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const settingsData = {
        team_id: user.team_id,
        ...formData,
        team_description: formData.team_description || null,
        team_logo_url: formData.team_logo_url || null,
        business_address: formData.business_address || null,
        business_phone: formData.business_phone || null,
        business_email: formData.business_email || null,
        business_website: formData.business_website || null,
        business_abn: formData.business_abn || null,
        business_acn: formData.business_acn || null,
        created_by: user.id
      };
      const { error } = await supabase.from('team_settings').upsert(settingsData, { onConflict: 'team_id' });
      if (error) throw error;
      toast({ title: 'Success', description: 'Business settings updated successfully!' });
      onSettingsUpdate();
    } catch (error) {
      toast({ title: 'Error', description: `Failed to update business settings: ${error.message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = () => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "Logo upload isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 5000,
    });
  };

  if (!isFullAdmin) {
    return (
      <div className="text-center py-20">
        <Building className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg mb-2">Access Restricted</p>
        <p className="text-slate-500">Only team managers can access business settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BrandingSection logoUrl={formData.team_logo_url} onLogoUpload={handleLogoUpload} />
      <BasicInfoSection formData={formData} errors={errors} onInputChange={handleInputChange} />
      <LegalInfoSection formData={formData} errors={errors} onInputChange={handleInputChange} />
      <DefaultSettingsSection formData={formData} onInputChange={handleInputChange} />
      <DocumentNumberingSection formData={formData} onInputChange={handleInputChange} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Business Settings'}
        </Button>
      </motion.div>
    </div>
  );
};

export default BusinessTab;