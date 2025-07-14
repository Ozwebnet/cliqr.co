import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Layout } from 'lucide-react';

const InterfacePreferences = ({ formData, onInputChange }) => {
  const preferences = [
    { id: 'sidebar_collapsed', label: 'Collapsed Sidebar', description: 'Start with sidebar collapsed by default' },
    { id: 'auto_save', label: 'Auto Save', description: 'Automatically save changes as you type' },
    { id: 'keyboard_shortcuts', label: 'Keyboard Shortcuts', description: 'Enable keyboard shortcuts for faster navigation' },
    { id: 'show_tooltips', label: 'Show Tooltips', description: 'Display helpful tooltips on hover' },
    { id: 'compact_mode', label: 'Compact Mode', description: 'Use smaller spacing and elements' },
    { id: 'high_contrast', label: 'High Contrast', description: 'Increase contrast for better visibility' },
    { id: 'reduce_motion', label: 'Reduce Motion', description: 'Minimize animations and transitions' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Layout className="w-5 h-5 mr-2" />
            Interface Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {preferences.slice(0, 4).map(pref => (
              <div key={pref.id} className="flex items-center space-x-3">
                <Checkbox
                  id={pref.id}
                  checked={formData[pref.id]}
                  onCheckedChange={(checked) => onInputChange(pref.id, checked)}
                />
                <div>
                  <Label htmlFor={pref.id} className="text-slate-300 font-medium">
                    {pref.label}
                  </Label>
                  <p className="text-slate-500 text-sm">{pref.description}</p>
                </div>
              </div>
            ))}
            <div className="space-y-4">
              {preferences.slice(4).map(pref => (
                <div key={pref.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={pref.id}
                    checked={formData[pref.id]}
                    onCheckedChange={(checked) => onInputChange(pref.id, checked)}
                  />
                  <div>
                    <Label htmlFor={pref.id} className="text-slate-300 font-medium">
                      {pref.label}
                    </Label>
                    <p className="text-slate-500 text-sm">{pref.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InterfacePreferences;