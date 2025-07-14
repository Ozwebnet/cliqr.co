import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const TwoFactorAuthSection = ({ twoFactorEnabled }) => {
  const handleEnable2FA = () => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "Two-factor authentication setup isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 5000,
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Smartphone className="w-5 h-5 mr-2" />
          Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">
              {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {twoFactorEnabled 
                ? 'Your account is protected with an additional security layer.'
                : 'Add an extra layer of security to your account. This is highly recommended.'
              }
            </p>
          </div>
          <Button
            onClick={handleEnable2FA}
            variant={twoFactorEnabled ? "outline" : "default"}
            className={twoFactorEnabled 
              ? "text-slate-300 border-slate-600 hover:bg-slate-700" 
              : "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            }
          >
            {twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuthSection;