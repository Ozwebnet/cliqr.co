import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const LeadStatsCards = ({ leads }) => {
  const totalLeads = leads.length;

  const potentialLeads = leads.filter(lead => lead.stage !== 'won' && lead.stage !== 'lost');
  const wonLeads = leads.filter(lead => lead.stage === 'won');

  const oneOffPipelineValue = potentialLeads.reduce((sum, lead) => {
    const oneOffValue = lead.interests_one_off?.reduce((s, item) => s + (Number(item.price) || 0), 0) || 0;
    return sum + oneOffValue;
  }, 0);

  const retainerPipelineValue = potentialLeads.reduce((sum, lead) => {
    const retainerValue = lead.interests_retainers?.reduce((s, item) => s + (Number(item.price) || 0), 0) || 0;
    return sum + retainerValue;
  }, 0);

  const oneOffWonValue = wonLeads.reduce((sum, lead) => {
    const oneOffValue = lead.interests_one_off?.reduce((s, item) => s + (Number(item.price) || 0), 0) || 0;
    return sum + oneOffValue;
  }, 0);

  const retainerWonValue = wonLeads.reduce((sum, lead) => {
    const retainerValue = lead.interests_retainers?.reduce((s, item) => s + (Number(item.price) || 0), 0) || 0;
    return sum + retainerValue;
  }, 0);

  const conversionRate = totalLeads > 0 ? (wonLeads.length / totalLeads * 100).toFixed(1) : 0;

  const stats = [
    { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-blue-500' },
    { 
      label: 'Pipeline Value', 
      isPipeline: true,
      oneOff: oneOffPipelineValue, 
      retainer: retainerPipelineValue, 
      icon: DollarSign, 
      color: 'text-green-500' 
    },
    { 
      label: 'Won Value',
      isPipeline: false, 
      oneOff: oneOffWonValue,
      retainer: retainerWonValue,
      icon: TrendingUp, 
      color: 'text-purple-500' 
    },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Star, color: 'text-yellow-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-4">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-slate-400 text-xs lg:text-sm mb-1 truncate">{stat.label}</p>
                  {stat.hasOwnProperty('oneOff') ? (
                    <div className="space-y-1">
                      <div className="flex items-baseline">
                        <p className="text-white text-lg lg:text-xl xl:text-2xl font-bold truncate">{formatCurrency(stat.oneOff)}</p>
                        <span className="text-slate-400 text-xs ml-1 flex-shrink-0">One-off</span>
                      </div>
                      <div className="flex items-baseline">
                        <p className="text-blue-400 text-base lg:text-lg xl:text-xl font-semibold truncate">{formatCurrency(stat.retainer)}</p>
                        <span className="text-slate-400 text-xs ml-1 flex-shrink-0">p/m</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white text-lg lg:text-xl xl:text-2xl font-bold truncate">{stat.value}</p>
                  )}
                </div>
                <Icon className={`w-6 h-6 lg:w-8 lg:h-8 ${stat.color} flex-shrink-0 ml-2`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LeadStatsCards;