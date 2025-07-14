import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  DollarSign, 
  Edit2, 
  Trash2,
  GripVertical,
  RefreshCw,
  CalendarClock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getStageColor, formatCurrency, formatDate, formatNextContactInfo } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const LeadCard = ({ lead, onEdit, onDelete, isDraggable = false, onMove, isFirstStage, isLastStage, listeners, className = '', ...props }) => {
  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-lg">{lead.company_name}</h3>
          <p className="text-slate-400 text-sm">{lead.contact_name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStageColor(lead.stage)}`}></div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {lead.email && (
          <div className="flex items-center text-slate-300 text-sm">
            <Mail className="w-4 h-4 mr-2 text-slate-400" />
            {lead.email}
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center text-slate-300 text-sm">
            <Phone className="w-4 h-4 mr-2 text-slate-400" />
            {lead.phone}
          </div>
        )}
        {lead.estimated_value > 0 && (
          <div className="flex items-center text-slate-300 text-sm">
            <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
            {formatCurrency(lead.estimated_value)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-slate-700 text-slate-300">
          {lead.source || 'N/A'}
        </Badge>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(lead)} className="text-slate-400 hover:text-white p-1 h-auto">
            <Edit2 className="w-4 h-4" />
          </Button>
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={() => onDelete(lead.id)} className="text-red-500 hover:text-red-400 p-1 h-auto">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );

  if (isDraggable) {
    const oneOffValue = lead.interests_one_off?.reduce((sum, item) => sum + (Number(item.price) || 0), 0) || 0;
    const retainerValue = lead.interests_retainers?.reduce((sum, item) => sum + (Number(item.price) || 0), 0) || 0;
    const contactInfo = formatNextContactInfo(lead.next_contact_date);

    return (
      <motion.div
        layout
        layoutId={`lead-${lead.id}`}
        className={`bg-slate-800 border border-slate-700 rounded-lg p-3 relative ${className}`}
        whileHover={{ borderColor: '#5E6AD2' }}
        {...props}
      >
        <div className="absolute top-2 right-2 flex items-center text-slate-500">
          <Button size="icon" variant="ghost" className="h-6 w-6 p-0 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" onClick={(e) => { e.stopPropagation(); onMove('left'); }} disabled={isFirstStage}>
            <ChevronLeft size={16} />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 p-0 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" onClick={(e) => { e.stopPropagation(); onMove('right'); }} disabled={isLastStage}>
            <ChevronRight size={16} />
          </Button>
          <div {...listeners} className="hover:text-slate-300 cursor-grab active:cursor-grabbing pl-1">
            <GripVertical size={18} />
          </div>
        </div>
        <h4 className="text-white font-medium text-sm mb-1 pr-6">{lead.company_name}</h4>
        <p className="text-slate-400 text-xs mb-2 pr-6">{lead.contact_name}</p>
        
        <div className="space-y-1.5 mb-3 text-xs">
          {oneOffValue > 0 && (
            <div className="flex items-center text-slate-300">
              <DollarSign className="w-3 h-3 mr-1.5 text-green-400 flex-shrink-0" />
              <span className="font-medium text-green-400">{formatCurrency(oneOffValue)}</span>
              <span className="text-slate-400 ml-1.5">(One-off)</span>
            </div>
          )}
          {retainerValue > 0 && (
            <div className="flex items-center text-slate-300">
              <RefreshCw className="w-3 h-3 mr-1.5 text-blue-400 flex-shrink-0" />
              <span className="font-medium text-blue-400">{formatCurrency(retainerValue)}</span>
              <span className="text-slate-400 ml-1.5">(Retainer)</span>
            </div>
          )}
          {oneOffValue === 0 && retainerValue === 0 && (
             <div className="flex items-center text-slate-500">
              <DollarSign className="w-3 h-3 mr-1.5" />
              <span>No interests priced.</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {lead.next_contact_date ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={`${contactInfo.color} text-xs cursor-pointer`} variant="outline">
                    <CalendarClock className="w-3 h-3 mr-1.5" />
                    {contactInfo.relative}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{contactInfo.full}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Badge className="bg-slate-700 text-slate-400 text-xs" variant="outline">
              No Follow-up
            </Badge>
          )}
          <div className="flex space-x-1">
           <Button size="icon" variant="ghost" onClick={() => onEdit(lead)} className="text-slate-400 hover:text-white p-1 h-6 w-6">
            <Edit2 className="w-3 h-3" />
          </Button>
          {onDelete && (
            <Button size="icon" variant="ghost" onClick={() => onDelete(lead.id)} className="text-red-500 hover:text-red-400 p-1 h-6 w-6">
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-purple-500 transition-colors ${className}`}
    >
      {cardContent}
    </motion.div>
  );
};

export default LeadCard;