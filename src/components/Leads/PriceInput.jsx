import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

const PriceInput = ({ value, onChange }) => {
  const handleIncrement = () => {
    onChange((Number(value) || 0) + 100);
  };

  const handleDecrement = () => {
    onChange(Math.max(0, (Number(value) || 0) - 100));
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
      onChange(rawValue);
    }
  };

  const handleBlur = (e) => {
    onChange(parseFloat(e.target.value) || 0);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-slate-400 font-semibold mr-1">$</span>
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="w-24 text-center bg-slate-800 border-slate-600"
        placeholder="0.00"
      />
      <Button type="button" size="icon" variant="ghost" onClick={handleDecrement} className="h-8 w-8">
        <Minus className="h-4 w-4" />
      </Button>
      <Button type="button" size="icon" variant="ghost" onClick={handleIncrement} className="h-8 w-8">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PriceInput;