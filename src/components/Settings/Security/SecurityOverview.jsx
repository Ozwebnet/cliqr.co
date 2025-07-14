import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Globe } from 'lucide-react';

const SecurityOverview = ({ twoFactorEnabled, sessionCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Password Strength</p>
              <p className="text-white text-lg font-semibold">Strong</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Two-Factor Auth</p>
              <p className="text-white text-lg font-semibold">
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            {twoFactorEnabled ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Sessions</p>
              <p className="text-white text-lg font-semibold">{sessionCount}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityOverview;