import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select.jsx';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { UserPlus, Eye, EyeOff, User, Mail, Phone, Clock, MessageCircle, UserCog, Lock, ShieldCheck, Briefcase, Globe, DollarSign, CreditCard, FileText, Upload, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { validatePassword, PasswordStrengthIndicator } from '@/lib/passwordUtils.jsx';

const FormSection = ({ title, children, className = '' }) => (
  <div className={`space-y-4 py-4 border-b border-slate-700 last:border-b-0 ${className}`}>
    <h2 className="text-xl font-semibold text-purple-300 mb-4">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {children}
    </div>
  </div>
);

const MemoizedInputField = React.memo(({ id, label, type = 'text', icon, value, onChange, placeholder, isRequired = false, className = '', onPaste, description }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
      {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {description && <p className="text-xs text-slate-400 mb-1">{description}</p>}
    <div className="relative flex items-center">
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-slate-800 border-slate-600 text-white pl-3 pr-3 py-2 h-10"
        required={isRequired}
        onPaste={onPaste}
      />
    </div>
  </div>
));

const MemoizedSelectField = React.memo(({ id, label, icon, value, onValueChange, placeholder, options, isRequired = false, className = '', description }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
      {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {description && <p className="text-xs text-slate-400 mb-1">{description}</p>}
    <Select onValueChange={onValueChange} value={value} required={isRequired}>
      <SelectTrigger id={id} className="w-full bg-slate-800 border-slate-600 text-white pl-3 pr-3 py-2 h-10">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
));

const MemoizedMultiSelectField = React.memo(({ id, label, icon, value, onValueChange, placeholder, options, isRequired = false, className = '', description }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedValues = value || [];

  const handleToggle = (optionValue) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    onValueChange(newValues);
  };

  const displayText = selectedValues.length > 0 
    ? `${selectedValues.length} skill${selectedValues.length > 1 ? 's' : ''} selected`
    : placeholder;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
        {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
        {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && <p className="text-xs text-slate-400 mb-1">{description}</p>}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-10"
        >
          <span className={selectedValues.length === 0 ? 'text-slate-400' : 'text-white'}>
            {displayText}
          </span>
          <span className="ml-2">▼</span>
        </Button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {options.map(option => (
              <div key={option.value} className="flex items-center p-2 hover:bg-slate-700">
                <Checkbox
                  id={`${id}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => handleToggle(option.value)}
                  className="mr-2"
                />
                <Label htmlFor={`${id}-${option.value}`} className="text-white text-sm cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

const MemoizedFileUploadField = React.memo(({ id, label, icon, placeholder, isRequired = false, className = '', description }) => {
  const handleFileUpload = () => {
    toast({
      title: "🚧 File Upload Not Implemented",
      description: "File upload functionality isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      variant: "default",
      duration: 3000,
    });
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
        {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
        {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && <p className="text-xs text-slate-400 mb-1">{description}</p>}
      <Button
        type="button"
        variant="outline"
        onClick={handleFileUpload}
        className="w-full justify-start bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700 h-10"
      >
        <Upload className="mr-2 h-4 w-4" />
        {placeholder}
      </Button>
    </div>
  );
});

const MemoizedPasswordField = React.memo(({ id, label, icon, value, onChange, placeholder, show, toggleShow, isRequired = false, showIndicator = false, userDetailsForValidation, className = '', onPaste }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
      {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <div className="relative flex items-center">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-slate-800 border-slate-600 text-white pl-3 pr-10 py-2 h-10"
        required={isRequired}
        onPaste={onPaste}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleShow}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-white"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </div>
    {showIndicator && value && (
       <PasswordStrengthIndicator password={value} userDetails={userDetailsForValidation} />
    )}
  </div>
));

const TeamMemberSignUpDialog = ({ onUserAdded }) => {
  const [open, setOpen] = useState(false);
  const initialFormData = {
    legal_first_name: '',
    legal_last_name: '',
    preferred_name: '',
    email: '',
    phone_number: '',
    time_zone: '',
    employment_type: 'contractor',
    abn: '',
    registered_business_name: '',
    portfolio_url: '',
    website_url: '',
    social_profiles: '',
    bank_account_name: '',
    bsb_number: '',
    account_number: '',
    payment_frequency: '',
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

  const { createUserByAdmin, loading } = useAuth(); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const globalTimeZones = [
    { value: "UTC", label: "UTC - Coordinated Universal Time" },
    { value: "America/New_York", label: "EST/EDT - Eastern Time (US)" },
    { value: "America/Chicago", label: "CST/CDT - Central Time (US)" },
    { value: "America/Denver", label: "MST/MDT - Mountain Time (US)" },
    { value: "America/Los_Angeles", label: "PST/PDT - Pacific Time (US)" },
    { value: "Europe/London", label: "GMT/BST - London" },
    { value: "Europe/Paris", label: "CET/CEST - Paris, Berlin" },
    { value: "Asia/Tokyo", label: "JST - Tokyo" },
    { value: "Asia/Shanghai", label: "CST - Shanghai, Beijing" },
    { value: "Asia/Kolkata", label: "IST - India Standard Time" },
    { value: "Australia/Sydney", label: "AEDT - Sydney, Melbourne" },
    { value: "Australia/Adelaide", label: "ACDT - Adelaide" },
    { value: "Australia/Brisbane", label: "AEST - Brisbane" },
    { value: "Australia/Darwin", label: "ACST - Darwin" },
    { value: "Australia/Perth", label: "AWST - Perth" },
  ];

  const employmentTypes = [
    { value: "contractor", label: "Contractor/Freelancer" },
    { value: "employee", label: "Employee" },
    { value: "intern", label: "Intern" },
  ];

  const paymentFrequencies = [
    { value: "weekly", label: "Weekly" },
    { value: "fortnightly", label: "Fortnightly" },
    { value: "monthly", label: "Monthly" },
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
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleSelectChange = useCallback((id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleMultiSelectChange = useCallback((id, values) => {
    setFormData((prev) => ({ ...prev, [id]: values }));
  }, []);

  const handlePasteConfirmPassword = (e) => {
    e.preventDefault();
    toast({
      title: "Paste Disabled",
      description: "For security, pasting is disabled in the confirm password field. Please type the password.",
      variant: "destructive",
      duration: 3000,
    });
  };

  const userDetailsForPasswordValidation = useMemo(() => ({
    email: formData.email,
    legal_first_name: formData.legal_first_name,
    legal_last_name: formData.legal_last_name,
    preferred_name: formData.preferred_name,
  }), [formData.email, formData.legal_first_name, formData.legal_last_name, formData.preferred_name]);

  useEffect(() => {
    if (formData.password) {
      const errors = validatePassword(formData.password, userDetailsForPasswordValidation);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  }, [formData.password, userDetailsForPasswordValidation]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordErrors([]);
  }, [initialFormData]);

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (passwordErrors.length > 0) {
       const errorMessages = passwordErrors.map(err => {
        if (err.includes("personal information")) return "Password should not contain personal information.";
        if (err.includes("repeated characters") || err.includes("common sequences")) return "Password should not contain 3+ repeated characters or common sequences.";
        return err; 
      });
      toast({ title: 'Password Issue', description: `Please fix password issues: ${errorMessages.join(' ')}`, variant: 'destructive' });
      return;
    }

    if (formData.employment_type === 'contractor' && !formData.abn) {
      toast({ title: 'Missing Information', description: 'ABN is required for contractors/freelancers.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const submissionData = {
      ...formData,
      preferred_name: formData.preferred_name || formData.legal_first_name,
      business_name: formData.registered_business_name || 'Independent Contractor',
      position_job_title: formData.skill_set.length > 0 ? formData.skill_set.join(', ') : 'Team Member',
      preferred_contact_method: 'email',
    };
    const newUser = await createUserByAdmin(submissionData);
    if (newUser) {
      if (onUserAdded) {
        onUserAdded();
      }
      setOpen(false);
      resetForm();
    }
    setIsSubmitting(false);
  };
  
  const toggleShowPassword = useCallback(() => setShowPassword(prev => !prev), []);
  const toggleShowConfirmPassword = useCallback(() => setShowConfirmPassword(prev => !prev), []);

  const isContractor = formData.employment_type === 'contractor';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isSubmitting) { setOpen(isOpen); if(!isOpen) resetForm(); }}}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white overflow-y-auto max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0 text-center">
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
            Join Our Team
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Sign-up for independent contractors joining our team. Fields marked with a <span className="text-red-500 font-semibold">*</span> are required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <FormSection title="👤 Personal Information">
            <MemoizedInputField 
              id="legal_first_name" 
              label="Legal First Name" 
              icon={<User />} 
              value={formData.legal_first_name} 
              onChange={handleChange} 
              placeholder="Enter legal first name" 
              isRequired
            />
            <MemoizedInputField 
              id="legal_last_name" 
              label="Legal Last Name" 
              icon={<User />} 
              value={formData.legal_last_name} 
              onChange={handleChange} 
              placeholder="Enter legal last name" 
              isRequired
            />
            <MemoizedInputField 
              id="preferred_name" 
              label="Preferred Name" 
              icon={<User />} 
              value={formData.preferred_name} 
              onChange={handleChange} 
              placeholder="Optional" 
            />
            <MemoizedInputField 
              id="email" 
              label="Email Address" 
              type="email" 
              icon={<Mail />} 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="your@email.com" 
              isRequired
            />
            <MemoizedInputField 
              id="phone_number" 
              label="Phone Number" 
              type="tel" 
              icon={<Phone />} 
              value={formData.phone_number} 
              onChange={handleChange} 
              placeholder="Your contact number" 
            />
            <MemoizedSelectField 
              id="time_zone" 
              label="Time Zone" 
              icon={<Clock />} 
              value={formData.time_zone} 
              onValueChange={(value) => handleSelectChange('time_zone', value)}
              options={globalTimeZones}
              placeholder="Select your time zone"
              isRequired
            />
          </FormSection>

          <FormSection title="🧾 Business & Legal">
            <MemoizedSelectField 
              id="employment_type" 
              label="Employment Type" 
              icon={<Briefcase />} 
              value={formData.employment_type} 
              onValueChange={(value) => handleSelectChange('employment_type', value)}
              options={employmentTypes}
              placeholder="Select employment type"
              isRequired
              className="md:col-span-2"
            />
            {isContractor && (
              <MemoizedInputField 
                id="abn" 
                label="ABN" 
                icon={<FileText />} 
                value={formData.abn} 
                onChange={handleChange} 
                placeholder="Australian Business Number" 
                isRequired
                description="Required for contractors/freelancers"
              />
            )}
            <MemoizedInputField 
              id="registered_business_name" 
              label="Registered Business Name" 
              icon={<Briefcase />} 
              value={formData.registered_business_name} 
              onChange={handleChange} 
              placeholder="Your business name (if applicable)" 
            />
            <MemoizedInputField 
              id="portfolio_url" 
              label="Portfolio URL" 
              icon={<Globe />} 
              value={formData.portfolio_url} 
              onChange={handleChange} 
              placeholder="https://yourportfolio.com" 
            />
            <MemoizedInputField 
              id="website_url" 
              label="Website URL" 
              icon={<Globe />} 
              value={formData.website_url} 
              onChange={handleChange} 
              placeholder="https://yourwebsite.com" 
            />
            <MemoizedInputField 
              id="social_profiles" 
              label="LinkedIn or Social Profiles" 
              icon={<MessageCircle />} 
              value={formData.social_profiles} 
              onChange={handleChange} 
              placeholder="LinkedIn, Twitter, etc. (comma-separated)" 
              className="md:col-span-2"
            />
          </FormSection>

          {isContractor && (
            <FormSection title="💸 Payment Information">
              <MemoizedInputField 
                id="bank_account_name" 
                label="Bank Account Name" 
                icon={<CreditCard />} 
                value={formData.bank_account_name} 
                onChange={handleChange} 
                placeholder="Account holder name" 
                isRequired
              />
              <MemoizedInputField 
                id="bsb_number" 
                label="BSB Number" 
                icon={<CreditCard />} 
                value={formData.bsb_number} 
                onChange={handleChange} 
                placeholder="123-456" 
                isRequired
              />
              <MemoizedInputField 
                id="account_number" 
                label="Account Number" 
                icon={<CreditCard />} 
                value={formData.account_number} 
                onChange={handleChange} 
                placeholder="Account number" 
                isRequired
              />
              <MemoizedSelectField 
                id="payment_frequency" 
                label="Payment Frequency Preference" 
                icon={<DollarSign />} 
                value={formData.payment_frequency} 
                onValueChange={(value) => handleSelectChange('payment_frequency', value)}
                options={paymentFrequencies}
                placeholder="Select payment frequency"
              />
              <MemoizedFileUploadField 
                id="invoice_template" 
                label="Upload Invoice Template" 
                icon={<Upload />} 
                placeholder="Choose file or drag & drop"
                className="md:col-span-2"
                description="Optional - Upload your preferred invoice template"
              />
            </FormSection>
          )}

          <FormSection title="📁 Skills & Role Info">
            <MemoizedMultiSelectField 
              id="skill_set" 
              label="Skill Set / Role Type" 
              icon={<Award />} 
              value={formData.skill_set} 
              onValueChange={(values) => handleMultiSelectChange('skill_set', values)}
              options={skillOptions}
              placeholder="Select your skills"
              isRequired
              className="md:col-span-2"
              description="Select all skills that apply to your expertise"
            />
            <MemoizedInputField 
              id="hourly_rate" 
              label="Hourly or Fixed Rate" 
              icon={<DollarSign />} 
              value={formData.hourly_rate} 
              onChange={handleChange} 
              placeholder="e.g., $50/hr or $1500/project" 
              className="md:col-span-2"
              description="Optional - Your preferred rate structure"
            />
          </FormSection>
          
          <FormSection title="🔐 Account Security">
              <MemoizedPasswordField 
                id="password" 
                label="Password" 
                icon={<Lock />} 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Create a strong password" 
                show={showPassword} 
                toggleShow={toggleShowPassword} 
                isRequired
                showIndicator={true}
                userDetailsForValidation={userDetailsForPasswordValidation}
                className="md:col-span-2"
              />
              <MemoizedPasswordField 
                id="confirmPassword" 
                label="Confirm Password" 
                icon={<ShieldCheck />} 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="Confirm your password" 
                show={showConfirmPassword} 
                toggleShow={toggleShowConfirmPassword} 
                isRequired
                className="md:col-span-2"
                onPaste={handlePasteConfirmPassword}
              />
          </FormSection>

          <FormSection title="📜 Agreements / Admin">
            <MemoizedFileUploadField 
              id="government_id" 
              label="Upload Government-Issued ID" 
              icon={<Upload />} 
              placeholder="Choose file or drag & drop"
              description="Optional - Driver's license, passport, etc."
            />
            <MemoizedFileUploadField 
              id="signed_agreement" 
              label="Upload Signed Agreement or NDA" 
              icon={<Upload />} 
              placeholder="Choose file or drag & drop"
              description="Optional - Any signed contracts or NDAs"
            />
          </FormSection>
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }} disabled={isSubmitting || loading} className="text-slate-300 border-slate-600 hover:bg-slate-700">Cancel</Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isSubmitting || loading || passwordErrors.length > 0 || formData.password !== formData.confirmPassword}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            {isSubmitting || loading ? 'Creating Account...' : 'Join Team'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberSignUpDialog;