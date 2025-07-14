import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign,
  Users,
  Database,
  Zap,
  Crown,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';

const BillingTab = ({ teamSettings, onSettingsUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [billingData, setBillingData] = useState({
    plan: 'starter',
    status: 'active',
    next_billing_date: '2024-02-15',
    amount: 29.99,
    currency: 'AUD',
    payment_method: {
      type: 'card',
      last4: '4242',
      brand: 'visa',
      exp_month: 12,
      exp_year: 2025
    },
    usage: {
      users: 5,
      storage_gb: 2.5,
      api_calls: 1250
    },
    limits: {
      users: 10,
      storage_gb: 10,
      api_calls: 5000
    }
  });
  const [invoices, setInvoices] = useState([
    {
      id: 'inv_001',
      date: '2024-01-15',
      amount: 29.99,
      status: 'paid',
      description: 'Starter Plan - January 2024'
    },
    {
      id: 'inv_002',
      date: '2023-12-15',
      amount: 29.99,
      status: 'paid',
      description: 'Starter Plan - December 2023'
    },
    {
      id: 'inv_003',
      date: '2023-11-15',
      amount: 29.99,
      status: 'paid',
      description: 'Starter Plan - November 2023'
    }
  ]);

  const isFullAdmin = user?.role === 'full_admin';

  const plans = [
    {
      name: 'Starter',
      price: 29.99,
      currency: 'AUD',
      interval: 'month',
      features: [
        'Up to 10 team members',
        '10GB storage',
        '5,000 API calls/month',
        'Basic support',
        'Standard integrations'
      ],
      limits: {
        users: 10,
        storage_gb: 10,
        api_calls: 5000
      }
    },
    {
      name: 'Professional',
      price: 79.99,
      currency: 'AUD',
      interval: 'month',
      features: [
        'Up to 50 team members',
        '100GB storage',
        '25,000 API calls/month',
        'Priority support',
        'Advanced integrations',
        'Custom branding'
      ],
      limits: {
        users: 50,
        storage_gb: 100,
        api_calls: 25000
      }
    },
    {
      name: 'Enterprise',
      price: 199.99,
      currency: 'AUD',
      interval: 'month',
      features: [
        'Unlimited team members',
        '1TB storage',
        'Unlimited API calls',
        '24/7 dedicated support',
        'All integrations',
        'Custom branding',
        'Advanced security',
        'Custom features'
      ],
      limits: {
        users: -1,
        storage_gb: 1000,
        api_calls: -1
      }
    }
  ];

  const handlePlanChange = (planName) => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "Plan changes aren't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 5000,
    });
  };

  const handlePaymentMethodUpdate = () => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "Payment method updates aren't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 5000,
    });
  };

  const handleDownloadInvoice = (invoiceId) => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "Invoice downloads aren't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 5000,
    });
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-orange-500';
    return 'text-green-500';
  };

  const formatCurrency = (amount, currency = 'AUD') => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!isFullAdmin) {
    return (
      <div className="text-center py-20">
        <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg mb-2">Access Restricted</p>
        <p className="text-slate-500">Only team managers can access billing settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan & Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="w-5 h-5 mr-2 text-yellow-500" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white capitalize">{billingData.plan}</h3>
                  <p className="text-slate-400">
                    {formatCurrency(billingData.amount)} / month
                  </p>
                </div>
                <Badge className={`${
                  billingData.status === 'active' ? 'bg-green-100 text-green-800' : 
                  billingData.status === 'past_due' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {billingData.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Next billing date:</span>
                  <span className="text-white">{new Date(billingData.next_billing_date).toLocaleDateString('en-AU')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Payment method:</span>
                  <span className="text-white">
                    {billingData.payment_method.brand.toUpperCase()} •••• {billingData.payment_method.last4}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={() => handlePlanChange('upgrade')} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Upgrade Plan
                </Button>
                <Button onClick={handlePaymentMethodUpdate} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
                  <CreditCard className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Usage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Team Members
                  </span>
                  <span className={`font-medium ${getUsageColor(getUsagePercentage(billingData.usage.users, billingData.limits.users))}`}>
                    {billingData.usage.users} / {billingData.limits.users === -1 ? '∞' : billingData.limits.users}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage(billingData.usage.users, billingData.limits.users)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Storage
                  </span>
                  <span className={`font-medium ${getUsageColor(getUsagePercentage(billingData.usage.storage_gb, billingData.limits.storage_gb))}`}>
                    {billingData.usage.storage_gb}GB / {billingData.limits.storage_gb === -1 ? '∞' : `${billingData.limits.storage_gb}GB`}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage(billingData.usage.storage_gb, billingData.limits.storage_gb)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    API Calls
                  </span>
                  <span className={`font-medium ${getUsageColor(getUsagePercentage(billingData.usage.api_calls, billingData.limits.api_calls))}`}>
                    {billingData.usage.api_calls.toLocaleString()} / {billingData.limits.api_calls === -1 ? '∞' : billingData.limits.api_calls.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage(billingData.usage.api_calls, billingData.limits.api_calls)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Available Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.name}
                  className={`p-6 rounded-lg border-2 transition-colors ${
                    plan.name.toLowerCase() === billingData.plan
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(plan.price)}
                      <span className="text-sm text-slate-400 font-normal">/{plan.interval}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanChange(plan.name)}
                    disabled={plan.name.toLowerCase() === billingData.plan}
                    className={`w-full ${
                      plan.name.toLowerCase() === billingData.plan
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                    }`}
                  >
                    {plan.name.toLowerCase() === billingData.plan ? 'Current Plan' : `Switch to ${plan.name}`}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Billing History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-500' :
                      invoice.status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-white font-medium">{invoice.description}</p>
                      <p className="text-slate-400 text-sm">{new Date(invoice.date).toLocaleDateString('en-AU')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-medium">{formatCurrency(invoice.amount)}</span>
                    <Badge className={`${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="text-slate-300 border-slate-600 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {billingData.payment_method.brand.toUpperCase()} •••• {billingData.payment_method.last4}
                  </p>
                  <p className="text-slate-400 text-sm">
                    Expires {billingData.payment_method.exp_month}/{billingData.payment_method.exp_year}
                  </p>
                </div>
              </div>
              <Button
                onClick={handlePaymentMethodUpdate}
                variant="outline"
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BillingTab;