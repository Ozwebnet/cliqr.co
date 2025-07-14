import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Package,
  Zap,
  Star,
  Download,
  Share,
  BarChart3
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const PricingCalculator = () => {
  const [services, setServices] = useLocalStorage('services', [
    { id: 1, name: 'Website Design', basePrice: 2500, category: 'design', complexity: 'medium' },
    { id: 2, name: 'E-commerce Development', basePrice: 5000, category: 'development', complexity: 'high' },
    { id: 3, name: 'Mobile App Design', basePrice: 3500, category: 'design', complexity: 'high' },
    { id: 4, name: 'SEO Optimization', basePrice: 800, category: 'marketing', complexity: 'low' },
    { id: 5, name: 'Brand Identity', basePrice: 1500, category: 'design', complexity: 'medium' },
    { id: 6, name: 'Content Management', basePrice: 600, category: 'content', complexity: 'low' },
    { id: 7, name: 'Social Media Management', basePrice: 1200, category: 'marketing', complexity: 'medium' },
    { id: 8, name: 'Custom Development', basePrice: 8000, category: 'development', complexity: 'high' }
  ]);

  const [selectedServices, setSelectedServices] = useState([]);
  const [projectComplexity, setProjectComplexity] = useState('medium');
  const [timeline, setTimeline] = useState('standard');
  const [clientType, setClientType] = useState('small-business');
  const [profitMargin, setProfitMargin] = useState(30);
  const [discount, setDiscount] = useState(0);

  const complexityMultipliers = {
    low: 0.8,
    medium: 1.0,
    high: 1.3,
    enterprise: 1.6
  };

  const timelineMultipliers = {
    rush: 1.5,
    standard: 1.0,
    extended: 0.9
  };

  const clientTypeMultipliers = {
    'startup': 0.85,
    'small-business': 1.0,
    'medium-business': 1.2,
    'enterprise': 1.5
  };

  const calculateTotal = () => {
    const baseTotal = selectedServices.reduce((sum, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return sum + (service ? service.basePrice : 0);
    }, 0);

    const complexityAdjusted = baseTotal * complexityMultipliers[projectComplexity];
    const timelineAdjusted = complexityAdjusted * timelineMultipliers[timeline];
    const clientAdjusted = timelineAdjusted * clientTypeMultipliers[clientType];
    
    const withProfit = clientAdjusted * (1 + profitMargin / 100);
    const withDiscount = withProfit * (1 - discount / 100);

    return {
      basePrice: baseTotal,
      adjustedPrice: clientAdjusted,
      finalPrice: withDiscount,
      profit: withDiscount - clientAdjusted
    };
  };

  const pricing = calculateTotal();

  const competitorData = [
    { name: 'Competitor A', price: pricing.finalPrice * 1.15, quality: 'Standard' },
    { name: 'Competitor B', price: pricing.finalPrice * 0.85, quality: 'Basic' },
    { name: 'Your Agency', price: pricing.finalPrice, quality: 'Premium' },
    { name: 'Competitor C', price: pricing.finalPrice * 1.25, quality: 'Premium' }
  ];

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pricing Calculator</h1>
          <p className="text-slate-800 dark:text-slate-400 mt-2">
            Calculate project costs, analyze competition, and generate proposals
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share Quote
          </Button>
          <Button className="bg-gradient-to-r from-green-500 to-blue-600">
            <Download className="mr-2 h-4 w-4" />
            Export Proposal
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Service Selection
              </CardTitle>
              <CardDescription className="text-slate-400">
                Choose the services for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <motion.div
                    key={service.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedServices.includes(service.id)
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
                    }`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <div>
                          <h4 className="text-white font-medium">{service.name}</h4>
                          <p className="text-slate-400 text-sm capitalize">{service.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">${service.basePrice.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {service.complexity}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Project Configuration
              </CardTitle>
              <CardDescription className="text-slate-400">
                Adjust pricing factors for accurate quotes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-200">Project Complexity</Label>
                  <Select value={projectComplexity} onValueChange={setProjectComplexity}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="low">Low (-20%)</SelectItem>
                      <SelectItem value="medium">Medium (Standard)</SelectItem>
                      <SelectItem value="high">High (+30%)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (+60%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Timeline</Label>
                  <Select value={timeline} onValueChange={setTimeline}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="rush">Rush (+50%)</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="extended">Extended (-10%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Client Type</Label>
                  <Select value={clientType} onValueChange={setClientType}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="startup">Startup (-15%)</SelectItem>
                      <SelectItem value="small-business">Small Business</SelectItem>
                      <SelectItem value="medium-business">Medium Business (+20%)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (+50%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Profit Margin (%)</Label>
                  <Input
                    type="number"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Discount (%)</Label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Card className="glass-effect border-slate-700 pricing-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Price:</span>
                  <span className="text-white">${pricing.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Adjusted Price:</span>
                  <span className="text-white">${pricing.adjustedPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Profit:</span>
                  <span className="text-green-400">${pricing.profit.toLocaleString()}</span>
                </div>
                <hr className="border-slate-600" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Final Price:</span>
                  <span className="text-green-400">${pricing.finalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="text-white font-medium mb-3">Selected Services:</h4>
                <div className="space-y-2">
                  {selectedServices.map(serviceId => {
                    const service = services.find(s => s.id === serviceId);
                    return service ? (
                      <div key={serviceId} className="flex justify-between text-sm">
                        <span className="text-slate-300">{service.name}</span>
                        <span className="text-slate-400">${service.basePrice.toLocaleString()}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Competitor Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {competitorData.map((competitor, index) => (
                  <motion.div
                    key={competitor.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg ${
                      competitor.name === 'Your Agency' 
                        ? 'bg-blue-600/20 border border-blue-500' 
                        : 'bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{competitor.name}</p>
                        <p className="text-slate-400 text-sm">{competitor.quality}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">${competitor.price.toLocaleString()}</p>
                        {competitor.name === 'Your Agency' && (
                          <Star className="h-4 w-4 text-yellow-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingCalculator;