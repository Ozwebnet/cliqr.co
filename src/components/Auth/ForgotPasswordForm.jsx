import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const { sendPasswordResetEmail, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Error', description: 'Please enter your email address.', variant: 'destructive' });
      return;
    }
    await sendPasswordResetEmail(email);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-purple-700 to-slate-800 p-4">
       <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
            <img  class="w-56 mx-auto mb-4" alt="Cliqr.co Logo" src="https://images.unsplash.com/photo-1626682561113-d1db402cc866" />
        </div>

        <Card className="w-full max-w-md bg-slate-800/70 backdrop-blur-md border-slate-700">
            <CardHeader>
                <CardTitle className="text-2xl text-white">Forgot Password?</CardTitle>
                <CardDescription className="text-slate-300">
                    No problem! Enter your email and we'll send you a reset link.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-900/80 border-slate-700 text-white"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </form>
            </CardContent>
        </Card>
         <p className="mt-6 text-center text-sm text-slate-300">
            Remembered your password?{' '}
            <Link to="/" className="font-semibold text-purple-400 hover:text-purple-300">
                Sign In
            </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordForm;