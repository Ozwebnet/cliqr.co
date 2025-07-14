import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select.jsx';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, User, Briefcase, Phone, BadgeInfo as BuildingIcon, Landmark, Clock, MessageCircle, UserCog } from 'lucide-react';
import { validatePassword, PasswordStrengthIndicator } from '@/lib/passwordUtils.jsx';
import { validateABNFormat, getABNValidationError, cleanABNInput } from '@/lib/abnValidation.js';
import { validateACNFormat, getACNValidationError, cleanACNInput } from '@/lib/acnValidation.js';
import { validateAustralianPhoneFormat, getPhoneValidationError, cleanPhoneInput } from '@/lib/phoneValidation.js';

const FormSection = ({ title, children }) => (
  <div className="space-y-4 py-4 border-b border-slate-700 last:border-b-0">
    <h2 className="text-xl font-semibold text-purple-300 mb-4">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {children}
    </div>
  </div>
);

const MemoizedInputField = React.memo(({ id, label, type = 'text', icon, value, onChange, placeholder, isRequired = false, className = '', onPaste, error, description }) => (
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
        className={`bg-slate-800 border-slate-600 text-white pl-3 pr-3 py-2 h-10 ${error ? 'border-red-500' : ''}`}
        required={isRequired}
        onPaste={onPaste}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
));

const MemoizedSelectField = React.memo(({ id, label, icon, value, onValueChange, placeholder, options, isRequired = false, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
      {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
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

const SignUpForm = () => {
  const [formData, setFormData] = useState({
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
    time_zone: '',
    preferred_contact_method: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [abnError, setAbnError] = useState('');
  const [acnError, setAcnError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const australianTimeZones = [
    { value: "Australia/Sydney", label: "AEDT - Sydney, Melbourne, Canberra, Hobart" },
    { value: "Australia/Adelaide", label: "ACDT - Adelaide" },
    { value: "Australia/Brisbane", label: "AEST - Brisbane" },
    { value: "Australia/Darwin", label: "ACST - Darwin" },
    { value: "Australia/Perth", label: "AWST - Perth" },
    { value: "Australia/Eucla", label: "ACWST - Eucla" },
    { value: "Australia/Lord_Howe", label: "LHST - Lord Howe Island" },
  ];

  const contactMethods = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone Call" },
    { value: "sms", label: "SMS / Text Message" },
  ];

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    
    if (id === 'abn') {
      // Clean ABN input and validate
      const cleanValue = cleanABNInput(value);
      setFormData((prev) => ({ ...prev, [id]: cleanValue }));
      
      // Validate ABN in real-time
      const error = getABNValidationError(cleanValue);
      setAbnError(error || '');
    } else if (id === 'acn') {
      // Clean ACN input and validate
      const cleanValue = cleanACNInput(value);
      setFormData((prev) => ({ ...prev, [id]: cleanValue }));
      
      // Validate ACN in real-time
      const error = getACNValidationError(cleanValue);
      setAcnError(error || '');
    } else if (id === 'phone_number') {
      // Clean phone input and validate
      const cleanValue = cleanPhoneInput(value);
      setFormData((prev) => ({ ...prev, [id]: cleanValue }));
      
      // Validate phone in real-time
      const error = getPhoneValidationError(cleanValue);
      setPhoneError(error || '');
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
      description: "For security, pasting is disabled in the confirm password field. Please type your password.",
      variant: "destructive",
      duration: 3000,
    });
  };

  const userDetailsForPasswordValidation = React.useMemo(() => ({
    email: formData.email,
    legal_first_name: formData.legal_first_name,
    legal_middle_name: formData.legal_middle_name,
    legal_last_name: formData.legal_last_name,
    preferred_name: formData.preferred_name,
  }), [formData.email, formData.legal_first_name, formData.legal_middle_name, formData.legal_last_name, formData.preferred_name]);

  useEffect(() => {
    if (formData.password) {
      const errors = validatePassword(formData.password, userDetailsForPasswordValidation);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  }, [formData.password, userDetailsForPasswordValidation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for ABN validation errors
    if (abnError) {
      toast({ title: 'ABN Error', description: abnError, variant: 'destructive' });
      return;
    }
    
    // Check for ACN validation errors
    if (acnError) {
      toast({ title: 'ACN Error', description: acnError, variant: 'destructive' });
      return;
    }
    
    // Check for phone validation errors
    if (phoneError) {
      toast({ title: 'Phone Number Error', description: phoneError, variant: 'destructive' });
      return;
    }
    
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
    
    const submissionData = {
      ...formData,
      preferred_name: formData.preferred_name || formData.legal_first_name,
    };
    
    const user = await signUp(submissionData);
    if (user) {
      navigate('/'); 
    }
  };

  const toggleShowPassword = useCallback(() => setShowPassword(prev => !prev), []);
  const toggleShowConfirmPassword = useCallback(() => setShowConfirmPassword(prev => !prev), []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-12">
      <Card className="w-full max-w-3xl bg-slate-800/80 backdrop-blur-md border-slate-700 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Create Your Cliqr Account
          </CardTitle>
          <CardDescription className="text-slate-400">
            Join the future of client management. Fields marked with a <span className="text-red-500 font-semibold">*</span> are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Contact Information">
              <MemoizedInputField id="legal_first_name" label="Legal First Name" icon={<User />} value={formData.legal_first_name} onChange={handleChange} placeholder="Enter your legal first name" isRequired/>
              <MemoizedInputField id="legal_middle_name" label="Legal Middle Name" icon={<User />} value={formData.legal_middle_name} onChange={handleChange} placeholder="Required if applicable" />
              <MemoizedInputField id="legal_last_name" label="Legal Last Name" icon={<User />} value={formData.legal_last_name} onChange={handleChange} placeholder="Enter your legal last name" isRequired/>
              <MemoizedInputField id="preferred_name" label="Preferred Name" icon={<User />} value={formData.preferred_name} onChange={handleChange} placeholder="Optional" />
              <MemoizedInputField id="email" label="Email Address" type="email" icon={<Mail />} value={formData.email} onChange={handleChange} placeholder="you@example.com" isRequired/>
              <MemoizedInputField 
                id="phone_number" 
                label="Phone Number" 
                type="tel" 
                icon={<Phone />} 
                value={formData.phone_number} 
                onChange={handleChange} 
                placeholder="Enter your Australian phone number (e.g., 0412345678)" 
                isRequired
                description="Enter your Australian phone number (mobile or landline), e.g. 0412345678 or 0298765432. No spaces or symbols."
                error={phoneError}
              />
              <MemoizedInputField id="position_job_title" label="Position / Job Title" icon={<UserCog />} value={formData.position_job_title} onChange={handleChange} placeholder="e.g., Owner, Marketing Lead" isRequired/>
            </FormSection>

            <FormSection title="Business Details">
              <MemoizedInputField id="business_name" label="Business Name" icon={<BuildingIcon />} value={formData.business_name} onChange={handleChange} placeholder="Your company's name" isRequired className="md:col-span-2"/>
              <MemoizedInputField 
                id="abn" 
                label="ABN" 
                icon={<Landmark />} 
                value={formData.abn} 
                onChange={handleChange} 
                placeholder="Enter your 11-digit ABN (e.g., 51824753556)"
                description="Enter your 11-digit ABN (e.g., 51824753556). No spaces or letters."
                error={abnError}
              />
              {formData.abn && (
                <MemoizedInputField 
                  id="acn" 
                  label="ACN" 
                  icon={<Landmark />} 
                  value={formData.acn} 
                  onChange={handleChange} 
                  placeholder="Enter your 9-digit ACN (e.g., 123456789)"
                  description="Enter your 9-digit ACN (e.g., 123456789). No letters or spaces."
                  error={acnError}
                />
              )}
            </FormSection>

            <FormSection title="Preferences">
               <MemoizedSelectField 
                id="time_zone" 
                label="Time Zone" 
                icon={<Clock />} 
                value={formData.time_zone} 
                onValueChange={(value) => handleSelectChange('time_zone', value)}
                options={australianTimeZones}
                placeholder="Select your time zone"
                isRequired
              />
              <MemoizedSelectField 
                id="preferred_contact_method" 
                label="Preferred Contact Method" 
                icon={<MessageCircle />} 
                value={formData.preferred_contact_method} 
                onValueChange={(value) => handleSelectChange('preferred_contact_method', value)}
                options={contactMethods}
                placeholder="Select preferred contact"
                isRequired
              />
            </FormSection>
            
            <FormSection title="Account Security">
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

            <Button type="submit" disabled={loading || passwordErrors.length > 0 || formData.password !== formData.confirmPassword || abnError || acnError || phoneError} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg py-3 mt-6">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center block mt-4">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/" className="font-medium text-purple-400 hover:text-purple-300">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpForm;