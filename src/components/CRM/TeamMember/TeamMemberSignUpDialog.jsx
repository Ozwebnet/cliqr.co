import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { UserPlus, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabaseClient';
import { validatePassword } from '@/lib/passwordUtils.jsx';
import { getABNValidationError, cleanABNInput } from '@/lib/abnValidation.js';
import { getACNValidationError, cleanACNInput } from '@/lib/acnValidation.js';
import { getBSBValidationError, cleanBSBInput, getAccountNumberValidationError, cleanAccountNumberInput } from '@/lib/bankingValidation.js';
import { getPhoneValidationError, cleanPhoneInput } from '@/lib/phoneValidation.js';
import { PersonalInfoSection, BusinessLegalSection, PaymentInfoSection, SkillsRoleSection, AccountSecuritySection, AgreementsSection } from './FormSections';
import { MemoizedInputField } from './FormComponents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TeamMemberSignUpDialog = ({ onUserAdded }) => {
  const [open, setOpen] = useState(false);
  const initialFormData = {
    legal_first_name: '',
    legal_middle_name: '',
    legal_last_name: '',
    preferred_name: '',
    email: '',
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
    password: '',
    confirmPassword: '',
    role: 'admin',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [abnError, setAbnError] = useState('');
  const [acnError, setAcnError] = useState('');
  const [bsbError, setBsbError] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const [activeTab, setActiveTab] = useState('manual');
  const [inviteEmail, setInviteEmail] = useState('');

  const { user, createUserByAdmin, loading } = useAuth(); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employmentTypes = [ { value: "contractor", label: "Contractor/Freelancer" }, { value: "employee", label: "Employee" }, { value: "intern", label: "Intern" }];
  const skillOptions = [ { value: "web_development", label: "Web Development" }, { value: "graphic_design", label: "Graphic Design" }, { value: "seo", label: "SEO" }, { value: "copywriting", label: "Copywriting" }, { value: "ai_automations", label: "AI Automations" }, { value: "video_editing", label: "Video Editing" }, { value: "social_media", label: "Social Media Management" }, { value: "content_creation", label: "Content Creation" }, { value: "ui_ux_design", label: "UI/UX Design" }, { value: "mobile_development", label: "Mobile Development" }, { value: "data_analysis", label: "Data Analysis" }, { value: "project_management", label: "Project Management" }, { value: "digital_marketing", label: "Digital Marketing" }, { value: "photography", label: "Photography" }, { value: "branding", label: "Branding" }];

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    if (id === 'abn') { setFormData(p => ({ ...p, [id]: cleanABNInput(value) })); setAbnError(getABNValidationError(cleanABNInput(value)) || ''); }
    else if (id === 'acn') { setFormData(p => ({ ...p, [id]: cleanACNInput(value) })); setAcnError(getACNValidationError(cleanACNInput(value)) || ''); }
    else if (id === 'bsb_number') { setFormData(p => ({ ...p, [id]: cleanBSBInput(value) })); setBsbError(getBSBValidationError(cleanBSBInput(value)) || ''); }
    else if (id === 'account_number') { setFormData(p => ({ ...p, [id]: cleanAccountNumberInput(value) })); setAccountNumberError(getAccountNumberValidationError(cleanAccountNumberInput(value)) || ''); }
    else if (id === 'phone_number') { setFormData(p => ({ ...p, [id]: cleanPhoneInput(value) })); setPhoneError(getPhoneValidationError(cleanPhoneInput(value)) || ''); }
    else { setFormData((prev) => ({ ...prev, [id]: value })); }
  }, []);
  const handleSelectChange = useCallback((id, value) => setFormData((prev) => ({ ...prev, [id]: value })), []);
  const handleMultiSelectChange = useCallback((id, values) => setFormData((prev) => ({ ...prev, [id]: values })), []);
  const handlePasteConfirmPassword = (e) => { e.preventDefault(); toast({ title: "Paste Disabled", description: "For security, pasting is disabled.", variant: "destructive", duration: 3000 }); };
  const userDetailsForPasswordValidation = useMemo(() => ({ email: formData.email, legal_first_name: formData.legal_first_name, legal_middle_name: formData.legal_middle_name, legal_last_name: formData.legal_last_name, preferred_name: formData.preferred_name }), [formData.email, formData.legal_first_name, formData.legal_middle_name, formData.legal_last_name, formData.preferred_name]);
  useEffect(() => { setPasswordErrors(formData.password ? validatePassword(formData.password, userDetailsForPasswordValidation) : []); }, [formData.password, userDetailsForPasswordValidation]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordErrors([]);
    setAbnError(''); setAcnError(''); setBsbError(''); setAccountNumberError(''); setPhoneError('');
    setActiveTab('manual');
    setInviteEmail('');
  }, [initialFormData]);

  const handleSubmit = async () => {
    if (abnError || acnError || bsbError || accountNumberError || phoneError || formData.password !== formData.confirmPassword || passwordErrors.length > 0) {
      toast({ title: 'Error', description: 'Please fix all form errors.', variant: 'destructive' }); return;
    }
    if (formData.employment_type === 'contractor' && !formData.abn) {
      toast({ title: 'Missing Information', description: 'ABN is required for contractors.', variant: 'destructive' }); return;
    }

    setIsSubmitting(true);
    const submissionData = { ...formData, preferred_name: formData.preferred_name || formData.legal_first_name, business_name: user?.business_name || 'Independent Contractor', position_job_title: formData.skill_set.length > 0 ? formData.skill_set.join(', ') : 'Team Member', preferred_contact_method: 'email', skill_set: formData.skill_set.join(',') };
    const newUser = await createUserByAdmin(submissionData);
    if (newUser) {
      if (onUserAdded) onUserAdded();
      setOpen(false); resetForm();
    }
    setIsSubmitting(false);
  };
  
  const handleInviteSubmit = async () => {
    if (!inviteEmail) {
      toast({ title: 'Email Required', description: 'Please enter an email address to send an invitation.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-invite-user', {
        body: JSON.stringify({ email: inviteEmail, role: 'admin' }),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({ title: 'Invitation Sent!', description: `An invitation email has been sent to ${inviteEmail}.`, variant: 'success' });
      if (onUserAdded) onUserAdded();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Invitation Failed', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = useCallback(() => setShowPassword(p => !p), []);
  const toggleShowConfirmPassword = useCallback(() => setShowConfirmPassword(p => !p), []);
  const isContractor = formData.employment_type === 'contractor';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isSubmitting) { setOpen(isOpen); if(!isOpen) resetForm(); }}}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
          <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white overflow-y-auto max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0 text-center">
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
             {activeTab === 'manual' ? 'Onboard New Team Member' : 'Invite New Team Member'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {activeTab === 'manual' 
              ? `Manually create an account for a new team member. Fields marked with a * are required.`
              : `Send an email invitation for a new team member to create their own account.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
           <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Create Manually</TabsTrigger>
              <TabsTrigger value="invite">Invite via Email</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="manual">
            <div className="p-6 space-y-6">
              <PersonalInfoSection formData={formData} handleChange={handleChange} handleSelectChange={handleSelectChange} phoneError={phoneError} />
              <BusinessLegalSection formData={formData} handleChange={handleChange} handleSelectChange={handleSelectChange} employmentTypes={employmentTypes} isContractor={isContractor} abnError={abnError} acnError={acnError} />
              {isContractor && <PaymentInfoSection formData={formData} handleChange={handleChange} handleSelectChange={handleSelectChange} bsbError={bsbError} accountNumberError={accountNumberError} />}
              <SkillsRoleSection formData={formData} handleChange={handleChange} handleMultiSelectChange={handleMultiSelectChange} skillOptions={skillOptions} />
              <AccountSecuritySection formData={formData} handleChange={handleChange} showPassword={showPassword} showConfirmPassword={showConfirmPassword} toggleShowPassword={toggleShowPassword} toggleShowConfirmPassword={toggleShowConfirmPassword} userDetailsForPasswordValidation={userDetailsForPasswordValidation} handlePasteConfirmPassword={handlePasteConfirmPassword} />
              <AgreementsSection />
            </div>
            <DialogFooter className="p-6 pt-0">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }} disabled={isSubmitting || loading}>Cancel</Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting || loading || passwordErrors.length > 0 || formData.password !== formData.confirmPassword || !!abnError || !!acnError || !!bsbError || !!accountNumberError || !!phoneError} className="bg-gradient-to-r from-orange-500 to-red-600">
                {isSubmitting || loading ? 'Creating...' : 'Create Account'}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="invite">
            <div className="p-6 space-y-6">
              <div className="space-y-4 py-4">
                <h2 className="text-xl font-semibold text-purple-300 mb-4">📧 Invite via Email</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <p className="text-slate-400 text-sm md:col-span-2">An invitation link will be sent to the specified email address. The user will be prompted to set up their own account and password. Their role will be set to 'Admin'.</p>
                  <MemoizedInputField id="invite_email" label="Team Member Email" type="email" icon={<Mail />} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="teammember@example.com" isRequired className="md:col-span-2"/>
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 pt-0">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }} disabled={isSubmitting || loading}>Cancel</Button>
              <Button onClick={handleInviteSubmit} disabled={isSubmitting || loading || !inviteEmail} className="bg-gradient-to-r from-orange-500 to-red-600">
                {isSubmitting || loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberSignUpDialog;