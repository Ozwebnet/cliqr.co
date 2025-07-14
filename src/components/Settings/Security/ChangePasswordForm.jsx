import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Eye, EyeOff, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { validatePassword, PasswordStrengthIndicator } from '@/lib/passwordUtils.jsx';

const ChangePasswordForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState([]);

  const userDetailsForPasswordValidation = React.useMemo(() => (user ? {
      email: user.email,
      legal_first_name: user.raw_user_meta_data?.legal_first_name,
      legal_middle_name: user.raw_user_meta_data?.legal_middle_name,
      legal_last_name: user.raw_user_meta_data?.legal_last_name,
      preferred_name: user.raw_user_meta_data?.preferred_name,
  } : {}), [user]);

  useEffect(() => {
    if (passwordForm.newPassword) {
      const errors = validatePassword(passwordForm.newPassword, userDetailsForPasswordValidation);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  }, [passwordForm.newPassword, userDetailsForPasswordValidation]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordErrors.length > 0) {
      const errorMessages = passwordErrors.map(err => {
          if (err.includes("personal information")) return "Password should not contain personal information.";
          if (err.includes("repeated characters") || err.includes("common sequences")) return "Password should not contain 3+ repeated characters or common sequences.";
          return err; 
      });
      toast({ title: "Password Issue", description: `Please fix password issues: ${errorMessages.join(' ')}`, variant: "destructive" });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirmation password do not match.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!passwordForm.currentPassword) {
      toast({
        title: 'Current Password Required',
        description: 'Please enter your current password to change it.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // First, verify current password by attempting to sign in with it.
      // This is a workaround as Supabase doesn't have a direct "verify current password" endpoint.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        toast({
          title: 'Incorrect Current Password',
          description: 'The current password you entered is incorrect.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      // If current password is correct, proceed to update to the new password.
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Password updated successfully!'
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update password: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePastePassword = (e) => {
    e.preventDefault();
    toast({
      title: "Paste Disabled",
      description: "For security, pasting is disabled in password fields. Please type your password.",
      variant: "destructive",
      duration: 3000,
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Key className="w-5 h-5 mr-2" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-slate-300">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  onPaste={handlePastePassword}
                  placeholder="Enter current password"
                  className="bg-slate-700 border-slate-600 text-white pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-300">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  onPaste={handlePastePassword}
                  placeholder="Enter new password"
                  className="bg-slate-700 border-slate-600 text-white pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordForm.newPassword && (
                <PasswordStrengthIndicator 
                  password={passwordForm.newPassword} 
                  userDetails={userDetailsForPasswordValidation} 
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  onPaste={handlePastePassword}
                  placeholder="Confirm new password"
                  className="bg-slate-700 border-slate-600 text-white pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-red-400 text-sm">Passwords do not match</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || passwordErrors.length > 0 || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;