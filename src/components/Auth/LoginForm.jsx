import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import AddToHomeScreenPrompt from '@/components/Auth/AddToHomeScreenPrompt';

const LoginForm = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, rememberMe, setRememberMe } = useAuth();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setStep('password');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };
  
  const variants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-purple-700 to-slate-800 p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
            <img  className="w-56 mx-auto mb-2 filter drop-shadow-lg" alt="Cliqr.co Logo" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/8c02bbe1-80b7-49b5-b4ba-340c3af8df69/f4424ba26690c8f6f073dfd81cf23186.png" />
            <p className="text-slate-300 mt-2">Sign in to access your portal</p>
        </div>

        <Card className="w-full bg-slate-800/70 backdrop-blur-md border-slate-700">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {step === 'email' && (
                  <motion.form
                    key="email"
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    onSubmit={handleEmailSubmit}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 text-lg bg-slate-900/80 border-slate-700 text-white"
                        required
                      />
                      <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700">
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </motion.form>
                )}

                {step === 'password' && (
                  <motion.form
                    key="password"
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-6"
                  >
                    <button type="button" onClick={() => setStep('email')} className="text-sm text-slate-300 hover:text-white w-full text-left">{email}</button>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 text-lg bg-slate-900/80 border-slate-700 text-white"
                        required
                        autoFocus
                      />
                      <Button type="submit" size="icon" disabled={loading} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700">
                         <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={setRememberMe} className="border-slate-500" />
                            <Label htmlFor="remember-me" className="text-sm text-slate-300">Remember me</Label>
                        </div>
                        <Link to="/forgot-password" className="text-sm font-semibold text-purple-400 hover:text-purple-300">
                            Forgot password?
                        </Link>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-300">
          First time here?{' '}
          <Link to="/signup" className="font-semibold text-purple-400 hover:text-purple-300">
            Create an Admin Account
          </Link>
        </p>

        <div className="mt-4">
          <AddToHomeScreenPrompt />
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;