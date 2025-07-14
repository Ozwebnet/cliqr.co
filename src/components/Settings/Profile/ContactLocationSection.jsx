import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const contactMethods = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'both', label: 'Both Email & Phone' }
];

const ContactLocationSection = ({ formData, onInputChange }) => {
  return (
    <div className="border-t border-slate-600 pt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Contact & Location</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preferred_contact_method" className="text-slate-300">
            Preferred Contact Method
          </Label>
          <Select value={formData.preferred_contact_method} onValueChange={(value) => onInputChange('preferred_contact_method', value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select contact method" />
            </SelectTrigger>
            <SelectContent>
              {contactMethods.map(method => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-slate-300">
            Location
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            placeholder="e.g., Sydney, NSW, Australia"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactLocationSection;