import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Shield, Cookie } from 'lucide-react';

// Extend the Window interface to include Cookiebot
declare global {
  interface Window {
    Cookiebot?: {
      show: () => void;
      hide: () => void;
      renew: () => void;
      getConsentState: () => any;
      consent: {
        necessary: boolean;
        preferences: boolean;
        statistics: boolean;
        marketing: boolean;
      };
    };
  }
}

interface CookieManagerProps {
  className?: string;
}

const CookieManager: React.FC<CookieManagerProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [consentState, setConsentState] = useState<any>(null);

  useEffect(() => {
    // Check if Cookiebot is available and get consent state
    const updateConsentState = () => {
      if (window.Cookiebot) {
        setConsentState(window.Cookiebot.getConsentState?.() || window.Cookiebot.consent);
      }
    };

    // Initial check
    updateConsentState();

    // Listen for Cookiebot events
    const handleCookiebotLoad = () => {
      updateConsentState();
    };

    const handleConsentChanged = () => {
      updateConsentState();
    };

    window.addEventListener('CookiebotOnLoad', handleCookiebotLoad);
    window.addEventListener('CookiebotOnAccept', handleConsentChanged);
    window.addEventListener('CookiebotOnDecline', handleConsentChanged);

    return () => {
      window.removeEventListener('CookiebotOnLoad', handleCookiebotLoad);
      window.removeEventListener('CookiebotOnAccept', handleConsentChanged);
      window.removeEventListener('CookiebotOnDecline', handleConsentChanged);
    };
  }, []);

  const openCookieSettings = () => {
    if (window.Cookiebot) {
      window.Cookiebot.renew();
      setIsOpen(false);
    }
  };

  const getConsentStatus = (type: string) => {
    if (!consentState) return 'Unknown';
    return consentState[type] ? 'Allowed' : 'Denied';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
          title="Manage Cookie Preferences"
          aria-label="Open cookie preferences dialog"
        >
          <Cookie className="h-4 w-4" />
          <span className="hidden sm:inline">Cookie Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Cookie Preferences
          </DialogTitle>
          <DialogDescription>
            Manage your cookie preferences and privacy settings for LearnFlow.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Current Cookie Status</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span>Necessary Cookies</span>
                <span className="text-green-600 font-medium">
                  {getConsentStatus('necessary')}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span>Functional Cookies</span>
                <span className={`font-medium ${
                  getConsentStatus('preferences') === 'Allowed' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {getConsentStatus('preferences')}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span>Analytics Cookies</span>
                <span className={`font-medium ${
                  getConsentStatus('statistics') === 'Allowed' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {getConsentStatus('statistics')}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span>Marketing Cookies</span>
                <span className={`font-medium ${
                  getConsentStatus('marketing') === 'Allowed' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {getConsentStatus('marketing')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Cookie Information</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                <strong>Necessary:</strong> Required for basic website functionality and security.
              </p>
              <p>
                <strong>Functional:</strong> Remember your preferences and settings.
              </p>
              <p>
                <strong>Analytics:</strong> Help us understand how you use our website.
              </p>
              <p>
                <strong>Marketing:</strong> Used to show you relevant advertisements.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={openCookieSettings}
              className="flex-1 flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Change Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookieManager;
