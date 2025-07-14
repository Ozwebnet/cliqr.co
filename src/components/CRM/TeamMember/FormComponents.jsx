import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select.jsx';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Upload, AlertTriangle } from 'lucide-react';

export const FormSection = ({ title, children, className = '' }) => (
  <div className={`space-y-4 py-4 border-b border-slate-700 last:border-b-0 ${className}`}>
    <h2 className="text-xl font-semibold text-purple-300 mb-4">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {children}
    </div>
  </div>
);

export const MemoizedInputField = React.memo(({ id, label, type = 'text', icon, value, onChange, placeholder, isRequired = false, className = '', onPaste, description, error }) => (
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

export const MemoizedSelectField = React.memo(({ id, label, icon, value, onValueChange, placeholder, options, isRequired = false, className = '', description }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
      {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {description && <p className="text-xs text-slate-400 mb-1">{description}</p>}
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

export const MemoizedMultiSelectField = React.memo(({ id, label, icon, value, onValueChange, placeholder, options, isRequired = false, className = '', description }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedValues = value || [];

  const handleToggle = (optionValue) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    onValueChange(newValues);
  };

  const displayText = selectedValues.length > 0 
    ? `${selectedValues.length} skill${selectedValues.length > 1 ? 's' : ''} selected`
    : placeholder;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
        {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
        {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && <p className="text-xs text-slate-400 mb-1">{description}</p>}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-10"
        >
          <span className={selectedValues.length === 0 ? 'text-slate-400' : 'text-white'}>
            {displayText}
          </span>
          <span className="ml-2">▼</span>
        </Button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {options.map(option => (
              <div key={option.value} className="flex items-center p-2 hover:bg-slate-700">
                <Checkbox
                  id={`${id}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => handleToggle(option.value)}
                  className="mr-2"
                />
                <Label htmlFor={`${id}-${option.value}`} className="text-white text-sm cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export const MemoizedFileUploadField = React.memo(({ id, label, icon, placeholder, isRequired = false, className = '', description }) => {
  const handleFileUpload = () => {
    toast({
      title: "🚧 File Upload Not Implemented",
      description: "File upload functionality isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      variant: "default",
      duration: 3000,
    });
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} className="text-slate-300 flex items-center text-sm">
        {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-purple-400"})}
        {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && <p className="text-xs text-slate-400 mb-1">{description}</p>}
      <Button
        type="button"
        variant="outline"
        onClick={handleFileUpload}
        className="w-full justify-start bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700 h-10"
      >
        <Upload className="mr-2 h-4 w-4" />
        {placeholder}
      </Button>
    </div>
  );
});

export const MemoizedPasswordField = React.memo(({ id, label, icon, value, onChange, placeholder, show, toggleShow, isRequired = false, showIndicator = false, userDetailsForValidation, className = '', onPaste }) => (
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
  </div>
));

export const PaymentWarning = React.memo(() => (
  <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3 mb-4">
    <div className="flex items-start space-x-2">
      <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
      <p className="text-amber-200 text-xs">
        <strong>Important:</strong> Ensure details are correct. Incorrect information may result in failed or delayed payments.
      </p>
    </div>
  </div>
));