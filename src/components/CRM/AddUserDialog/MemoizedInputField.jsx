import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MemoizedInputField = React.memo(({ id, label, type = 'text', icon, value, onChange, placeholder, isRequired = false, className = '', onPaste, error, description }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
      {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {description && <p className="text-xs text-slate-400 mb-1">{description}</p>}
    <div className="relative flex items-center">
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-slate-800 border-slate-600 text-white pl-3 pr-3 py-2 h-10 ${error ? 'border-red-500' : ''}`}
        required={isRequired}
        onPaste={onPaste}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
));

export default MemoizedInputField;