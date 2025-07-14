import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { UserPlus, User, Mail, Phone, Briefcase as BuildingIcon, Landmark, MessageCircle, UserCog, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { validatePassword } from '@/lib/passwordUtils.jsx';
import { getABNValidationError, cleanABNInput } from '@/lib/abnValidation.js';
import { getACNValidationError, cleanACNInput } from '@/lib/acnValidation.js';
import { getPhoneValidationError, cleanPhoneInput } from '@/lib/phoneValidation.js';
import { supabase } from '@/lib/supabaseClient';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormSection from '@/components/CRM/AddUserDialog/FormSection';
import MemoizedInputField from '@/components/CRM/AddUserDialog/MemoizedInputField';
import MemoizedSelectField from '@/components/CRM/AddUserDialog/MemoizedSelectField';
import MemoizedPasswordField from '@/components/CRM/AddUserDialog/MemoizedPasswordField';


const AddUserDialog = ({ onUserAdded }) => {
  const [open, setOpen] = useState(false);
  const initialFormData = {
    legal_first_name: '',
    legal_middle_name: '',
    legal_last_name: '',
    preferred_name: '',
    email: '',
    phone_number: '',
    position_job_title: '',
    business_name: '',
    abn: '',
    acn: '',
    preferred_contact_method: '',
    password: '',
    confirmPassword: '',
    role: 'client',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [abnError, setAbnError] = useState('');
  const [acnError, setAcnError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const [activeTab, setActiveTab] = useState('manual');
  const [inviteEmail, setInviteEmail] = useState('');

  const { createUserByAdmin, loading, user: currentUser } = useAuth(); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactMethods = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone Call" },
    { value: "sms", label: "SMS / Text Message" },
  ];
  
  const userRoles = [
    { value: "client", label: "Client" },
    { value: "admin", label: "Admin" },
    { value: "full_admin", label: "Full Admin" },
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
    } else if (id === 'phone_number') {
      const cleanValue = cleanPhoneInput(value);
      setFormData((prev) => ({ ...prev, [id]: cleanValue }));
      setPhoneError(getPhoneValidationError(cleanValue) || '');
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  }, []);

  const handleSelectChange = useCallback((id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handlePasteConfirmPassword = (e) => {
    e.preventDefault();
    toast({
      title: "Paste Disabled",
      description: "For security, pasting is disabled in the confirm password field.",
      variant: "destructive",
      duration: 3000,
    });
  };

  const userDetailsForPasswordValidation = useMemo(() => ({
    email: formData.email,
    legal_first_name: formData.legal_first_name,
    legal_middle_name: formData.legal_middle_name,
    legal_last_name: formData.legal_last_name,
    preferred_name: formData.preferred_name,
  }), [formData.email, formData.legal_first_name, formData.legal_middle_name, formData.legal_last_name, formData.preferred_name]);

  useEffect(() => {
    if (formData.password) {
      setPasswordErrors(validatePassword(formData.password, userDetailsForPasswordValidation));
    } else {
      setPasswordErrors([]);
    }
  }, [formData.password, userDetailsForPasswordValidation]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordErrors([]);
    setAbnError('');
    setAcnError('');
    setPhoneError('');
    setActiveTab('manual');
    setInviteEmail('');
  }, [initialFormData]);

  const handleSubmit = async () => {
    if (abnError || acnError || phoneError) {
      toast({ title: 'Validation Error', description: 'Please fix the errors before submitting.', variant: 'destructive' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (passwordErrors.length > 0) {
      toast({ title: 'Password Issue', description: 'Please fix password issues before submitting.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const newUser = await createUserByAdmin({ ...formData, preferred_name: formData.preferred_name || formData.legal_first_name }, currentUser);
    if (newUser) {
      if (onUserAdded) onUserAdded();
      setOpen(false);
      resetForm();
    }
    setIsSubmitting(false);
  };
  
  const handleInviteSubmit = async () => {
    if (!inviteEmail) {
      toast({ title: 'Email Required', description: 'Please enter an email to send an invitation.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-invite-user', {
        body: JSON.stringify({ email: inviteEmail, role: 'client' }),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      toast({
        title: 'Invitation Sent!',
        description: `An invitation email has been sent to ${inviteEmail}.`,
        variant: 'success'
      });
      if (onUserAdded) onUserAdded();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Invitation Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = useCallback(() => setShowPassword(prev => !prev), []);
  const toggleShowConfirmPassword = useCallback(() => setShowConfirmPassword(prev => !prev), []);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isSubmitting) { setOpen(isOpen); if(!isOpen) resetForm(); }}}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white overflow-y-auto max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0 text-center">
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            {activeTab === 'manual' ? 'Add New Client' : 'Invite New Client'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {activeTab === 'manual' 
              ? `Add a new client to the system. Fields marked with a * are required.`
              : `Send an invitation email for a new client to join.`
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
              <FormSection title="Contact Information">
                <MemoizedInputField id="legal_first_name" label="Legal First Name" icon={<User />} value={formData.legal_first_name} onChange={handleChange} placeholder="User's legal first name" isRequired/>
                <MemoizedInputField id="legal_middle_name" label="Legal Middle Name" icon={<User />} value={formData.legal_middle_name} onChange={handleChange} placeholder="Required if applicable" />
                <MemoizedInputField id="legal_last_name" label="Legal Last Name" icon={<User />} value={formData.legal_last_name} onChange={handleChange} placeholder="User's legal last name" isRequired/>
                <MemoizedInputField id="preferred_name" label="Preferred Name" icon={<User />} value={formData.preferred_name} onChange={handleChange} placeholder="Optional" />
                <MemoizedInputField id="email" label="Email Address" type="email" icon={<Mail />} value={formData.email} onChange={handleChange} placeholder="user@example.com" isRequired/>
                <MemoizedInputField id="phone_number" label="Phone Number" type="tel" icon={<Phone />} value={formData.phone_number} onChange={handleChange} placeholder="e.g., 0412345678" isRequired description="Australian phone number." error={phoneError} />
                <MemoizedInputField id="position_job_title" label="Position / Job Title" icon={<UserCog />} value={formData.position_job_title} onChange={handleChange} placeholder="e.g., Owner, Manager" isRequired/>
              </FormSection>
              <FormSection title="Business Details">
                <MemoizedInputField id="business_name" label="Business Name" icon={<BuildingIcon />} value={formData.business_name} onChange={handleChange} placeholder="Company's name" isRequired className="md:col-span-2"/>
                <MemoizedInputField id="abn" label="ABN" icon={<Landmark />} value={formData.abn} onChange={handleChange} placeholder="11-digit ABN" error={abnError}/>
                {formData.abn && <MemoizedInputField id="acn" label="ACN" icon={<Landmark />} value={formData.acn} onChange={handleChange} placeholder="9-digit ACN" error={acnError}/>}
              </FormSection>
              <FormSection title="Preferences">
                <MemoizedSelectField id="preferred_contact_method" label="Preferred Contact Method" icon={<MessageCircle />} value={formData.preferred_contact_method} onValueChange={(v) => handleSelectChange('preferred_contact_method', v)} options={contactMethods} placeholder="Select preferred contact" isRequired className="md:col-span-2"/>
              </FormSection>
              <FormSection title="Account Security">
                <MemoizedPasswordField id="password" label="Password" icon={<Lock />} value={formData.password} onChange={handleChange} placeholder="Create a strong password" show={showPassword} toggleShow={toggleShowPassword} isRequired showIndicator={true} userDetailsForValidation={userDetailsForPasswordValidation} className="md:col-span-2"/>
                <MemoizedPasswordField id="confirmPassword" label="Confirm Password" icon={<ShieldCheck />} value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm the password" show={showConfirmPassword} toggleShow={toggleShowConfirmPassword} isRequired className="md:col-span-2" onPaste={handlePasteConfirmPassword}/>
              </FormSection>
            </div>
            <DialogFooter className="p-6 pt-0">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }} disabled={isSubmitting || loading}>Cancel</Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting || loading || passwordErrors.length > 0 || formData.password !== formData.confirmPassword || !!abnError || !!acnError || !!phoneError} className="bg-gradient-to-r from-blue-500 to-purple-600">
                {isSubmitting || loading ? 'Creating...' : 'Create Client'}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="invite">
            <div className="p-6 space-y-6">
              <FormSection title="Invite New Client via Email">
                <p className="text-slate-400 text-sm md:col-span-2">An invitation link will be sent to the specified email address. The user will be prompted to set up their own account and password. They will be automatically assigned the "Client" role.</p>
                <MemoizedInputField id="invite_email" label="Client Email Address" type="email" icon={<Mail />} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="client@example.com" isRequired className="md:col-span-2"/>
              </FormSection>
            </div>
            <DialogFooter className="p-6 pt-0">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }} disabled={isSubmitting || loading}>Cancel</Button>
              <Button onClick={handleInviteSubmit} disabled={isSubmitting || loading || !inviteEmail} className="bg-gradient-to-r from-green-500 to-blue-600">
                {isSubmitting || loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;