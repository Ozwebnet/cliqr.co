import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const QuickStatsSection = ({ user, formData }) => {
  return (
    <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-white">Profile Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{user?.role?.replace('_', ' ').toUpperCase()}</div>
            <div className="text-slate-400 text-sm">Role</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {new Date(user?.created_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
            </div>
            <div className="text-slate-400 text-sm">Member Since</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {formData.time_zone?.split('/')[1] || 'Sydney'}
            </div>
            <div className="text-slate-400 text-sm">Timezone</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {formData.preferred_contact_method?.toUpperCase() || 'EMAIL'}
            </div>
            <div className="text-slate-400 text-sm">Contact</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStatsSection;