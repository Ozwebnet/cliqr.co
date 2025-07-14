import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

import ThemeSelection from '@/components/Settings/Appearance/ThemeSelection';
import LocalizationSettings from '@/components/Settings/Appearance/LocalizationSettings';
import InterfacePreferences from '@/components/Settings/Appearance/InterfacePreferences';
import DashboardLayoutSettings from '@/components/Settings/Appearance/DashboardLayoutSettings';

const defaultDashboardLayout = {
  cards_per_row: 4,
  show_charts: true,
  show_recent_activity: true
};

const AppearanceTab = ({ userSettings, onSettingsUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'Australia/Sydney',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    currency: 'AUD',
    sidebar_collapsed: false,
    auto_save: true,
    keyboard_shortcuts: true,
    show_tooltips: true,
    compact_mode: false,
    high_contrast: false,
    reduce_motion: false,
    dashboard_layout: { ...defaultDashboardLayout }
  });

  useEffect(() => {
    if (userSettings) {
      setFormData({
        theme: userSettings.theme || 'dark',
        language: userSettings.language || 'en',
        timezone: userSettings.timezone || 'Australia/Sydney',
        date_format: userSettings.date_format || 'DD/MM/YYYY',
        time_format: userSettings.time_format || '24h',
        currency: userSettings.currency || 'AUD',
        sidebar_collapsed: userSettings.sidebar_collapsed || false,
        auto_save: userSettings.auto_save !== false,
        keyboard_shortcuts: userSettings.keyboard_shortcuts !== false,
        show_tooltips: userSettings.show_tooltips !== false,
        compact_mode: userSettings.compact_mode || false,
        high_contrast: userSettings.high_contrast || false,
        reduce_motion: userSettings.reduce_motion || false,
        dashboard_layout: userSettings.dashboard_layout 
          ? { ...defaultDashboardLayout, ...userSettings.dashboard_layout }
          : { ...defaultDashboardLayout }
      });
    }
  }, [userSettings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDashboardLayoutChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      dashboard_layout: {
        ...(prev.dashboard_layout || defaultDashboardLayout),
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const settingsData = {
        user_id: user.id,
        team_id: user.team_id,
        ...formData
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Appearance settings updated successfully!'
      });

      onSettingsUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update appearance settings: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ThemeSelection theme={formData.theme} onThemeChange={(value) => handleInputChange('theme', value)} />
      <LocalizationSettings formData={formData} onInputChange={handleInputChange} />
      <InterfacePreferences formData={formData} onInputChange={handleInputChange} />
      <DashboardLayoutSettings 
        dashboardLayout={formData.dashboard_layout || defaultDashboardLayout} 
        onDashboardLayoutChange={handleDashboardLayoutChange} 
      />

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
          {loading ? 'Saving...' : 'Save Appearance Settings'}
        </Button>
      </motion.div>
    </div>
  );
};

export default AppearanceTab;