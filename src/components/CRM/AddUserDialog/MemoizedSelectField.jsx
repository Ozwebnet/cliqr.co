import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select.jsx';
import { Label } from '@/components/ui/label';

const MemoizedSelectField = React.memo(({ id, label, icon, value, onValueChange, placeholder, options, isRequired = false, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
      {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Select onValueChange={onValueChange} value={value} required={isRequired}>
      <SelectTrigger id={id} className="w-full bg-slate-800 border-slate-600 text-white pl-3 pr-3 py-2 h-10">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
));

export default MemoizedSelectField;