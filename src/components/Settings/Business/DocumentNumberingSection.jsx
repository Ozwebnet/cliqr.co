import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

const DocumentNumberingSection = ({ formData, onInputChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Document Numbering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_prefix" className="text-slate-300">
                Invoice Prefix
              </Label>
              <Input
                id="invoice_prefix"
                value={formData.invoice_prefix}
                onChange={(e) => onInputChange('invoice_prefix', e.target.value)}
                placeholder="INV"
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-slate-500 text-xs">e.g., INV-001, INV-002</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_prefix" className="text-slate-300">
                Proposal Prefix
              </Label>
              <Input
                id="proposal_prefix"
                value={formData.proposal_prefix}
                onChange={(e) => onInputChange('proposal_prefix', e.target.value)}
                placeholder="PROP"
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-slate-500 text-xs">e.g., PROP-001, PROP-002</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead_prefix" className="text-slate-300">
                Lead Prefix
              </Label>
              <Input
                id="lead_prefix"
                value={formData.lead_prefix}
                onChange={(e) => onInputChange('lead_prefix', e.target.value)}
                placeholder="LEAD"
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-slate-500 text-xs">e.g., LEAD-001, LEAD-002</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DocumentNumberingSection;