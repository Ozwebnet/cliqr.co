import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Monitor, 
  Volume2, 
  VolumeX,
  Clock,
  Save
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const NotificationTab = ({ preferences, onPreferencesUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email_notifications: true,
    push_notifications: true,
    desktop_notifications: true,
    notification_types: {
      info: true,
      success: true,
      warning: true,
      error: true,
      announcement: true,
      reminder: true,
      system: true,
      invoice: true,
      proposal: true,
      lead: true,
      project: true,
      credential: true
    },
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    frequency_digest: 'immediate'
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        email_notifications: preferences.email_notifications ?? true,
        push_notifications: preferences.push_notifications ?? true,
        desktop_notifications: preferences.desktop_notifications ?? true,
        notification_types: preferences.notification_types || {
          info: true,
          success: true,
          warning: true,
          error: true,
          announcement: true,
          reminder: true,
          system: true,
          invoice: true,
          proposal: true,
          lead: true,
          project: true,
          credential: true
        },
        quiet_hours_enabled: preferences.quiet_hours_enabled ?? false,
        quiet_hours_start: preferences.quiet_hours_start || '22:00',
        quiet_hours_end: preferences.quiet_hours_end || '08:00',
        frequency_digest: preferences.frequency_digest || 'immediate'
      });
    }
  }, [preferences]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationTypeChange = (type, enabled) => {
    setFormData(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: enabled
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const preferencesData = {
        user_id: user.id,
        team_id: user.team_id,
        email_notifications: formData.email_notifications,
        push_notifications: formData.push_notifications,
        desktop_notifications: formData.desktop_notifications,
        notification_types: formData.notification_types,
        quiet_hours_enabled: formData.quiet_hours_enabled,
        quiet_hours_start: formData.quiet_hours_start,
        quiet_hours_end: formData.quiet_hours_end,
        frequency_digest: formData.frequency_digest
      };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(preferencesData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully!'
      });

      onPreferencesUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update preferences: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { key: 'info', label: 'Information', description: 'General information and updates' },
    { key: 'success', label: 'Success', description: 'Successful actions and completions' },
    { key: 'warning', label: 'Warnings', description: 'Important warnings and alerts' },
    { key: 'error', label: 'Errors', description: 'Error messages and failures' },
    { key: 'announcement', label: 'Announcements', description: 'Company and team announcements' },
    { key: 'reminder', label: 'Reminders', description: 'Task and deadline reminders' },
    { key: 'system', label: 'System', description: 'System maintenance and updates' },
    { key: 'invoice', label: 'Invoices', description: 'Invoice-related notifications' },
    { key: 'proposal', label: 'Proposals', description: 'Proposal status and updates' },
    { key: 'lead', label: 'Leads', description: 'Lead assignments and updates' },
    { key: 'project', label: 'Projects', description: 'Project updates and milestones' },
    { key: 'credential', label: 'Credentials', description: 'Password and security alerts' }
  ];

  return (
    <div className="space-y-6">
      {/* Delivery Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Delivery Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div className="flex-1">
                <Label className="text-slate-300">Email Notifications</Label>
                <p className="text-slate-500 text-sm">Receive notifications via email</p>
              </div>
              <Checkbox
                checked={formData.email_notifications}
                onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-slate-400" />
              <div className="flex-1">
                <Label className="text-slate-300">Push Notifications</Label>
                <p className="text-slate-500 text-sm">Receive push notifications on mobile devices</p>
              </div>
              <Checkbox
                checked={formData.push_notifications}
                onCheckedChange={(checked) => handleInputChange('push_notifications', checked)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 text-slate-400" />
              <div className="flex-1">
                <Label className="text-slate-300">Desktop Notifications</Label>
                <p className="text-slate-500 text-sm">Show browser notifications on desktop</p>
              </div>
              <Checkbox
                checked={formData.desktop_notifications}
                onCheckedChange={(checked) => handleInputChange('desktop_notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Notification Types</CardTitle>
            <p className="text-slate-400 text-sm">Choose which types of notifications you want to receive</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notificationTypes.map(type => (
                <div key={type.key} className="flex items-start space-x-3 p-3 bg-slate-700 rounded-lg">
                  <Checkbox
                    checked={formData.notification_types[type.key]}
                    onCheckedChange={(checked) => handleNotificationTypeChange(type.key, checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label className="text-slate-300 font-medium">{type.label}</Label>
                    <p className="text-slate-500 text-xs mt-1">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timing & Frequency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Timing & Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Notification Frequency</Label>
              <Select value={formData.frequency_digest} onValueChange={(value) => handleInputChange('frequency_digest', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-slate-500 text-sm">
                {formData.frequency_digest === 'immediate' && 'Receive notifications as they happen'}
                {formData.frequency_digest === 'hourly' && 'Receive a summary every hour'}
                {formData.frequency_digest === 'daily' && 'Receive a daily summary'}
                {formData.frequency_digest === 'weekly' && 'Receive a weekly summary'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <Label className="text-slate-300">Quiet Hours</Label>
                  <p className="text-slate-500 text-sm">Disable notifications during specific hours</p>
                </div>
                <Checkbox
                  checked={formData.quiet_hours_enabled}
                  onCheckedChange={(checked) => handleInputChange('quiet_hours_enabled', checked)}
                />
              </div>
              
              {formData.quiet_hours_enabled && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Start Time</Label>
                    <Input
                      type="time"
                      value={formData.quiet_hours_start}
                      onChange={(e) => handleInputChange('quiet_hours_start', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">End Time</Label>
                    <Input
                      type="time"
                      value={formData.quiet_hours_end}
                      onChange={(e) => handleInputChange('quiet_hours_end', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Enable All Notifications</Label>
                <p className="text-slate-500 text-sm">Turn on all notification types</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const allEnabled = {};
                  notificationTypes.forEach(type => {
                    allEnabled[type.key] = true;
                  });
                  handleInputChange('notification_types', allEnabled);
                }}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                <Volume2 className="w-4 h-4 mr-1" />
                Enable All
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Disable All Notifications</Label>
                <p className="text-slate-500 text-sm">Turn off all notification types</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const allDisabled = {};
                  notificationTypes.forEach(type => {
                    allDisabled[type.key] = false;
                  });
                  handleInputChange('notification_types', allDisabled);
                }}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                <VolumeX className="w-4 h-4 mr-1" />
                Disable All
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
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
          {loading ? 'Saving...' : 'Save Notification Preferences'}
        </Button>
      </motion.div>
    </div>
  );
};

export default NotificationTab;