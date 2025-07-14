import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Save,
  CreditCard,
  Mail,
  MessageSquare,
  Calendar,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import IntegrationCard from '@/components/Settings/Integrations/IntegrationCard';
import CustomWebhooksSection from '@/components/Settings/Integrations/CustomWebhooksSection';
import ApiAccessSection from '@/components/Settings/Integrations/ApiAccessSection';

const initialIntegrationsState = {
  stripe: { enabled: false, publishable_key: '', webhook_secret: '', test_mode: true },
  mailgun: { enabled: false, api_key: '', domain: '', from_email: '' },
  slack: { enabled: false, webhook_url: '', channel: '#general' },
  google_calendar: { enabled: false, client_id: '', client_secret: '' },
  zapier: { enabled: false, webhook_url: '' },
  webhooks: []
};

const IntegrationsTab = ({ teamSettings, onSettingsUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState(initialIntegrationsState);

  const isAdmin = ['admin', 'full_admin'].includes(user?.role);

  useEffect(() => {
    if (teamSettings?.integrations_config) {
      // Ensure webhooks is always an array
      const currentConfig = teamSettings.integrations_config;
      const webhooks = Array.isArray(currentConfig.webhooks) ? currentConfig.webhooks : [];
      setIntegrations({ ...initialIntegrationsState, ...currentConfig, webhooks });
    } else {
      setIntegrations(initialIntegrationsState);
    }
  }, [teamSettings]);

  const handleIntegrationChange = (integrationKey, field, value) => {
    setIntegrations(prev => ({
      ...prev,
      [integrationKey]: {
        ...(prev[integrationKey] || {}),
        [field]: value
      }
    }));
  };

  const handleWebhookAdd = () => {
    const newWebhook = {
      id: Date.now().toString(),
      name: '',
      url: '',
      events: [],
      enabled: true
    };
    setIntegrations(prev => ({
      ...prev,
      webhooks: [...(prev.webhooks || []), newWebhook]
    }));
  };

  const handleWebhookRemove = (webhookId) => {
    setIntegrations(prev => ({
      ...prev,
      webhooks: (prev.webhooks || []).filter(w => w.id !== webhookId)
    }));
  };

  const handleWebhookChange = (webhookId, field, value) => {
    setIntegrations(prev => ({
      ...prev,
      webhooks: (prev.webhooks || []).map(w => 
        w.id === webhookId ? { ...w, [field]: value } : w
      )
    }));
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only admins can update integration settings.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const settingsData = {
        team_id: user.team_id,
        integrations_config: integrations,
        created_by: user.id
      };

      const { error } = await supabase
        .from('team_settings')
        .upsert(settingsData, { onConflict: 'team_id' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Integration settings updated successfully!'
      });

      onSettingsUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update integration settings: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestIntegration = (integrationName) => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: `${integrationName} integration testing isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀`,
      duration: 5000,
    });
  };

  const integrationCardData = [
    { key: 'stripe', name: 'Stripe', description: 'Accept payments and manage subscriptions', icon: CreditCard, color: 'text-purple-500', fields: [ { key: 'publishable_key', label: 'Publishable Key', type: 'text', placeholder: 'pk_test_...' }, { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...' }, { key: 'test_mode', label: 'Test Mode', type: 'checkbox' } ] },
    { key: 'mailgun', name: 'Mailgun', description: 'Send transactional emails and notifications', icon: Mail, color: 'text-red-500', fields: [ { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'key-...' }, { key: 'domain', label: 'Domain', type: 'text', placeholder: 'mg.yourdomain.com' }, { key: 'from_email', label: 'From Email', type: 'email', placeholder: 'noreply@yourdomain.com' } ] },
    { key: 'slack', name: 'Slack', description: 'Send notifications to Slack channels', icon: MessageSquare, color: 'text-green-500', fields: [ { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/...' }, { key: 'channel', label: 'Default Channel', type: 'text', placeholder: '#general' } ] },
    { key: 'google_calendar', name: 'Google Calendar', description: 'Sync events and appointments', icon: Calendar, color: 'text-blue-500', fields: [ { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Google OAuth Client ID' }, { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Google OAuth Client Secret' } ] },
    { key: 'zapier', name: 'Zapier', description: 'Connect with 5000+ apps via Zapier', icon: Zap, color: 'text-orange-500', fields: [ { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/...' } ] }
  ];

  const webhookEventsList = [ 'user.created', 'user.updated', 'user.deleted', 'invoice.created', 'invoice.paid', 'proposal.created', 'proposal.accepted', 'lead.created', 'lead.updated' ];

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg mb-2">Access Restricted</p>
        <p className="text-slate-500">Only admins can access integration settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrationCardData.map((integration, index) => (
          <IntegrationCard
            key={integration.key}
            integration={integration}
            config={integrations[integration.key] || { enabled: false }}
            onIntegrationChange={handleIntegrationChange}
            onTestIntegration={handleTestIntegration}
            index={index}
          />
        ))}
      </div>

      <CustomWebhooksSection
        webhooks={integrations.webhooks}
        webhookEvents={webhookEventsList}
        onWebhookAdd={handleWebhookAdd}
        onWebhookRemove={handleWebhookRemove}
        onWebhookChange={handleWebhookChange}
      />

      <ApiAccessSection />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Integration Settings'}
        </Button>
      </motion.div>
    </div>
  );
};

export default IntegrationsTab;