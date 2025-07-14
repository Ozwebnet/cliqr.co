import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ActiveSessionsSection = ({ sessions }) => {
  const handleRevokeSession = (sessionId) => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "Session management isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 5000,
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          Active Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions && sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${session.current ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
                  <div>
                    <p className="text-white font-medium">{session.device}</p>
                    <p className="text-slate-400 text-sm">{session.location}</p>
                    <p className="text-slate-500 text-xs">
                      Last active: {new Date(session.lastActive).toLocaleString()}
                      {session.current && ' (Current session)'}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    onClick={() => handleRevokeSession(session.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-400 border-red-400 hover:bg-red-900/20 hover:text-red-300"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No active session data available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveSessionsSection;