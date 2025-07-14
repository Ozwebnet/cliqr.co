import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ExternalLink, 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Megaphone,
  Settings,
  FileText,
  Receipt,
  Shield,
  Folder,
  Users,
  Bell
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const NotificationDetailsDialog = ({ open, onOpenChange, notification }) => {
  if (!notification) return null;

  const getTypeIcon = (type) => {
    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: XCircle,
      announcement: Megaphone,
      reminder: Clock,
      system: Settings,
      invoice: Receipt,
      proposal: FileText,
      lead: Users,
      project: Folder,
      credential: Shield
    };
    return icons[type] || Bell;
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      announcement: 'bg-purple-100 text-purple-800 border-purple-200',
      reminder: 'bg-orange-100 text-orange-800 border-orange-200',
      system: 'bg-gray-100 text-gray-800 border-gray-200',
      invoice: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      proposal: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      lead: 'bg-pink-100 text-pink-800 border-pink-200',
      project: 'bg-teal-100 text-teal-800 border-teal-200',
      credential: 'bg-amber-100 text-amber-800 border-amber-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority] || 'text-gray-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleActionClick = () => {
    if (notification.action_url) {
      if (notification.action_url.startsWith('http')) {
        window.open(notification.action_url, '_blank');
      } else {
        // Internal navigation would go here
        toast({
          title: '🚧 Navigation Not Implemented',
          description: "Internal navigation isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
          duration: 3000,
        });
      }
    }
  };

  const TypeIcon = getTypeIcon(notification.type);
  const isExpired = notification.expires_at && new Date(notification.expires_at) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {notification.title}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getTypeColor(notification.type)} variant="outline">
                <TypeIcon className="w-3 h-3 mr-1" />
                {notification.type}
              </Badge>
              <Badge 
                className={`${getPriorityColor(notification.priority)} border-current`} 
                variant="outline"
              >
                {notification.priority}
              </Badge>
              {isExpired && (
                <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
                  Expired
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          {/* Message Content */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                {notification.message}
              </p>
              
              {notification.action_url && notification.action_label && (
                <div className="mt-6">
                  <Button onClick={handleActionClick} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    {notification.action_label}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Sender Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-slate-400">From:</span>
                  <p className="text-white">
                    {notification.sender?.preferred_name || notification.sender?.legal_first_name || 'System'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">To:</span>
                  <p className="text-white">
                    {notification.recipient?.preferred_name || notification.recipient?.legal_first_name || 'You'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-slate-400">Created:</span>
                  <p className="text-white">{formatDate(notification.created_at)}</p>
                </div>
                {notification.sent_at && (
                  <div>
                    <span className="text-slate-400">Sent:</span>
                    <p className="text-white">{formatDate(notification.sent_at)}</p>
                  </div>
                )}
                {notification.read_at && (
                  <div>
                    <span className="text-slate-400">Read:</span>
                    <p className="text-white">{formatDate(notification.read_at)}</p>
                  </div>
                )}
                {notification.expires_at && (
                  <div>
                    <span className="text-slate-400">Expires:</span>
                    <p className={`${isExpired ? 'text-red-400' : 'text-white'}`}>
                      {formatDate(notification.expires_at)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Read Status:</span>
                <span className={`font-semibold ${notification.is_read ? 'text-green-400' : 'text-orange-400'}`}>
                  {notification.is_read ? 'Read' : 'Unread'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Archived:</span>
                <span className={`font-semibold ${notification.is_archived ? 'text-blue-400' : 'text-slate-400'}`}>
                  {notification.is_archived ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Priority Level:</span>
                <span className={`font-semibold ${getPriorityColor(notification.priority)}`}>
                  {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                </span>
              </div>
              {isExpired && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-red-400 font-semibold">Expired</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(notification.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-white">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action URL Details */}
          {notification.action_url && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Action Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-slate-400">Action URL:</span>
                  <p className="text-blue-400 font-mono text-sm break-all">{notification.action_url}</p>
                </div>
                {notification.action_label && (
                  <div>
                    <span className="text-slate-400">Action Label:</span>
                    <p className="text-white">{notification.action_label}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetailsDialog;