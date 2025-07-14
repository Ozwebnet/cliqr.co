import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Save } from 'lucide-react';

const SecurityPreferencesSection = ({ settings, onSettingChange, onSave, loading }) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Security Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="loginNotifications"
                checked={settings.loginNotifications}
                onCheckedChange={(checked) => onSettingChange('loginNotifications', checked)}
              />
              <div>
                <Label htmlFor="loginNotifications" className="text-slate-300 font-medium">
                  Login Notifications
                </Label>
                <p className="text-slate-500 text-sm">Get notified when someone logs into your account from a new device or location.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="securityAlerts"
                checked={settings.securityAlerts}
                onCheckedChange={(checked) => onSettingChange('securityAlerts', checked)}
              />
              <div>
                <Label htmlFor="securityAlerts" className="text-slate-300 font-medium">
                  Security Alerts
                </Label>
                <p className="text-slate-500 text-sm">Receive alerts about suspicious account activity, like failed login attempts.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="deviceTracking"
                checked={settings.deviceTracking}
                onCheckedChange={(checked) => onSettingChange('deviceTracking', checked)}
              />
              <div>
                <Label htmlFor="deviceTracking" className="text-slate-300 font-medium">
                  Device Tracking
                </Label>
                <p className="text-slate-500 text-sm">Track devices that access your account for better security monitoring.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout" className="text-slate-300 font-medium">
                Session Timeout (minutes)
              </Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5" 
                max="480" 
                value={settings.sessionTimeout}
                onChange={(e) => onSettingChange('sessionTimeout', parseInt(e.target.value) || 30)}
                className="bg-slate-700 border-slate-600 text-white w-32"
              />
              <p className="text-slate-500 text-sm">Automatically log out after a period of inactivity.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-600">
          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Security Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityPreferencesSection;