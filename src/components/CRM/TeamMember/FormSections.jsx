import React from 'react';
import { User, Mail, Phone, Briefcase, Globe, MessageCircle, CreditCard, DollarSign, Award, Upload, Lock, ShieldCheck, FileText } from 'lucide-react';
import { FormSection, MemoizedInputField, MemoizedSelectField, MemoizedMultiSelectField, MemoizedFileUploadField, MemoizedPasswordField, PaymentWarning } from './FormComponents';
import { PasswordStrengthIndicator } from '@/lib/passwordUtils.jsx';

export const PersonalInfoSection = ({ formData, handleChange, handleSelectChange, phoneError }) => (
  <FormSection title="👤 Personal Information">
    <MemoizedInputField 
      id="legal_first_name" 
      label="Legal First Name" 
      icon={<User />} 
      value={formData.legal_first_name} 
      onChange={handleChange} 
      placeholder="Enter legal first name" 
      isRequired
    />
    <MemoizedInputField 
      id="legal_middle_name" 
      label="Legal Middle Name" 
      icon={<User />} 
      value={formData.legal_middle_name} 
      onChange={handleChange} 
      placeholder="Required if applicable" 
    />
    <MemoizedInputField 
      id="legal_last_name" 
      label="Legal Last Name" 
      icon={<User />} 
      value={formData.legal_last_name} 
      onChange={handleChange} 
      placeholder="Enter legal last name" 
      isRequired
    />
    <MemoizedInputField 
      id="preferred_name" 
      label="Preferred Name" 
      icon={<User />} 
      value={formData.preferred_name} 
      onChange={handleChange} 
      placeholder="Optional" 
    />
    <MemoizedInputField 
      id="email" 
      label="Email Address" 
      type="email" 
      icon={<Mail />} 
      value={formData.email} 
      onChange={handleChange} 
      placeholder="your@email.com" 
      isRequired
    />
    <MemoizedInputField 
      id="phone_number" 
      label="Phone Number" 
      type="tel" 
      icon={<Phone />} 
      value={formData.phone_number} 
      onChange={handleChange} 
      placeholder="Enter Australian phone number (e.g., 0412345678)" 
      description="Enter your Australian phone number (mobile or landline), e.g. 0412345678 or 0298765432. No spaces or symbols."
      error={phoneError}
    />
  </FormSection>
);

export const BusinessLegalSection = ({ formData, handleChange, handleSelectChange, employmentTypes, isContractor, abnError, acnError }) => (
  <FormSection title="🧾 Business & Legal">
    <MemoizedSelectField 
      id="employment_type" 
      label="Employment Type" 
      icon={<Briefcase />} 
      value={formData.employment_type} 
      onValueChange={(value) => handleSelectChange('employment_type', value)}
      options={employmentTypes}
      placeholder="Select employment type"
      isRequired
      className="md:col-span-2"
    />
    {isContractor && (
      <MemoizedInputField 
        id="abn" 
        label="ABN" 
        icon={<FileText />} 
        value={formData.abn} 
        onChange={handleChange} 
        placeholder="Enter your 11-digit ABN (e.g., 51824753556)" 
        isRequired
        description="Enter your 11-digit ABN (e.g., 51824753556). No spaces or letters."
        error={abnError}
      />
    )}
    {isContractor && formData.abn && (
      <MemoizedInputField 
        id="acn" 
        label="ACN" 
        icon={<FileText />} 
        value={formData.acn} 
        onChange={handleChange} 
        placeholder="Enter your 9-digit ACN (e.g., 123456789)" 
        description="Enter your 9-digit ACN (e.g., 123456789). No letters or spaces."
        error={acnError}
      />
    )}
    <MemoizedInputField 
      id="portfolio_url" 
      label="Portfolio URL" 
      icon={<Globe />} 
      value={formData.portfolio_url} 
      onChange={handleChange} 
      placeholder="https://yourportfolio.com" 
    />
    <MemoizedInputField 
      id="social_profiles" 
      label="LinkedIn or Social Profiles" 
      icon={<MessageCircle />} 
      value={formData.social_profiles} 
      onChange={handleChange} 
      placeholder="LinkedIn, Twitter, etc. (comma-separated)" 
      className="md:col-span-2"
    />
  </FormSection>
);

export const PaymentInfoSection = ({ formData, handleChange, handleSelectChange, bsbError, accountNumberError }) => (
  <FormSection title="💸 Payment Information">
    <div className="md:col-span-2">
      <PaymentWarning />
    </div>
    <MemoizedInputField 
      id="bank_account_name" 
      label="Bank Account Name" 
      icon={<CreditCard />} 
      value={formData.bank_account_name} 
      onChange={handleChange} 
      placeholder="Account holder name" 
      isRequired
      description="Full name as it appears on your bank account"
    />
    <MemoizedInputField 
      id="bsb_number" 
      label="BSB Number" 
      icon={<CreditCard />} 
      value={formData.bsb_number} 
      onChange={handleChange} 
      placeholder="Enter your 6-digit BSB (e.g., 123456 or 123-456)" 
      isRequired
      description="Enter your 6-digit BSB (e.g., 123456 or 123-456). No spaces or letters."
      error={bsbError}
    />
    <MemoizedInputField 
      id="account_number" 
      label="Account Number" 
      icon={<CreditCard />} 
      value={formData.account_number} 
      onChange={handleChange} 
      placeholder="Enter your account number (6 to 10 digits)" 
      isRequired
      description="Enter your account number (6 to 10 digits). No spaces or special characters."
      error={accountNumberError}
    />
  </FormSection>
);

export const SkillsRoleSection = ({ formData, handleChange, handleMultiSelectChange, skillOptions }) => (
  <FormSection title="📁 Skills & Role Info">
    <MemoizedMultiSelectField 
      id="skill_set" 
      label="Skill Set / Role Type" 
      icon={<Award />} 
      value={formData.skill_set} 
      onValueChange={(values) => handleMultiSelectChange('skill_set', values)}
      options={skillOptions}
      placeholder="Select your skills"
      isRequired
      className="md:col-span-2"
      description="Select all skills that apply to your expertise"
    />
    <MemoizedInputField 
      id="hourly_rate" 
      label="Hourly or Fixed Rate" 
      icon={<DollarSign />} 
      value={formData.hourly_rate} 
      onChange={handleChange} 
      placeholder="e.g., $50/hr or $1500/project" 
      className="md:col-span-2"
      description="Optional - Your preferred rate structure"
    />
  </FormSection>
);

export const AccountSecuritySection = ({ formData, handleChange, showPassword, showConfirmPassword, toggleShowPassword, toggleShowConfirmPassword, userDetailsForPasswordValidation, handlePasteConfirmPassword }) => (
  <FormSection title="🔐 Account Security">
    <MemoizedPasswordField 
      id="password" 
      label="Password" 
      icon={<Lock />} 
      value={formData.password} 
      onChange={handleChange} 
      placeholder="Create a strong password" 
      show={showPassword} 
      toggleShow={toggleShowPassword} 
      isRequired
      className="md:col-span-2"
    />
    {formData.password && (
      <div className="md:col-span-2">
        <PasswordStrengthIndicator password={formData.password} userDetails={userDetailsForPasswordValidation} />
      </div>
    )}
    <MemoizedPasswordField 
      id="confirmPassword" 
      label="Confirm Password" 
      icon={<ShieldCheck />} 
      value={formData.confirmPassword} 
      onChange={handleChange} 
      placeholder="Confirm your password" 
      show={showConfirmPassword} 
      toggleShow={toggleShowConfirmPassword} 
      isRequired
      className="md:col-span-2"
      onPaste={handlePasteConfirmPassword}
    />
  </FormSection>
);

export const AgreementsSection = () => (
  <FormSection title="📜 Agreements / Admin">
    <MemoizedFileUploadField 
      id="government_id" 
      label="Upload Government-Issued ID" 
      icon={<Upload />} 
      placeholder="Choose file or drag & drop"
      description="Optional - Driver's license, passport, etc."
    />
    <MemoizedFileUploadField 
      id="signed_agreement" 
      label="Upload Signed Agreement or NDA" 
      icon={<Upload />} 
      placeholder="Choose file or drag & drop"
      description="Optional - Any signed contracts or NDAs"
    />
  </FormSection>
);