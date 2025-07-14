import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const employmentTypes = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'consultant', label: 'Consultant' }
];

const ProfessionalInfoSection = ({ formData, errors, onInputChange }) => {
  return (
    <div className="border-t border-slate-600 pt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Professional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position_job_title" className="text-slate-300">
            Job Title / Position
          </Label>
          <Input
            id="position_job_title"
            value={formData.position_job_title}
            onChange={(e) => onInputChange('position_job_title', e.target.value)}
            placeholder="e.g., Senior Developer, Marketing Manager"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employment_type" className="text-slate-300">
            Employment Type
          </Label>
          <Select value={formData.employment_type} onValueChange={(value) => onInputChange('employment_type', value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              {employmentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_name" className="text-slate-300">
            Business Name
          </Label>
          <Input
            id="business_name"
            value={formData.business_name}
            onChange={(e) => onInputChange('business_name', e.target.value)}
            placeholder="Enter your business name"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registered_business_name" className="text-slate-300">
            Registered Business Name
          </Label>
          <Input
            id="registered_business_name"
            value={formData.registered_business_name}
            onChange={(e) => onInputChange('registered_business_name', e.target.value)}
            placeholder="Official registered business name"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="abn" className="text-slate-300">
            ABN (Australian Business Number)
          </Label>
          <Input
            id="abn"
            value={formData.abn}
            onChange={(e) => onInputChange('abn', e.target.value)}
            placeholder="Enter your 11-digit ABN (e.g., 51824753556)"
            className="bg-slate-700 border-slate-600 text-white"
          />
          <p className="text-slate-500 text-xs">
            Enter your 11-digit ABN (e.g., 51824753556). No spaces or letters.
          </p>
          {errors.abn && (
            <p className="text-red-400 text-sm">{errors.abn}</p>
          )}
        </div>

        {formData.abn && (
          <div className="space-y-2">
            <Label htmlFor="acn" className="text-slate-300">
              ACN (Australian Company Number)
            </Label>
            <Input
              id="acn"
              value={formData.acn}
              onChange={(e) => onInputChange('acn', e.target.value)}
              placeholder="Enter your 9-digit ACN (e.g., 123456789)"
              className="bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-slate-500 text-xs">
              Enter your 9-digit ACN (e.g., 123456789). No letters or spaces.
            </p>
            {errors.acn && (
              <p className="text-red-400 text-sm">{errors.acn}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalInfoSection;