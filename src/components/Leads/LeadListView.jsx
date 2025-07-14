import React from 'react';
import LeadCard from '@/components/Leads/LeadCard';

const LeadListView = ({ leads, onEditLead }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leads.map(lead => (
        <LeadCard 
          key={lead.id} 
          lead={lead} 
          onEdit={onEditLead} 
        />
      ))}
    </div>
  );
};

export default LeadListView;