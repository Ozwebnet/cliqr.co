import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabaseClient';
import { validateABNFormat, getABNValidationError, cleanABNInput } from '@/lib/abnValidation.js';
import { validateACNFormat, getACNValidationError, cleanACNInput } from '@/lib/acnValidation.js';
import { validateBSBFormat, getBSBValidationError, cleanBSBInput, validateAccountNumberFormat, getAccountNumberValidationError, cleanAccountNumberInput } from '@/lib/bankingValidation.js';
import { validateAustralianPhoneFormat, getPhoneValidationError, cleanPhoneInput } from '@/lib/phoneValidation.js';
import { PersonalInfoSection, BusinessLegalSection, PaymentInfoSection, SkillsRoleSection, AgreementsSection } from '@/components/CRM/TeamMember/FormSections';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingBar from '@/components/ui/LoadingBar';

const OnboardingForm = () => {
  const { user, loading: authLoading, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  const initialFormData = useMemo(() => ({
    legal_first_name: '',
    legal_middle_name: '',
    legal_last_name: '',
    preferred_name: '',
    email: user?.email || '',
    phone_number: '',
    employment_type: 'contractor',
    abn: '',
    acn: '',
    portfolio_url: '',
    social_profiles: '',
    bank_account_name: '',
    bsb_number: '',
    account_number: '',
    skill_set: [],
    hourly_rate: '',
    role: user?.role || 'client',
  }), [user]);

  const [formData, setFormData] = useState(initialFormData);
  const [abnError, setAbnError] = useState('');
  const [acnError, setAcnError] = useState('');
  const [bsbError, setBsbError] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        role: user.role,
      }));
    }
  }, [user]);

  const employmentTypes = [
    { value: "contractor", label: "Contractor/Freelancer" },
    { value: "employee", label: "Employee" },
    { value: "intern", label: "Intern" },
  ];
  
  const skillOptions = [
    { value: "web_development", label: "Web Development" },
    { value: "graphic_design", label: "Graphic Design" },
    { value: "seo", label: "SEO" },
    { value: "copywriting", label: "Copywriting" },
    { value: "ai_automations", label: "AI Automations" },
    { value: "video_editing", label: "Video Editing" },
    { value: "social_media", label: "Social Media Management" },
    { value: "content_creation", label: "Content Creation" },
    { value: "ui_ux_design", label: "UI/UX Design" },
    { value: "mobile_development", label: "Mobile Development" },
    { value: "data_analysis", label: "Data Analysis" },
    { value: "project_management", label: "Project Management" },
    { value: "digital_marketing", label: "Digital Marketing" },
    { value: "photography", label: "Photography" },
    { value: "branding", label: "Branding" },
  ];

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    if (id === 'abn') {
      const cleanValue = cleanABNInput(value);
      setFormData((prev) => ({ ...prev, [id]: cleanValue }));
      setAbnError(getABNValidationError(cleanValue) || '');
    } else if (id === 'acn') {
      const cleanValue = cleanACNInput(value);
      setFormData((prev) => ({ ...prev, [id]: cleanValue }));
      setAcnError(getACNValidationError(cleanValue) || '');
    } else if (id === 'bsb_number') {
      const cleanValue = cleanBSBInput(value);
      setFormData((prev) => ({ ...prev, [id]: cleanValue }));
      setBsbError(getBSBValidationError(cleanValue) || '');
    } else if (id === 'account_number') {
      const cleanValue = cleanAccountNumberInput(value);
      setFormData((prev) => ({ ...prev, [id]: cleanValue }));
      setAccountNumberError(getAccountNumberValidationError(cleanValue) || '');
    } else if (id === 'phone_number') {
      const cleanValue = cleanPhoneInput(value);
      setFormData((prev) => ({ ...prev, [id]: cleanValue }));
      setPhoneError(getPhoneValidationError(cleanValue) || '');
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  }, []);
  
  const handleSelectChange = useCallback((id, value) => setFormData((prev) => ({ ...prev, [id]: value })), []);
  const handleMultiSelectChange = useCallback((id, values) => setFormData((prev) => ({ ...prev, [id]: values })), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (abnError || acnError || bsbError || accountNumberError || phoneError) {
      toast({ title: 'Validation Error', description: 'Please fix the errors before submitting.', variant: 'destructive' });
      return;
    }
    if (formData.employment_type === 'contractor' && !formData.abn) {
      toast({ title: 'Missing Information', description: 'ABN is required for contractors.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const updates = {
      ...formData,
      name: formData.preferred_name || formData.legal_first_name,
      skill_set: formData.skill_set,
      status: 'active',
      updated_at: new Date().toISOString(),
    };
    delete updates.confirmPassword;
    delete updates.password;

    const { error } = await supabase.from('users').update(updates).eq('id', user.id);

    if (error) {
      toast({ title: 'Error', description: `Failed to update profile: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Profile Updated!', description: 'Welcome! Your dashboard is now ready.' });
      await refreshUserProfile();
      navigate('/');
    }
    setIsSubmitting(false);
  };
  
  const isContractor = formData.employment_type === 'contractor';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingBar text="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-slate-400">
            Just a few more details to get your account set up. Fields marked with <span className="text-red-500 font-semibold">*</span> are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 p-2">
            <PersonalInfoSection 
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              phoneError={phoneError}
            />
            
            <BusinessLegalSection 
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              employmentTypes={employmentTypes}
              isContractor={isContractor}
              abnError={abnError}
              acnError={acnError}
            />

            {isContractor && (
              <PaymentInfoSection 
                formData={formData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                bsbError={bsbError}
                accountNumberError={accountNumberError}
              />
            )}

            <SkillsRoleSection 
              formData={formData}
              handleChange={handleChange}
              handleMultiSelectChange={handleMultiSelectChange}
              skillOptions={skillOptions}
            />

            <AgreementsSection />

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || authLoading || abnError || acnError || bsbError || accountNumberError || phoneError}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white min-w-[150px]"
              >
                {isSubmitting || authLoading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;