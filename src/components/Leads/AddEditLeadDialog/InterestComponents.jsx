import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PriceInput from '@/components/Leads/PriceInput';
import { Edit, Trash2, Check, Search, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const InterestEditor = ({ interest, onSave, onCancel }) => {
  const [data, setData] = useState(interest);
  const handleChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-slate-800 p-4 rounded-lg border border-purple-500 overflow-hidden"
    >
      <div className="space-y-4">
        <div><Label className="text-slate-300">Service</Label><Input value={data.service} onChange={(e) => handleChange('service', e.target.value)} className="bg-slate-700 border-slate-600" /></div>
        <div><Label className="text-slate-300">Scope</Label><Textarea value={data.scope} onChange={(e) => handleChange('scope', e.target.value)} className="bg-slate-700 border-slate-600" /></div>
        <div><Label className="text-slate-300">Benefits</Label><Textarea value={data.benefits} onChange={(e) => handleChange('benefits', e.target.value)} className="bg-slate-700 border-slate-600" /></div>
        <div><Label className="text-slate-300">Price (AUD)</Label><PriceInput value={data.price} onChange={(val) => handleChange('price', val)} /></div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={() => onSave(data)} className="bg-green-600 hover:bg-green-700"><Check className="w-4 h-4 mr-2" /> Done</Button>
        </div>
      </div>
    </motion.div>
  );
};

export const InterestCardDisplay = ({ interest, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Card className="bg-slate-800 border-slate-700 w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div>
            <p className="font-bold text-white">{interest.service}</p>
            <p className="text-lg font-semibold text-green-400">{formatCurrency(interest.price)}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Button type="button" size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
            <Button type="button" size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="h-8 w-8 text-red-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
              <div className="space-y-3 border-t border-slate-700 pt-3">
                <div><h4 className="font-semibold text-slate-300 flex items-center"><Search className="w-4 h-4 mr-2" /> Scope</h4><p className="text-slate-400 whitespace-pre-wrap pl-6">{interest.scope}</p></div>
                <div><h4 className="font-semibold text-slate-300 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Benefits</h4><p className="text-slate-400 whitespace-pre-wrap pl-6">{interest.benefits}</p></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};