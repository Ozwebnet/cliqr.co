import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Monitor } from 'lucide-react';

const DLS_DEFAULT_LAYOUT = { 
  cards_per_row: 4, 
  show_charts: true, 
  show_recent_activity: true 
};

const DashboardLayoutSettings = ({ dashboardLayout: inputLayoutProp = DLS_DEFAULT_LAYOUT, onDashboardLayoutChange }) => {
  
  const currentLayout = {
    ...DLS_DEFAULT_LAYOUT,
    ...(typeof inputLayoutProp === 'object' && inputLayoutProp !== null ? inputLayoutProp : {}),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Monitor className="w-5 h-5 mr-2" />
            Dashboard Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Cards Per Row</Label>
                <Select 
                  value={currentLayout.cards_per_row.toString()} 
                  onValueChange={(value) => onDashboardLayoutChange('cards_per_row', parseInt(value))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Cards</SelectItem>
                    <SelectItem value="3">3 Cards</SelectItem>
                    <SelectItem value="4">4 Cards</SelectItem>
                    <SelectItem value="6">6 Cards</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="show_charts"
                  checked={currentLayout.show_charts}
                  onCheckedChange={(checked) => onDashboardLayoutChange('show_charts', checked)}
                />
                <div>
                  <Label htmlFor="show_charts" className="text-slate-300 font-medium">
                    Show Charts
                  </Label>
                  <p className="text-slate-500 text-sm">Display charts and graphs on dashboard</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="show_recent_activity"
                  checked={currentLayout.show_recent_activity}
                  onCheckedChange={(checked) => onDashboardLayoutChange('show_recent_activity', checked)}
                />
                <div>
                  <Label htmlFor="show_recent_activity" className="text-slate-300 font-medium">
                    Show Recent Activity
                  </Label>
                  <p className="text-slate-500 text-sm">Display recent activity feed</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardLayoutSettings;