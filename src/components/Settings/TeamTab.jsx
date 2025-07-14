import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Clock, 
  Database,
  Save,
  Trash2,
  Edit3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const TeamTab = ({ teamSettings, onSettingsUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    require_2fa: false,
    password_policy: {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_symbols: true
    },
    session_timeout_minutes: 30,
    max_login_attempts: 5,
    lockout_duration_minutes: 15,
    allowed_domains: [],
    ip_whitelist: [],
    user_limit: 50,
    auto_backup: true,
    backup_frequency: 'daily',
    data_retention_days: 365
  });

  const isFullAdmin = user?.role === 'full_admin';

  useEffect(() => {
    fetchTeamMembers();
    if (teamSettings) {
      setFormData({
        require_2fa: teamSettings.require_2fa || false,
        password_policy: teamSettings.password_policy || {
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_symbols: true
        },
        session_timeout_minutes: teamSettings.session_timeout_minutes || 30,
        max_login_attempts: teamSettings.max_login_attempts || 5,
        lockout_duration_minutes: teamSettings.lockout_duration_minutes || 15,
        allowed_domains: teamSettings.allowed_domains || [],
        ip_whitelist: teamSettings.ip_whitelist || [],
        user_limit: teamSettings.user_limit || 50,
        auto_backup: teamSettings.auto_backup !== false,
        backup_frequency: teamSettings.backup_frequency || 'daily',
        data_retention_days: teamSettings.data_retention_days || 365
      });
    }
  }, [teamSettings]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, status, created_at, last_sign_in_at')
        .eq('team_id', user.team_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch team members: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordPolicyChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      password_policy: {
        ...prev.password_policy,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!isFullAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only team managers can update team settings.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const settingsData = {
        team_id: user.team_id,
        require_2fa: formData.require_2fa,
        password_policy: formData.password_policy,
        session_timeout_minutes: formData.session_timeout_minutes,
        max_login_attempts: formData.max_login_attempts,
        lockout_duration_minutes: formData.lockout_duration_minutes,
        allowed_domains: formData.allowed_domains,
        ip_whitelist: formData.ip_whitelist,
        user_limit: formData.user_limit,
        auto_backup: formData.auto_backup,
        backup_frequency: formData.backup_frequency,
        data_retention_days: formData.data_retention_days,
        created_by: user.id
      };

      const { error } = await supabase
        .from('team_settings')
        .upsert(settingsData, { onConflict: 'team_id' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Team settings updated successfully!'
      });

      onSettingsUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update team settings: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = () => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "User invitation isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 5000,
    });
  };

  const handleRemoveUser = (userId) => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "User removal isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 5000,
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'full_admin': return 'text-purple-400';
      case 'admin': return 'text-blue-400';
      case 'client': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Team Members</p>
                <p className="text-white text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">User Limit</p>
                <p className="text-white text-2xl font-bold">{formData.user_limit}</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Session Timeout</p>
                <p className="text-white text-2xl font-bold">{formData.session_timeout_minutes}m</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Members
              </CardTitle>
              {isFullAdmin && (
                <Button onClick={handleInviteUser} className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {member.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.name || 'Unnamed User'}</p>
                      <p className="text-slate-400 text-sm">{member.email}</p>
                      <p className={`text-xs font-medium ${getRoleColor(member.role)}`}>
                        {member.role?.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">
                        Joined: {new Date(member.created_at).toLocaleDateString()}
                      </p>
                      {member.last_sign_in_at && (
                        <p className="text-slate-500 text-xs">
                          Last active: {new Date(member.last_sign_in_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {isFullAdmin && member.id !== user.id && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveUser(member.id)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveUser(member.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Policies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="require_2fa"
                    checked={formData.require_2fa}
                    onCheckedChange={(checked) => handleInputChange('require_2fa', checked)}
                    disabled={!isFullAdmin}
                  />
                  <div>
                    <Label htmlFor="require_2fa" className="text-slate-300 font-medium">
                      Require Two-Factor Authentication
                    </Label>
                    <p className="text-slate-500 text-sm">Force all team members to enable 2FA</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="480"
                    value={formData.session_timeout_minutes}
                    onChange={(e) => handleInputChange('session_timeout_minutes', parseInt(e.target.value) || 30)}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={!isFullAdmin}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Max Login Attempts</Label>
                  <Input
                    type="number"
                    min="3"
                    max="10"
                    value={formData.max_login_attempts}
                    onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value) || 5)}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={!isFullAdmin}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Lockout Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="60"
                    value={formData.lockout_duration_minutes}
                    onChange={(e) => handleInputChange('lockout_duration_minutes', parseInt(e.target.value) || 15)}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={!isFullAdmin}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">User Limit</Label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.user_limit}
                    onChange={(e) => handleInputChange('user_limit', parseInt(e.target.value) || 50)}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={!isFullAdmin}
                  />
                </div>
              </div>
            </div>

            {/* Password Policy */}
            <div className="border-t border-slate-600 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Password Policy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Minimum Length</Label>
                    <Input
                      type="number"
                      min="6"
                      max="32"
                      value={formData.password_policy.min_length}
                      onChange={(e) => handlePasswordPolicyChange('min_length', parseInt(e.target.value) || 8)}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={!isFullAdmin}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="require_uppercase"
                      checked={formData.password_policy.require_uppercase}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('require_uppercase', checked)}
                      disabled={!isFullAdmin}
                    />
                    <Label htmlFor="require_uppercase" className="text-slate-300">
                      Require Uppercase Letters
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="require_lowercase"
                      checked={formData.password_policy.require_lowercase}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('require_lowercase', checked)}
                      disabled={!isFullAdmin}
                    />
                    <Label htmlFor="require_lowercase" className="text-slate-300">
                      Require Lowercase Letters
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="require_numbers"
                      checked={formData.password_policy.require_numbers}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('require_numbers', checked)}
                      disabled={!isFullAdmin}
                    />
                    <Label htmlFor="require_numbers" className="text-slate-300">
                      Require Numbers
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="require_symbols"
                      checked={formData.password_policy.require_symbols}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('require_symbols', checked)}
                      disabled={!isFullAdmin}
                    />
                    <Label htmlFor="require_symbols" className="text-slate-300">
                      Require Special Characters
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="auto_backup"
                    checked={formData.auto_backup}
                    onCheckedChange={(checked) => handleInputChange('auto_backup', checked)}
                    disabled={!isFullAdmin}
                  />
                  <div>
                    <Label htmlFor="auto_backup" className="text-slate-300 font-medium">
                      Automatic Backups
                    </Label>
                    <p className="text-slate-500 text-sm">Automatically backup team data</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Backup Frequency</Label>
                  <select
                    value={formData.backup_frequency}
                    onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                    disabled={!isFullAdmin}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Data Retention (days)</Label>
                  <Input
                    type="number"
                    min="30"
                    max="2555"
                    value={formData.data_retention_days}
                    onChange={(e) => handleInputChange('data_retention_days', parseInt(e.target.value) || 365)}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={!isFullAdmin}
                  />
                  <p className="text-slate-500 text-xs">How long to keep deleted data before permanent removal</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      {isFullAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Team Settings'}
          </Button>
        </motion.div>
      )}

      {!isFullAdmin && (
        <div className="text-center py-8">
          <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">Access Restricted</p>
          <p className="text-slate-500">Only team managers can modify team settings.</p>
        </div>
      )}
    </div>
  );
};

export default TeamTab;