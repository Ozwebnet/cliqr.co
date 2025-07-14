import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle } from 'lucide-react';

const IntegrationCard = ({ integration, config, onIntegrationChange, onTestIntegration, index }) => {
  const Icon = integration.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon className={`w-6 h-6 ${integration.color}`} />
              <div>
                <CardTitle className="text-white">{integration.name}</CardTitle>
                <p className="text-slate-400 text-sm">{integration.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {config.enabled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-500" />
              )}
              <Checkbox
                checked={config.enabled || false}
                onCheckedChange={(checked) => onIntegrationChange(integration.key, 'enabled', checked)}
              />
            </div>
          </div>
        </CardHeader>
        {config.enabled && (
          <CardContent className="space-y-4">
            {integration.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                {field.type === 'checkbox' ? (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${integration.key}_${field.key}`}
                      checked={config[field.key] || false}
                      onCheckedChange={(checked) => onIntegrationChange(integration.key, field.key, checked)}
                    />
                    <Label htmlFor={`${integration.key}_${field.key}`} className="text-slate-300">
                      {field.label}
                    </Label>
                  </div>
                ) : (
                  <>
                    <Label htmlFor={`${integration.key}_${field.key}`} className="text-slate-300">
                      {field.label}
                    </Label>
                    <Input
                      id={`${integration.key}_${field.key}`}
                      type={field.type}
                      value={config[field.key] || ''}
                      onChange={(e) => onIntegrationChange(integration.key, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </>
                )}
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTestIntegration(integration.name)}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                Test Connection
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default IntegrationCard;