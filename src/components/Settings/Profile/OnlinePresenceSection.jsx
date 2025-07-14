import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const OnlinePresenceSection = ({ formData, errors, onInputChange }) => {
  return (
    <div className="border-t border-slate-600 pt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Online Presence</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website_url" className="text-slate-300">
            Website URL
          </Label>
          <Input
            id="website_url"
            value={formData.website_url}
            onChange={(e) => onInputChange('website_url', e.target.value)}
            placeholder="https://yourwebsite.com"
            className="bg-slate-700 border-slate-600 text-white"
          />
          {errors.website_url && (
            <p className="text-red-400 text-sm">{errors.website_url}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio_url" className="text-slate-300">
            Portfolio URL
          </Label>
          <Input
            id="portfolio_url"
            value={formData.portfolio_url}
            onChange={(e) => onInputChange('portfolio_url', e.target.value)}
            placeholder="https://portfolio.com"
            className="bg-slate-700 border-slate-600 text-white"
          />
          {errors.portfolio_url && (
            <p className="text-red-400 text-sm">{errors.portfolio_url}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="social_profiles" className="text-slate-300">
            Social Media Profiles
          </Label>
          <Textarea
            id="social_profiles"
            value={formData.social_profiles}
            onChange={(e) => onInputChange('social_profiles', e.target.value)}
            placeholder="LinkedIn: https://linkedin.com/in/yourprofile&#10;Twitter: @yourusername&#10;GitHub: https://github.com/yourusername"
            className="bg-slate-700 border-slate-600 text-white"
            rows={3}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bio" className="text-slate-300">
            Bio / About
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => onInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself, your experience, and what you do..."
            className="bg-slate-700 border-slate-600 text-white"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default OnlinePresenceSection;