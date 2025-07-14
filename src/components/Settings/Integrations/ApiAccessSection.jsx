import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, FileText, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ApiAccessSection = () => {
  const handleNotImplemented = (feature) => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: `${feature} isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀`,
      duration: 5000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Key className="w-5 h-5 mr-2" />
            API Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">API Documentation</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNotImplemented("API documentation")}
                  className="text-slate-300 border-slate-600 hover:bg-slate-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Docs
                </Button>
              </div>
              <p className="text-slate-400 text-sm">
                Access our REST API to integrate with your applications and automate workflows.
              </p>
            </div>

            <div className="p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">Generate API Key</h3>
                <Button
                  size="sm"
                  onClick={() => handleNotImplemented("API key generation")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Key
                </Button>
              </div>
              <p className="text-slate-400 text-sm">
                Create API keys to authenticate requests to our API endpoints.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ApiAccessSection;