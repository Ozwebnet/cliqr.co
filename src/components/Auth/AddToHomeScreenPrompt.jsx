import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Apple, PlayCircle } from 'lucide-react';

const AddToHomeScreenPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (!isStandalone) {
      const ios = /iphone|ipad|ipod/.test(userAgent);
      const android = /android/.test(userAgent);
      setIsIOS(ios);
      setIsAndroid(android);

      if (android) {
        const handleBeforeInstallPrompt = (e) => {
          e.preventDefault();
          setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
      }
    }
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  const handleIOSInstallClick = () => {
    toast({
      title: 'Add to Home Screen',
      description: (
        <div className="text-sm">
          <p>To install, tap the Share icon and then 'Add to Home Screen'.</p>
        </div>
      ),
      duration: 8000,
    });
  };

  if (isAndroid && deferredPrompt) {
    return (
      <div className="text-center">
        <Button 
            onClick={handleInstallClick} 
            className="w-full bg-black text-white hover:bg-gray-800 border border-gray-600 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg"
        >
            <PlayCircle className="h-6 w-6 text-green-400" />
            <div>
                <p className="text-xs -mb-1 text-left">GET IT ON</p>
                <p className="text-lg font-semibold">Google Play</p>
            </div>
        </Button>
        <p className="text-xs text-slate-400 mt-2">Installs the web app, not from the store.</p>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="text-center">
          <Button 
              onClick={handleIOSInstallClick} 
              className="w-full bg-black text-white hover:bg-gray-800 border border-gray-600 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg"
          >
              <Apple className="h-7 w-7" />
              <div>
                  <p className="text-xs -mb-1 text-left">Download on the</p>
                  <p className="text-lg font-semibold">App Store</p>
              </div>
          </Button>
          <p className="text-xs text-slate-400 mt-2">Shows instructions to add to home screen.</p>
      </div>
    );
  }

  return null;
};

export default AddToHomeScreenPrompt;