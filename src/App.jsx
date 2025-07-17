import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import LoginForm from '@/components/Auth/LoginForm';
import SignUpForm from '@/components/Auth/SignUpForm';
import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';
import OnboardingForm from '@/components/Auth/OnboardingForm';
import InvitationOnboardingForm from '@/components/Auth/InvitationOnboardingForm';
import InvitationSuccessPage from '@/components/Auth/InvitationSuccessPage';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import DashboardOverview from '@/components/Dashboard/DashboardOverview';
import ProjectManager from '@/components/Projects/ProjectManager';
import CRMDashboard from '@/components/CRM/CRMDashboard';
import LeadsDashboard from '@/components/Leads/LeadsDashboard';
import PricingCalculator from '@/components/Pricing/PricingCalculator';
import ProposalBuilder from '@/components/Proposals/ProposalBuilder';
import CredentialVault from '@/components/Credentials/CredentialVault';
import InvoiceManager from '@/components/Invoices/InvoiceManager';
import NotificationCenter from '@/components/Notifications/NotificationCenter';
import SettingsManager from '@/components/Settings/SettingsManager';
import LoadingBar from '@/components/ui/LoadingBar';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validatePassword, PasswordStrengthIndicator } from '@/lib/passwordUtils.jsx';
import { motion } from 'framer-motion';


const UpdatePasswordPage = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth(); 
    
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                
            }
        });
        
        return () => subscription.unsubscribe();
    }, []);

    const userDetailsForPasswordValidation = React.useMemo(() => (user ? {
        email: user.email,
        legal_first_name: user.raw_user_meta_data?.legal_first_name,
        legal_middle_name: user.raw_user_meta_data?.legal_middle_name,
        legal_last_name: user.raw_user_meta_data?.legal_last_name,
        preferred_name: user.raw_user_meta_data?.preferred_name,
    } : {}), [user]);

    useEffect(() => {
        if (password) {
            const errors = validatePassword(password, userDetailsForPasswordValidation);
            setPasswordErrors(errors);
        } else {
            setPasswordErrors([]);
        }
    }, [password, userDetailsForPasswordValidation]);

    const handlePastePassword = (e) => {
        e.preventDefault();
        toast({
          title: "Paste Disabled",
          description: "For security, pasting is disabled in this field. Please type your new password.",
          variant: "destructive",
          duration: 3000,
        });
    };


    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordErrors.length > 0) {
            const errorMessages = passwordErrors.map(err => {
                if (err.includes("personal information")) return "Password should not contain personal information.";
                if (err.includes("repeated characters") || err.includes("common sequences")) return "Password should not contain 3+ repeated characters or common sequences.";
                return err; 
            });
            toast({ title: "Password Issue", description: `Please fix password issues: ${errorMessages.join(' ')}`, variant: "destructive" });
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            toast({ title: "Error updating password", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Password updated successfully!", description: "You will be redirected to complete your profile." });
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-4">
            <Card className="w-full max-w-md bg-purple-100/70 dark:bg-slate-800/70 backdrop-blur-md border-purple-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle className="text-purple-900 dark:text-white">Create a New Password</CardTitle>
                    <CardDescription className="text-purple-700 dark:text-slate-300">Enter a new password for your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <Label htmlFor="new-password" className="text-purple-800 dark:text-slate-200">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onPaste={handlePastePassword}
                                placeholder="Enter your new password"
                                className="bg-purple-100 dark:bg-slate-800 border-purple-300 dark:border-slate-600 text-purple-900 dark:text-white"
                                required
                            />
                            {password && <PasswordStrengthIndicator password={password} userDetails={userDetailsForPasswordValidation} />}
                        </div>
                        <Button type="submit" disabled={loading || passwordErrors.length > 0} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};


const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleMediaQueryChange = (e) => {
      const isMobileDevice = e.matches;
      setIsMobile(isMobileDevice);
      setIsSidebarOpen(false);
    };

    const isMobileDevice = mediaQuery.matches;
    setIsMobile(isMobileDevice);
    setIsSidebarOpen(false); 

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isSidebarOpen, isMobile]);
  
  const handleUnimplemented = () => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 5000,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <LoadingBar text="Loading your workspace..." />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const isAdmin = ['admin', 'full_admin'].includes(user.role);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'projects':
        return <ProjectManager />;
      case 'accountManagement': 
        return isAdmin ? <CRMDashboard /> : <DashboardOverview />;
      case 'leads':
        return isAdmin ? <LeadsDashboard /> : <DashboardOverview />;
      case 'pricing':
        return isAdmin ? <PricingCalculator /> : <DashboardOverview />;
      case 'proposals':
        return isAdmin ? <ProposalBuilder /> : <DashboardOverview />;
      case 'credentials':
        return <CredentialVault />;
      case 'invoices':
        return isAdmin ? <InvoiceManager /> : <DashboardOverview />;
      case 'notifications':
        return <NotificationCenter />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="flex h-screen">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          isMobile={isMobile}
        />
        
        <main className="flex-1 min-w-0 overflow-auto">
          <Header 
            setIsSidebarOpen={() => setIsSidebarOpen(prev => !prev)}
            isMobile={isMobile}
          />
          <div className="p-4 md:p-6">
            {renderContent()}
          </div>
        </main>

        {isMobile && isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 z-[9998] md:hidden"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

const MainApp = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
                <LoadingBar text="Initializing..." />
            </div>
        );
    }
    
    if (user && user.status === 'pending_onboarding') {
        return <OnboardingForm />;
    }

    return user ? <AppContent /> : <LoginForm />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
            <Routes>
                <Route path="/update-password" element={<UpdatePasswordPage />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/invitation" element={<InvitationOnboardingForm />} />
                <Route path="/invitation-success" element={<InvitationSuccessPage />} />
                <Route path="/*" element={<MainApp />} />
            </Routes>
            <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;