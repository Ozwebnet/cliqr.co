import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import LoadingBar from '@/components/ui/LoadingBar';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Globe, 
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { 
  validateInvitationToken, 
  submitInviteeForm, 
  getFormFieldsForRole,
  validateFormData,
  ROLE_FORM_FIELDS 
} from '@/lib/invitationSchema';

import { validateAustralianPhoneFormat, cleanPhoneInput } from '@/lib/phoneValidation';
import { validateABNFormat, cleanABNInput } from '@/lib/abnValidation';
import { validateACNFormat, cleanACNInput } from '@/lib/acnValidation';

const InvitationOnboardingForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Invalid Link',
        description: 'No invitation token found in the URL.',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }

    validateAndLoadInvitation();
  }, [token, navigate]);

  const validateAndLoadInvitation = async () => {
    setLoading(true);
    
    try {
      const result = await validateInvitationToken(token);
      
      if (!result.valid) {
        toast({
          title: 'Invalid Invitation',
          description: result.error || 'This invitation link is invalid or has expired.',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }

      setInvitation(result.invitation);
      initializeFormData(result.invitation);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to validate invitation. Please try again.',
        variant: 'destructive'
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (invitation) => {
    const publicFields = getFormFieldsForRole(invitation.role, 'public');
    const initialData = {
      email: invitation.email, // Pre-fill email
    };
    
    publicFields.forEach(field => {
      if (field !== 'email') {
        initialData[field] = '';
      }
    });

    setFormData(initialData);
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const validateField = (field, value) => {
    switch (field) {
      case 'phone_number':
        if (value && !validateAustralianPhoneFormat(value)) {
          return 'Please enter a valid Australian phone number';
        }
        break;
      case 'abn':
        if (value && !validateABNFormat(value)) {
          return 'Please enter a valid ABN';
        }
        break;
      case 'acn':
        if (value && !validateACNFormat(value)) {
          return 'Please enter a valid ACN';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
    }
    return null;
  };

  const handleBlur = (field, value) => {
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const publicFields = getFormFieldsForRole(invitation.role, 'public');
    const requiredFields = publicFields.filter(field => field !== 'legal_middle_name'); // Middle name is optional
    
    // Validate required fields
    const validationErrors = validateFormData(formData, requiredFields);
    if (validationErrors.length > 0) {
      toast({
        title: 'Missing Information',
        description: validationErrors[0],
        variant: 'destructive'
      });
      return;
    }

    // Validate individual field formats
    const fieldErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        fieldErrors[field] = error;
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast({
        title: 'Validation Errors',
        description: 'Please fix the highlighted errors before submitting.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      // Clean and format data
      const cleanedData = { ...formData };
      if (cleanedData.phone_number) {
        cleanedData.phone_number = cleanPhoneInput(cleanedData.phone_number);
      }
      if (cleanedData.abn) {
        cleanedData.abn = cleanABNInput(cleanedData.abn);
      }
      if (cleanedData.acn) {
        cleanedData.acn = cleanACNInput(cleanedData.acn);
      }

      const result = await submitInviteeForm(token, cleanedData);
      
      if (result.success) {
        toast({
          title: 'Form Submitted Successfully!',
          description: 'Thank you for completing your information. A team manager will review and finalize your account.',
          variant: 'success'
        });
        
        // Show success page
        setSubmitting(false);
        // Could redirect to a thank you page or show success state
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'An error occurred while submitting your information.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormField = (field) => {
    const value = formData[field] || '';
    const error = errors[field];
    const isRequired = field !== 'legal_middle_name';

    const fieldConfig = {
      legal_first_name: { label: 'First Name', icon: User, type: 'text', placeholder: 'Enter your first name' },
      legal_middle_name: { label: 'Middle Name', icon: User, type: 'text', placeholder: 'Enter your middle name (optional)' },
      legal_last_name: { label: 'Last Name', icon: User, type: 'text', placeholder: 'Enter your last name' },
      preferred_name: { label: 'Preferred Name', icon: User, type: 'text', placeholder: 'How would you like to be called?' },
      phone_number: { label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '0412 345 678' },
      business_name: { label: 'Business Name', icon: Building, type: 'text', placeholder: 'Your business or company name' },
      position_job_title: { label: 'Position/Job Title', icon: Briefcase, type: 'text', placeholder: 'Your role or position' },
      employment_type: { label: 'Employment Type', icon: Briefcase, type: 'select', options: [
        { value: 'contractor', label: 'Contractor/Freelancer' },
        { value: 'employee', label: 'Employee' },
        { value: 'intern', label: 'Intern' }
      ]},
      portfolio_url: { label: 'Portfolio URL', icon: Globe, type: 'url', placeholder: 'https://your-portfolio.com' },
      social_profiles: { label: 'Social Profiles', icon: Globe, type: 'textarea', placeholder: 'LinkedIn, GitHub, etc.' },
      abn: { label: 'ABN', icon: FileText, type: 'text', placeholder: '12 345 678 901' },
      acn: { label: 'ACN', icon: FileText, type: 'text', placeholder: '123 456 789' },
      preferred_contact_method: { label: 'Preferred Contact Method', icon: Mail, type: 'select', options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone Call' },
        { value: 'sms', label: 'SMS/Text Message' }
      ]}
    };

    const config = fieldConfig[field];
    if (!config) return null;

    const Icon = config.icon;

    if (config.type === 'select') {
      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field} className="text-slate-300 flex items-center">
            <Icon className="w-4 h-4 mr-2" />
            {config.label}
            {isRequired && <span className="text-red-400 ml-1">*</span>}
          </Label>
          <Select value={value} onValueChange={(newValue) => handleInputChange(field, newValue)}>
            <SelectTrigger className={`bg-slate-800 border-slate-600 text-white ${error ? 'border-red-500' : ''}`}>
              <SelectValue placeholder={`Select ${config.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {config.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      );
    }

    if (config.type === 'textarea') {
      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field} className="text-slate-300 flex items-center">
            <Icon className="w-4 h-4 mr-2" />
            {config.label}
            {isRequired && <span className="text-red-400 ml-1">*</span>}
          </Label>
          <Textarea
            id={field}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            onBlur={(e) => handleBlur(field, e.target.value)}
            placeholder={config.placeholder}
            className={`bg-slate-800 border-slate-600 text-white placeholder-slate-400 ${error ? 'border-red-500' : ''}`}
            rows={3}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      );
    }

    return (
      <div key={field} className="space-y-2">
        <Label htmlFor={field} className="text-slate-300 flex items-center">
          <Icon className="w-4 h-4 mr-2" />
          {config.label}
          {isRequired && <span className="text-red-400 ml-1">*</span>}
        </Label>
        <Input
          id={field}
          type={config.type}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onBlur={(e) => handleBlur(field, e.target.value)}
          placeholder={config.placeholder}
          disabled={field === 'email'} // Email is pre-filled and disabled
          className={`bg-slate-800 border-slate-600 text-white placeholder-slate-400 ${error ? 'border-red-500' : ''} ${field === 'email' ? 'opacity-70' : ''}`}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingBar text="Loading invitation..." />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Invalid Invitation</h2>
            <p className="text-slate-400">This invitation link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const publicFields = getFormFieldsForRole(invitation.role, 'public');
  const roleDisplayName = invitation.role === 'client' ? 'Client' : 'Team Member';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Complete Your {roleDisplayName} Profile
              </CardTitle>
              <CardDescription className="text-slate-400">
                Welcome! Please fill out your information below. A team manager will review and finalize your account.
              </CardDescription>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  1
                </div>
                <div className="w-16 h-0.5 bg-slate-600"></div>
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-400 text-sm font-semibold">
                  2
                </div>
                <div className="w-16 h-0.5 bg-slate-600"></div>
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-400 text-sm font-semibold">
                  3
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Step 1: Complete Form • Step 2: Manager Review • Step 3: Account Activation
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publicFields.map(field => renderFormField(field))}
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit for Review
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitationOnboardingForm; 