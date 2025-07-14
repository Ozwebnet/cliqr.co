import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth.jsx';
import { validateABNFormat, getABNValidationError, cleanABNInput } from '@/lib/abnValidation.js';
import { validateACNFormat, getACNValidationError, cleanACNInput } from '@/lib/acnValidation.js';
import { validateAustralianPhoneFormat, getPhoneValidationError, cleanPhoneInput } from '@/lib/phoneValidation.js';
import DeleteUserDialog from '@/components/CRM/DeleteUserDialog'; 

const EditUserDialog = ({ userToEdit, isOpen, setIsOpen, onUserUpdated, onSoftDelete, isRecyclingBinView }) => {
  const [formData, setFormData] = useState({
    email: '',
    legal_first_name: '',
    legal_middle_name: '',
    legal_last_name: '',
    preferred_name: '',
    phone_number: '',
    business_name: '',
    abn: '',
    acn: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [abnError, setAbnError] = useState('');
  const [acnError, setAcnError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { updateUserByAdmin, updateUserEmailByAdmin, user: currentUser } = useAuth();

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        email: userToEdit.email || '',
        legal_first_name: userToEdit.legal_first_name || '',
        legal_middle_name: userToEdit.legal_middle_name || '',
        legal_last_name: userToEdit.legal_last_name || '',
        preferred_name: userToEdit.preferred_name || '', 
        phone_number: userToEdit.phone_number || '',
        business_name: userToEdit.business_name || '',
        abn: userToEdit.abn || '',
        acn: userToEdit.acn || '',
        role: userToEdit.role || '',
      });
      
      // Validate existing ABN
      if (userToEdit.abn) {
        const abnValidationError = getABNValidationError(userToEdit.abn);
        setAbnError(abnValidationError || '');
      } else {
        setAbnError('');
      }
      
      // Validate existing ACN
      if (userToEdit.acn) {
        const acnValidationError = getACNValidationError(userToEdit.acn);
        setAcnError(acnValidationError || '');
      } else {
        setAcnError('');
      }
      
      // Validate existing phone number
      if (userToEdit.phone_number) {
        const phoneValidationError = getPhoneValidationError(userToEdit.phone_number);
        setPhoneError(phoneValidationError || '');
      } else {
        setPhoneError('');
      }
    }
  }, [userToEdit]);

  const handleChange = (e) => {
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
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userToEdit) return;

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

    setLoading(true);
    let emailUpdated = false;
    let detailsUpdated = false;

    if (formData.email && formData.email !== userToEdit.email) {
        const emailSuccess = await updateUserEmailByAdmin(userToEdit.id, formData.email);
        if (emailSuccess) {
            emailUpdated = true;
            toast({ title: 'Email Change Initiated', description: `A confirmation email has been sent to ${formData.email}. The email will update upon verification.` });
        } else {
            toast({ title: 'Email Change Failed', description: `Could not initiate email change for ${formData.email}.`, variant: 'destructive'});
            setLoading(false);
            onUserUpdated(false);
            return;
        }
    }
    
    const { email, ...otherDetailsPayload } = formData;
    
    const detailsToUpdate = {
      ...otherDetailsPayload,
      preferred_name: otherDetailsPayload.preferred_name || otherDetailsPayload.legal_first_name,
    };

    const currentDetailsToCompare = {
        legal_first_name: userToEdit.legal_first_name || '',
        legal_middle_name: userToEdit.legal_middle_name || '',
        legal_last_name: userToEdit.legal_last_name || '',
        preferred_name: userToEdit.preferred_name || '',
        phone_number: userToEdit.phone_number || '',
        business_name: userToEdit.business_name || '',
        abn: userToEdit.abn || '',
        acn: userToEdit.acn || '',
        role: userToEdit.role || '',
    };
    
    const detailsHaveChanged = Object.keys(detailsToUpdate).some(key => detailsToUpdate[key] !== currentDetailsToCompare[key]);

    if (detailsHaveChanged) {
        const success = await updateUserByAdmin(userToEdit.id, detailsToUpdate);
        if (success) {
            detailsUpdated = true;
        } else {
            toast({ title: 'Details Update Failed', description: `Could not update other details for ${detailsToUpdate.preferred_name}.`, variant: 'destructive'});
        }
    }

    setLoading(false);

    const finalPreferredName = detailsToUpdate.preferred_name || userToEdit.email;

    if (emailUpdated || detailsUpdated) {
      if(detailsUpdated && !emailUpdated) toast({ title: 'User Updated', description: `${finalPreferredName}'s details have been updated.` });
      else if (!detailsUpdated && emailUpdated) {} 
      else if (detailsUpdated && emailUpdated) toast({ title: 'User Updated', description: `${finalPreferredName}'s details and email change process initiated.` });
      
      onUserUpdated(true); 
      setIsOpen(false);
    } else if (!emailUpdated && !detailsUpdated && !detailsHaveChanged && formData.email === userToEdit.email) {
        toast({ title: 'No Changes', description: 'No information was changed.', variant: 'default' });
        setIsOpen(false);
        onUserUpdated(false);
    } else {
        onUserUpdated(false);
    }
  };

  if (!userToEdit) return null;

  const canEditRole = currentUser?.role === 'full_admin';
  const canDelete = currentUser?.role === 'full_admin' && currentUser?.id !== userToEdit.id && !isRecyclingBinView;
  const canEditEmail = currentUser?.role === 'full_admin';

  const FieldLabel = ({ htmlFor, children, isRequired }) => (
    <Label htmlFor={htmlFor} className="text-slate-300">
      {children}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => { setIsOpen(openState); if(!openState) onUserUpdated(false); }}>
      <DialogContent className="sm:max-w-lg bg-slate-800 border-slate-700 text-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit User: {formData.preferred_name || formData.legal_first_name || userToEdit.email}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Make changes to the user's profile. Fields marked with a <span className="text-red-500 font-semibold">*</span> are required. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <FieldLabel htmlFor={`edit-legal_first_name-${userToEdit.id}`} isRequired>Legal First Name</FieldLabel>
            <Input id="legal_first_name" value={formData.legal_first_name} onChange={handleChange} className="bg-slate-700 border-slate-600" disabled={loading} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor={`edit-legal_middle_name-${userToEdit.id}`}>Legal Middle Name</FieldLabel>
            <Input id="legal_middle_name" value={formData.legal_middle_name} onChange={handleChange} className="bg-slate-700 border-slate-600" disabled={loading} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor={`edit-legal_last_name-${userToEdit.id}`} isRequired>Legal Last Name</FieldLabel>
            <Input id="legal_last_name" value={formData.legal_last_name} onChange={handleChange} className="bg-slate-700 border-slate-600" disabled={loading} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor={`edit-preferred_name-${userToEdit.id}`}>Preferred Name</FieldLabel>
            <Input id="preferred_name" value={formData.preferred_name} onChange={handleChange} className="bg-slate-700 border-slate-600" disabled={loading} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor={`edit-email-${userToEdit.id}`} isRequired>Email</FieldLabel>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} className="bg-slate-700 border-slate-600" disabled={loading || !canEditEmail} />
             {!canEditEmail && <p className="text-xs text-slate-400">Only Full Admins can change emails.</p>}
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor={`edit-phone_number-${userToEdit.id}`} isRequired>Phone Number</FieldLabel>
            <Input 
              id="phone_number" 
              type="tel" 
              value={formData.phone_number} 
              onChange={handleChange} 
              className={`bg-slate-700 border-slate-600 ${phoneError ? 'border-red-500' : ''}`} 
              disabled={loading} 
              placeholder="Enter Australian phone number (e.g., 0412345678)"
            />
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
            <p className="text-xs text-slate-400">Enter your Australian phone number (mobile or landline), e.g. 0412345678 or 0298765432. No spaces or symbols.</p>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor={`edit-business_name-${userToEdit.id}`} isRequired>Business Name</FieldLabel>
            <Input id="business_name" value={formData.business_name} onChange={handleChange} className="bg-slate-700 border-slate-600" disabled={loading} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor={`edit-abn-${userToEdit.id}`}>ABN</FieldLabel>
            <Input 
              id="abn" 
              value={formData.abn} 
              onChange={handleChange} 
              className={`bg-slate-700 border-slate-600 ${abnError ? 'border-red-500' : ''}`} 
              disabled={loading} 
              placeholder="Enter 11-digit ABN (e.g., 51824753556)"
            />
            {abnError && <p className="text-red-500 text-xs mt-1">{abnError}</p>}
            <p className="text-xs text-slate-400">Enter your 11-digit ABN (e.g., 51824753556). No spaces or letters.</p>
          </div>
          <div className="space-y-2 md:col-span-1">
            <FieldLabel htmlFor={`edit-acn-${userToEdit.id}`}>ACN</FieldLabel>
            <Input 
              id="acn" 
              value={formData.acn} 
              onChange={handleChange} 
              className={`bg-slate-700 border-slate-600 ${acnError ? 'border-red-500' : ''}`} 
              disabled={loading} 
              placeholder="Enter 9-digit ACN (e.g., 123456789)"
            />
            {acnError && <p className="text-red-500 text-xs mt-1">{acnError}</p>}
            <p className="text-xs text-slate-400">Enter your 9-digit ACN (e.g., 123456789). No letters or spaces.</p>
          </div>
          
          {canEditRole && (
            <div className="space-y-2 md:col-span-1">
              <FieldLabel htmlFor={`edit-role-${userToEdit.id}`} isRequired>Role</FieldLabel>
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
                disabled={loading || userToEdit.id === currentUser?.id } 
              >
                <SelectTrigger id={`edit-role-trigger-${userToEdit.id}`} className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white">
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="full_admin">Full Admin (Team Manager)</SelectItem>
                </SelectContent>
              </Select>
              {userToEdit.id === currentUser?.id && <p className="text-xs text-slate-400">You cannot change your own role.</p>}
            </div>
          )}
          {!canEditRole && (
             <div className="space-y-2 md:col-span-1">
                <FieldLabel htmlFor={`display-role-${userToEdit.id}`} isRequired>Role</FieldLabel>
                 <Input
                    id={`display-role-${userToEdit.id}`}
                    value={formData.role.replace('_', ' ')}
                    className="bg-slate-700 border-slate-600 text-white capitalize"
                    disabled={true} 
                />
            </div>
          )}
        </form>
        <DialogFooter className="sm:justify-between items-center pt-4">
          <div>
            {canDelete && (
              <DeleteUserDialog 
                  userToDelete={userToEdit} 
                  onConfirmDelete={() => { 
                    onSoftDelete(userToEdit.id); 
                    setIsOpen(false);
                    onUserUpdated(true);
                  }} 
                  dialogType="softDelete" 
              />
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {setIsOpen(false); onUserUpdated(false);}} className="text-slate-300 border-slate-600 hover:bg-slate-700">Cancel</Button>
            <Button type="submit" onClick={handleSubmit} disabled={loading || abnError || acnError || phoneError} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;