import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const BasicInfoSection = ({ formData, errors, onInputChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team_name" className="text-slate-300">
                Company/Team Name *
              </Label>
              <Input
                id="team_name"
                value={formData.team_name}
                onChange={(e) => onInputChange('team_name', e.target.value)}
                placeholder="Enter your company name"
                className="bg-slate-700 border-slate-600 text-white"
              />
              {errors.team_name && (
                <p className="text-red-400 text-sm">{errors.team_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_email" className="text-slate-300">
                Business Email
              </Label>
              <Input
                id="business_email"
                type="email"
                value={formData.business_email}
                onChange={(e) => onInputChange('business_email', e.target.value)}
                placeholder="contact@company.com"
                className="bg-slate-700 border-slate-600 text-white"
              />
              {errors.business_email && (
                <p className="text-red-400 text-sm">{errors.business_email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_phone" className="text-slate-300">
                Business Phone
              </Label>
              <Input
                id="business_phone"
                value={formData.business_phone}
                onChange={(e) => onInputChange('business_phone', e.target.value)}
                placeholder="Enter Australian phone number (e.g., 0298765432)"
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-slate-500 text-xs">
                Enter your Australian phone number (mobile or landline), e.g. 0412345678 or 0298765432. No spaces or symbols.
              </p>
              {errors.business_phone && (
                <p className="text-red-400 text-sm">{errors.business_phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_website" className="text-slate-300">
                Website
              </Label>
              <Input
                id="business_website"
                value={formData.business_website}
                onChange={(e) => onInputChange('business_website', e.target.value)}
                placeholder="https://www.company.com"
                className="bg-slate-700 border-slate-600 text-white"
              />
              {errors.business_website && (
                <p className="text-red-400 text-sm">{errors.business_website}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="team_description" className="text-slate-300">
                Company Description
              </Label>
              <Textarea
                id="team_description"
                value={formData.team_description}
                onChange={(e) => onInputChange('team_description', e.target.value)}
                placeholder="Brief description of your company and services..."
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="business_address" className="text-slate-300">
                Business Address
              </Label>
              <Textarea
                id="business_address"
                value={formData.business_address}
                onChange={(e) => onInputChange('business_address', e.target.value)}
                placeholder="123 Business Street, Sydney NSW 2000, Australia"
                className="bg-slate-700 border-slate-600 text-white"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BasicInfoSection;