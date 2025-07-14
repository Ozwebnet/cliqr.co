import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LegalInfoSection = ({ formData, errors, onInputChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Legal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_abn" className="text-slate-300">
                ABN (Australian Business Number)
              </Label>
              <Input
                id="business_abn"
                value={formData.business_abn}
                onChange={(e) => onInputChange('business_abn', e.target.value)}
                placeholder="Enter your 11-digit ABN (e.g., 51824753556)"
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-slate-500 text-xs">
                Enter your 11-digit ABN (e.g., 51824753556). No spaces or letters.
              </p>
              {errors.business_abn && (
                <p className="text-red-400 text-sm">{errors.business_abn}</p>
              )}
            </div>

            {formData.business_abn && (
              <div className="space-y-2">
                <Label htmlFor="business_acn" className="text-slate-300">
                  ACN (Australian Company Number)
                </Label>
                <Input
                  id="business_acn"
                  value={formData.business_acn}
                  onChange={(e) => onInputChange('business_acn', e.target.value)}
                  placeholder="Enter your 9-digit ACN (e.g., 123456789)"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-slate-500 text-xs">
                  Enter your 9-digit ACN (e.g., 123456789). No letters or spaces.
                </p>
                {errors.business_acn && (
                  <p className="text-red-400 text-sm">{errors.business_acn}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LegalInfoSection;