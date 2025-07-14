import React from 'react';

const FormSection = ({ title, children }) => (
  <div className="space-y-4 py-4 border-b border-slate-700 last:border-b-0">
    <h2 className="text-xl font-semibold text-purple-300 mb-4">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {children}
    </div>
  </div>
);

export default FormSection;