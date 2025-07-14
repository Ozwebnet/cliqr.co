import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Building, 
  Globe,
  CreditCard,
  Settings as SettingsIcon,
  Save,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import LoadingBar from '@/components/ui/LoadingBar';
import ProfileTab from '@/components/Settings/ProfileTab';
import SecurityTab from '@/components/Settings/SecurityTab';
import NotificationTab from '@/components/Settings/NotificationTab';
import AppearanceTab from '@/components/Settings/AppearanceTab';
import BusinessTab from '@/components/Settings/BusinessTab';
import IntegrationsTab from '@/components/Settings/IntegrationsTab';
import BillingTab from '@/components/Settings/BillingTab';

const SettingsManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [userSettings, setUserSettings] = useState(null);
  const [teamSettings, setTeamSettings] = useState(null);
  const [notificationPreferences, setNotificationPreferences] = useState(null);

  const isAdmin = ['admin', 'full_admin'].includes(user?.role);
  const isFullAdmin = user?.role === 'full_admin';

  const fetchSettings = useCallback(async () => {
    if (!user?.team_id) return;
    
    setLoading(true);
    try {
      // Fetch user settings
      const { data: userSettingsData, error: userSettingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userSettingsError && userSettingsError.code !== 'PGRST116') {
        throw userSettingsError;
      }

      // Fetch team settings (if admin)
      let teamSettingsData = null;
      if (isAdmin) {
        const { data, error: teamSettingsError } = await supabase
          .from('team_settings')
          .select('*')
          .eq('team_id', user.team_id)
          .single();

        if (teamSettingsError && teamSettingsError.code !== 'PGRST116') {
          throw teamSettingsError;
        }
        teamSettingsData = data;
      }

      // Fetch notification preferences
      const { data: notificationData, error: notificationError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (notificationError && notificationError.code !== 'PGRST116') {
        throw notificationError;
      }

      setUserSettings(userSettingsData);
      setTeamSettings(teamSettingsData);
      setNotificationPreferences(notificationData);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch settings: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.team_id, user?.id, isAdmin]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleRefresh = () => {
    fetchSettings();
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, roles: ['client', 'admin', 'full_admin'] },
    { id: 'security', label: 'Security', icon: Shield, roles: ['client', 'admin', 'full_admin'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['client', 'admin', 'full_admin'] },
    { id: 'appearance', label: 'Appearance', icon: Palette, roles: ['client', 'admin', 'full_admin'] },
    // Team tab removed as per user request
    // { id: 'team', label: 'Team', icon: Users, roles: ['admin', 'full_admin'] }, 
    { id: 'business', label: 'Business', icon: Building, roles: ['full_admin'] },
    { id: 'integrations', label: 'Integrations', icon: Globe, roles: ['admin', 'full_admin'] },
    { id: 'billing', label: 'Billing', icon: CreditCard, roles: ['full_admin'] }
  ];

  const filteredTabs = tabs.filter(tab => 
    tab.roles.includes(user?.role || 'client')
  );
  
  useEffect(() => {
    if (!filteredTabs.find(tab => tab.id === activeTab)) {
      setActiveTab('profile');
    }
  }, [activeTab, filteredTabs]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab userSettings={userSettings} onSettingsUpdate={fetchSettings} />;
      case 'security':
        return <SecurityTab userSettings={userSettings} onSettingsUpdate={fetchSettings} />;
      case 'notifications':
        return <NotificationTab preferences={notificationPreferences} onPreferencesUpdate={fetchSettings} />;
      case 'appearance':
        return <AppearanceTab userSettings={userSettings} onSettingsUpdate={fetchSettings} />;
      // Team tab case removed
      // case 'team':
      //   return <TeamTab teamSettings={teamSettings} onSettingsUpdate={fetchSettings} />;
      case 'business':
        return <BusinessTab teamSettings={teamSettings} onSettingsUpdate={fetchSettings} />;
      case 'integrations':
        return <IntegrationsTab teamSettings={teamSettings} onSettingsUpdate={fetchSettings} />;
      case 'billing':
        return <BillingTab teamSettings={teamSettings} onSettingsUpdate={fetchSettings} />;
      default:
        return <ProfileTab userSettings={userSettings} onSettingsUpdate={fetchSettings} />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingBar text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-800 dark:text-slate-400 mt-2">Manage your account, preferences, and team configuration</p>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <SettingsIcon className="w-6 h-6 mr-2" />
              Account & Preferences
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure your account settings, security preferences, and team management options.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 mb-6">
                {filteredTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex items-center space-x-2 text-xs lg:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              <div className="mt-6">
                {renderTabContent()}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SettingsManager;