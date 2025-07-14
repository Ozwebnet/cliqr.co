import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Upload } from 'lucide-react';

const BrandingSection = ({ logoUrl, onLogoUpload }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Company Branding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600">
                {logoUrl ? (
                  <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <Building className="w-8 h-8 text-slate-400" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium mb-2">Company Logo</h3>
              <p className="text-slate-400 text-sm mb-4">Upload your company logo to personalize invoices, proposals, and other documents.</p>
              <Button onClick={onLogoUpload} variant="outline" size="sm" className="text-slate-300 border-slate-600 hover:bg-slate-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BrandingSection;