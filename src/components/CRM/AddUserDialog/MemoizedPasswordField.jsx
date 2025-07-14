import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/lib/passwordUtils.jsx';

const MemoizedPasswordField = React.memo(({ id, label, icon, value, onChange, placeholder, show, toggleShow, isRequired = false, showIndicator = false, userDetailsForValidation, className = '', onPaste }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
      {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <div className="relative flex items-center">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-slate-800 border-slate-600 text-white pl-3 pr-10 py-2 h-10"
        required={isRequired}
        onPaste={onPaste}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleShow}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-white"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </div>
    {showIndicator && value && (
       <PasswordStrengthIndicator password={value} userDetails={userDetailsForValidation} />
    )}
  </div>
));

export default MemoizedPasswordField;