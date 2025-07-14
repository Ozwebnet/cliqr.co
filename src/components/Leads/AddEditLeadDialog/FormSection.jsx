import React from 'react';

const FormSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold text-white mb-4 border-b border-slate-700 pb-2">{title}</h3>
    {children}
  </div>
);

export default FormSection;