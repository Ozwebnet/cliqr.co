import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  Globe,
  FileText,
  DollarSign,
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  UserCheck,
  Shield
} from 'lucide-react';

import { 
  completeManagerReview, 
  finalizeAccountCreation,
  getFormFieldsForRole,
  INVITATION_STATES 
} from '@/lib/invitationSchema';

import { useAuth } from '@/hooks/useAuth.jsx';
import { validatePassword, PasswordStrengthIndicator } from '@/lib/passwordUtils.jsx';

const InvitationReviewDialog = ({ open, onOpenChange, invitation, onInvitationUpdated }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Internal Fields, 3: Finalize
  const [managerFormData, setManagerFormData] = useState({});
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && invitation) {
      initializeManagerForm();
      generateStrongPassword();
      
      // Determine which step to start on based on invitation status
      if (invitation.status === INVITATION_STATES.PENDING_MANAGER_REVIEW) {
        setCurrentStep(1);
      } else if (invitation.status === INVITATION_STATES.PENDING_MANAGER_COMPLETION) {
        setCurrentStep(2);
        // Load existing manager data if available
        if (invitation.manager_form_data) {
          setManagerFormData(invitation.manager_form_data);
        }
      }
    }
  }, [open, invitation]);

  const initializeManagerForm = () => {
    const internalFields = getFormFieldsForRole(invitation?.role, 'internal');
    const initialData = {};
    
    internalFields.forEach(field => {
      switch (field) {
        case 'skill_set':
          initialData[field] = [];
          break;
        case 'client_priority':
          initialData[field] = 'medium';
          break;
        case 'permissions':
          initialData[field] = invitation?.role === 'admin' ? ['basic_access'] : [];
          break;
        default:
          initialData[field] = '';
      }
    });

    setManagerFormData(initialData);
  };

  const generateStrongPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Fill the rest
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setGeneratedPassword(password);
    
    // Validate password
    const errors = validatePassword(password, invitation?.invitee_form_data || {});
    setPasswordErrors(errors);
  };

  const handleManagerInputChange = useCallback((field, value) => {
    setManagerFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleReviewApproval = async () => {
    setSubmitting(true);
    
    try {
      const result = await completeManagerReview(
        invitation.id, 
        managerFormData, 
        user.id
      );
      
      if (result.success) {
        toast({
          title: 'Review Completed',
          description: 'Form has been approved. Now complete the internal fields to finalize the account.',
          variant: 'success'
        });
        setCurrentStep(2);
        onInvitationUpdated();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Review Failed',
        description: error.message || 'Failed to complete review.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizeAccount = async () => {
    if (passwordErrors.length > 0) {
      toast({
        title: 'Password Issues',
        description: 'Please generate a stronger password before finalizing.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Update manager form data first
      const reviewResult = await completeManagerReview(
        invitation.id, 
        managerFormData, 
        user.id
      );
      
      if (!reviewResult.success) {
        throw new Error(reviewResult.error);
      }

      // Finalize account creation
      const result = await finalizeAccountCreation(invitation.id, generatedPassword);
      
      if (result.success) {
        toast({
          title: 'Account Created Successfully!',
          description: `Account has been created for ${invitation.email}. Redirecting to success page...`,
          variant: 'success'
        });
        
        // Prepare success page data
        const inviteeData = invitation.invitee_form_data || {};
        const successParams = new URLSearchParams({
          email: invitation.email,
          password: generatedPassword,
          role: invitation.role,
          name: inviteeData.preferred_name || inviteeData.legal_first_name || 'User'
        });
        
        // Redirect to success page
        window.open(`/invitation-success?${successParams.toString()}`, '_blank');
        
        setCurrentStep(3);
        onInvitationUpdated();
        onOpenChange(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Account Creation Failed',
        description: error.message || 'Failed to create account.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderInviteeData = () => {
    if (!invitation?.invitee_form_data) return null;

    const data = invitation.invitee_form_data;
    const publicFields = getFormFieldsForRole(invitation.role, 'public');

    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Invitee Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicFields.map(field => {
              const value = data[field];
              if (!value) return null;

              const fieldLabels = {
                legal_first_name: 'First Name',
                legal_middle_name: 'Middle Name',
                legal_last_name: 'Last Name',
                preferred_name: 'Preferred Name',
                phone_number: 'Phone',
                business_name: 'Business',
                position_job_title: 'Position',
                employment_type: 'Employment Type',
                portfolio_url: 'Portfolio',
                social_profiles: 'Social Profiles',
                abn: 'ABN',
                acn: 'ACN',
                preferred_contact_method: 'Contact Method'
              };

              return (
                <div key={field} className="space-y-1">
                  <Label className="text-slate-400 text-sm">{fieldLabels[field]}</Label>
                  <div className="text-white text-sm bg-slate-900 p-2 rounded border border-slate-600">
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderManagerFields = () => {
    const internalFields = getFormFieldsForRole(invitation?.role, 'internal');
    
    const fieldConfig = {
      internal_notes: { 
        label: 'Internal Notes', 
        icon: FileText, 
        type: 'textarea', 
        placeholder: 'Add any internal notes about this client...' 
      },
      client_priority: { 
        label: 'Client Priority', 
        icon: AlertCircle, 
        type: 'select',
        options: [
          { value: 'low', label: 'Low Priority' },
          { value: 'medium', label: 'Medium Priority' },
          { value: 'high', label: 'High Priority' },
          { value: 'vip', label: 'VIP Client' }
        ]
      },
      assigned_manager_id: { 
        label: 'Assigned Manager', 
        icon: Users, 
        type: 'select',
        options: [
          { value: user.id, label: `${user.preferred_name || user.legal_first_name} (You)` }
        ]
      },
      billing_rate: { 
        label: 'Billing Rate ($/hour)', 
        icon: DollarSign, 
        type: 'number', 
        placeholder: '150' 
      },
      project_tags: { 
        label: 'Project Tags', 
        icon: Settings, 
        type: 'text', 
        placeholder: 'web-dev, consulting, premium' 
      },
      skill_set: { 
        label: 'Skills & Expertise', 
        icon: Briefcase, 
        type: 'textarea', 
        placeholder: 'React, Node.js, Python, etc.' 
      },
      hourly_rate: { 
        label: 'Hourly Rate ($)', 
        icon: DollarSign, 
        type: 'number', 
        placeholder: '50' 
      },
      bank_account_name: { 
        label: 'Bank Account Name', 
        icon: Building, 
        type: 'text', 
        placeholder: 'John Doe' 
      },
      bsb_number: { 
        label: 'BSB Number', 
        icon: Building, 
        type: 'text', 
        placeholder: '012-345' 
      },
      account_number: { 
        label: 'Account Number', 
        icon: Building, 
        type: 'text', 
        placeholder: '123456789' 
      },
      permissions: { 
        label: 'System Permissions', 
        icon: Shield, 
        type: 'multiselect',
        options: [
          { value: 'basic_access', label: 'Basic Access' },
          { value: 'project_management', label: 'Project Management' },
          { value: 'client_access', label: 'Client Access' },
          { value: 'financial_access', label: 'Financial Access' },
          { value: 'admin_access', label: 'Admin Access' }
        ]
      }
    };

    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Internal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {internalFields.map(field => {
              const config = fieldConfig[field];
              if (!config) return null;

              const Icon = config.icon;
              const value = managerFormData[field] || '';

              if (config.type === 'select') {
                return (
                  <div key={field} className="space-y-2">
                    <Label className="text-slate-300 flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {config.label}
                    </Label>
                    <Select 
                      value={value} 
                      onValueChange={(newValue) => handleManagerInputChange(field, newValue)}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
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
                  </div>
                );
              }

              if (config.type === 'textarea') {
                return (
                  <div key={field} className="space-y-2 md:col-span-2">
                    <Label className="text-slate-300 flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {config.label}
                    </Label>
                    <Textarea
                      value={value}
                      onChange={(e) => handleManagerInputChange(field, e.target.value)}
                      placeholder={config.placeholder}
                      className="bg-slate-900 border-slate-600 text-white placeholder-slate-400"
                      rows={3}
                    />
                  </div>
                );
              }

              return (
                <div key={field} className="space-y-2">
                  <Label className="text-slate-300 flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {config.label}
                  </Label>
                  <Input
                    type={config.type}
                    value={value}
                    onChange={(e) => handleManagerInputChange(field, e.target.value)}
                    placeholder={config.placeholder}
                    className="bg-slate-900 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPasswordSection = () => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Account Password
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Generated Password</Label>
          <div className="flex space-x-2">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={generatedPassword}
              readOnly
              className="bg-slate-900 border-slate-600 text-white font-mono"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPassword(!showPassword)}
              className="border-slate-600"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={generateStrongPassword}
              className="border-slate-600"
            >
              Generate New
            </Button>
          </div>
          <PasswordStrengthIndicator 
            password={generatedPassword} 
            errors={passwordErrors}
            userData={invitation?.invitee_form_data}
          />
        </div>
      </CardContent>
    </Card>
  );

  if (!invitation) return null;

  const isClient = invitation.role === 'client';
  const roleDisplayName = isClient ? 'Client' : 'Team Member';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Review {roleDisplayName} Invitation
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {invitation.email}
              </DialogDescription>
            </div>
            <Badge 
              className={`${
                invitation.status === INVITATION_STATES.PENDING_MANAGER_REVIEW 
                  ? 'bg-yellow-500 text-yellow-900'
                  : 'bg-blue-500 text-blue-900'
              }`}
            >
              {invitation.status === INVITATION_STATES.PENDING_MANAGER_REVIEW 
                ? 'Awaiting Review' 
                : 'Pending Completion'
              }
            </Badge>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold">
              ✓
            </div>
            <div className="w-16 h-0.5 bg-green-500"></div>
            <div className={`w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-purple-500' : 'bg-slate-600'} flex items-center justify-center text-white text-sm font-semibold`}>
              {currentStep >= 2 ? '2' : '2'}
            </div>
            <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-purple-500' : 'bg-slate-600'}`}></div>
            <div className={`w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-green-500' : 'bg-slate-600'} flex items-center justify-center text-white text-sm font-semibold`}>
              {currentStep >= 3 ? '✓' : '3'}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Review Invitee Data */}
          {currentStep >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderInviteeData()}
            </motion.div>
          )}

          {/* Step 2: Internal Fields */}
          {currentStep >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {renderManagerFields()}
            </motion.div>
          )}

          {/* Step 3: Password & Finalization */}
          {currentStep >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {renderPasswordSection()}
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300"
          >
            Cancel
          </Button>

          <div className="space-x-2">
            {currentStep === 1 && invitation.status === INVITATION_STATES.PENDING_MANAGER_REVIEW && (
              <Button
                onClick={handleReviewApproval}
                disabled={submitting}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Continue
                  </>
                )}
              </Button>
            )}

            {currentStep >= 2 && (
              <Button
                onClick={handleFinalizeAccount}
                disabled={submitting || passwordErrors.length > 0}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationReviewDialog; 