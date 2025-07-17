import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import LoadingBar from '@/components/ui/LoadingBar';
import { 
  CheckCircle, 
  UserCheck, 
  Mail, 
  Key, 
  ArrowRight,
  Sparkles,
  Shield
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth.jsx';

const InvitationSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState(null);

  // Get account data from URL params (passed from finalization)
  useEffect(() => {
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    const role = searchParams.get('role');
    const name = searchParams.get('name');

    if (email && password && role) {
      setAccountData({ email, password, role, name });
    } else {
      // If no account data, redirect to login
      navigate('/');
    }
  }, [searchParams, navigate]);

  const handleAutoLogin = async () => {
    if (!accountData) return;

    setLoading(true);
    
    try {
      const result = await login(accountData.email, accountData.password);
      
      if (result) {
        toast({
          title: 'Welcome to the Team! 🎉',
          description: `You've been successfully logged in. Welcome ${accountData.name || 'aboard'}!`,
          variant: 'success'
        });
        
        // Navigate to dashboard
        navigate('/');
      } else {
        // If auto-login fails, show manual login option
        toast({
          title: 'Account Created Successfully',
          description: 'Please log in manually with your credentials.',
          variant: 'default'
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Login Issue',
        description: 'Account created but auto-login failed. Please log in manually.',
        variant: 'default'
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = () => {
    navigate('/');
  };

  if (!accountData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingBar text="Loading..." />
      </div>
    );
  }

  const roleDisplayName = accountData.role === 'client' ? 'Client' : 'Team Member';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <CardHeader className="text-center bg-gradient-to-r from-green-500/10 to-blue-500/10 border-b border-slate-700">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                Account Created Successfully!
              </CardTitle>
              
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <UserCheck className="w-3 h-3 mr-1" />
                  {roleDisplayName}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Welcome to the team! 🎉
                </h2>
                <p className="text-slate-400">
                  Your account has been successfully created and you're ready to start collaborating.
                </p>
              </div>

              {/* Account Details */}
              <div className="bg-slate-900 rounded-lg p-6 mb-8 border border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                  Your Account Details
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Email:</span>
                    </div>
                    <span className="text-white font-medium">{accountData.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Role:</span>
                    </div>
                    <span className="text-white font-medium">{roleDisplayName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Password:</span>
                    </div>
                    <span className="text-slate-500 font-mono text-sm">
                      •••••••••••• (Provided by manager)
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-6 mb-8 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  🚀 What's Next?
                </h3>
                <ul className="space-y-2 text-slate-300">
                  {accountData.role === 'client' ? (
                    <>
                      <li>• Access your client dashboard and project overview</li>
                      <li>• Review proposals and project timelines</li>
                      <li>• Communicate directly with your assigned team</li>
                      <li>• Track project progress and milestones</li>
                    </>
                  ) : (
                    <>
                      <li>• Set up your team member profile and preferences</li>
                      <li>• Access project management tools and client accounts</li>
                      <li>• Collaborate with team members and clients</li>
                      <li>• Track your time and manage your workload</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleAutoLogin}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Logging you in...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Continue to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleManualLogin}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Login Manually
                </Button>
              </div>
              
              <p className="text-center text-xs text-slate-500 mt-4">
                Your credentials have been securely generated. Make sure to change your password after logging in.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitationSuccessPage; 