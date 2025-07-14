import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

import SecurityOverview from '@/components/Settings/Security/SecurityOverview';
import ChangePasswordForm from '@/components/Settings/Security/ChangePasswordForm';
import TwoFactorAuthSection from '@/components/Settings/Security/TwoFactorAuthSection';
import SecurityPreferencesSection from '@/components/Settings/Security/SecurityPreferencesSection';
import ActiveSessionsSection from '@/components/Settings/Security/ActiveSessionsSection';

const SecurityTab = ({ userSettings, onSettingsUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
    securityAlerts: true,
    deviceTracking: true
  });
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (userSettings) {
      setSecuritySettings({
        twoFactorEnabled: userSettings.two_factor_enabled === true, // Ensure boolean
        sessionTimeout: userSettings.session_timeout_minutes || 30,
        loginNotifications: userSettings.login_notifications !== false, // Default true
        securityAlerts: userSettings.security_alerts !== false, // Default true
        deviceTracking: userSettings.device_tracking !== false // Default true
      });
    }
    fetchActiveSessions();
  }, [userSettings]);

  const fetchActiveSessions = async () => {
    // This is a placeholder. Real session fetching would require backend logic
    // and Supabase doesn't directly expose session list to client for security.
    // Mocking similar to original code.
    setSessions([
      {
        id: '1',
        device: 'Chrome on Windows',
        location: 'Sydney, NSW',
        lastActive: new Date(),
        current: true
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        location: 'Melbourne, VIC',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        current: false
      }
    ]);
  };
  
  const handleSettingChange = (key, value) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSecurityPreferences = async () => {
    setLoading(true);
    try {
      // Prevent users from disabling critical security features once enabled through admin policy.
      // Example: if team_settings enforce 2FA, user cannot disable it here.
      // This example assumes user settings are standalone for now.
      const settingsData = {
        user_id: user.id,
        team_id: user.team_id, // Assuming team_id is part of user object for user_settings table
        two_factor_enabled: securitySettings.twoFactorEnabled,
        session_timeout_minutes: securitySettings.sessionTimeout,
        login_notifications: securitySettings.loginNotifications,
        security_alerts: securitySettings.securityAlerts,
        device_tracking: securitySettings.deviceTracking,
        updated_at: new Date().toISOString()
      };
      
      // Check if a record exists to decide between insert or update
      const { data: existingSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let query;
      if (existingSettings) {
        query = supabase.from('user_settings').update(settingsData).eq('user_id', user.id);
      } else {
        query = supabase.from('user_settings').insert([{ ...settingsData, user_id: user.id, team_id: user.team_id, created_at: new Date().toISOString() }]);
      }
      
      const { error } = await query;

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Security preferences updated successfully!'
      });
      if (onSettingsUpdate) onSettingsUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update security preferences: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sectionAnimation = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay }
  });

  return (
    <div className="space-y-6">
      <motion.div {...sectionAnimation(0)}>
        <SecurityOverview 
          twoFactorEnabled={securitySettings.twoFactorEnabled}
          sessionCount={sessions.length}
        />
      </motion.div>

      <motion.div {...sectionAnimation(0.1)}>
        <ChangePasswordForm />
      </motion.div>

      <motion.div {...sectionAnimation(0.2)}>
        <TwoFactorAuthSection 
          twoFactorEnabled={securitySettings.twoFactorEnabled}
        />
      </motion.div>

      <motion.div {...sectionAnimation(0.3)}>
        <SecurityPreferencesSection 
          settings={securitySettings}
          onSettingChange={handleSettingChange}
          onSave={handleSaveSecurityPreferences}
          loading={loading}
        />
      </motion.div>
      
      <motion.div {...sectionAnimation(0.4)}>
        <ActiveSessionsSection sessions={sessions} />
      </motion.div>
    </div>
  );
};

export default SecurityTab;