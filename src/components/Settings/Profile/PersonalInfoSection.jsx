import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PersonalInfoSection = ({ formData, errors, onInputChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="legal_first_name" className="text-slate-300">
          First Name *
        </Label>
        <Input
          id="legal_first_name"
          value={formData.legal_first_name}
          onChange={(e) => onInputChange('legal_first_name', e.target.value)}
          placeholder="Enter your first name"
          className="bg-slate-700 border-slate-600 text-white"
        />
        {errors.legal_first_name && (
          <p className="text-red-400 text-sm">{errors.legal_first_name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="legal_middle_name" className="text-slate-300">
          Middle Name
        </Label>
        <Input
          id="legal_middle_name"
          value={formData.legal_middle_name}
          onChange={(e) => onInputChange('legal_middle_name', e.target.value)}
          placeholder="Enter your middle name"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="legal_last_name" className="text-slate-300">
          Last Name *
        </Label>
        <Input
          id="legal_last_name"
          value={formData.legal_last_name}
          onChange={(e) => onInputChange('legal_last_name', e.target.value)}
          placeholder="Enter your last name"
          className="bg-slate-700 border-slate-600 text-white"
        />
        {errors.legal_last_name && (
          <p className="text-red-400 text-sm">{errors.legal_last_name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferred_name" className="text-slate-300">
          Preferred Name
        </Label>
        <Input
          id="preferred_name"
          value={formData.preferred_name}
          onChange={(e) => onInputChange('preferred_name', e.target.value)}
          placeholder="How you'd like to be called"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-300">
          Email Address *
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          placeholder="Enter your email"
          className="bg-slate-700 border-slate-600 text-white"
          disabled
        />
        <p className="text-slate-500 text-xs">Email changes require admin approval</p>
        {errors.email && (
          <p className="text-red-400 text-sm">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number" className="text-slate-300">
          Phone Number
        </Label>
        <Input
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => onInputChange('phone_number', e.target.value)}
          placeholder="Enter Australian phone number (e.g., 0412345678)"
          className="bg-slate-700 border-slate-600 text-white"
        />
        <p className="text-slate-500 text-xs">
          Enter your Australian phone number (mobile or landline), e.g. 0412345678 or 0298765432. No spaces or symbols.
        </p>
        {errors.phone_number && (
          <p className="text-red-400 text-sm">{errors.phone_number}</p>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;