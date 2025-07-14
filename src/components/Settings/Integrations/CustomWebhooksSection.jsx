import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Database, Plus, Trash2 } from 'lucide-react';

const CustomWebhooksSection = ({ webhooks, webhookEvents, onWebhookAdd, onWebhookRemove, onWebhookChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Custom Webhooks
            </CardTitle>
            <Button onClick={onWebhookAdd} size="sm" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(webhooks || []).length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No custom webhooks configured</p>
              <p className="text-slate-500 text-sm">Add webhooks to receive real-time notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(webhooks || []).map((webhook) => (
                <div key={webhook.id} className="p-4 bg-slate-700 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Webhook Name</Label>
                      <Input
                        value={webhook.name}
                        onChange={(e) => onWebhookChange(webhook.id, 'name', e.target.value)}
                        placeholder="My Custom Webhook"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Webhook URL</Label>
                      <Input
                        value={webhook.url}
                        onChange={(e) => onWebhookChange(webhook.id, 'url', e.target.value)}
                        placeholder="https://your-app.com/webhook"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Label className="text-slate-300">Events</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {webhookEvents.map((event) => (
                        <div key={event} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${webhook.id}_${event}`}
                            checked={webhook.events?.includes(event) || false}
                            onCheckedChange={(checked) => {
                              const currentEvents = webhook.events || [];
                              const newEvents = checked
                                ? [...currentEvents, event]
                                : currentEvents.filter(e => e !== event);
                              onWebhookChange(webhook.id, 'events', newEvents);
                            }}
                          />
                          <Label htmlFor={`${webhook.id}_${event}`} className="text-slate-400 text-sm">
                            {event}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${webhook.id}_enabled`}
                        checked={webhook.enabled || false}
                        onCheckedChange={(checked) => onWebhookChange(webhook.id, 'enabled', checked)}
                      />
                      <Label htmlFor={`${webhook.id}_enabled`} className="text-slate-300">
                        Enabled
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onWebhookRemove(webhook.id)}
                      className="text-red-400 border-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomWebhooksSection;