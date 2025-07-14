import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera } from 'lucide-react';

const ProfilePictureSection = ({ preferredName, legalFirstName, onAvatarUpload }) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Profile Picture
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
            {(preferredName || legalFirstName)?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <button
            onClick={onAvatarUpload}
            className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Upload a profile picture to personalize your account
        </p>
        <Button onClick={onAvatarUpload} variant="outline" size="sm" className="text-slate-300 border-slate-600 hover:bg-slate-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Photo
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfilePictureSection;