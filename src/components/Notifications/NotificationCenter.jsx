import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Search, 
  Plus, 
  Bell, 
  BellOff,
  Check, 
  CheckCheck,
  Archive,
  Trash2,
  Settings,
  Filter,
  Send,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Megaphone,
  Calendar,
  User,
  Users,
  Mail,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Star,
  StarOff,
  Receipt,
  FileText,
  Folder,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import LoadingBar from '@/components/ui/LoadingBar';
import CreateNotificationDialog from '@/components/Notifications/CreateNotificationDialog';
import NotificationPreferencesDialog from '@/components/Notifications/NotificationPreferencesDialog';
import NotificationDetailsDialog from '@/components/Notifications/NotificationDetailsDialog';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.team_id) return;
    
    setLoading(true);
    try {
      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:sender_id(id, preferred_name, legal_first_name),
          recipient:recipient_id(id, preferred_name, legal_first_name)
        `)
        .eq('team_id', user.team_id)
        .or(`recipient_id.eq.${user.id},sender_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('team_id', user.team_id)
        .order('name');

      if (templatesError) throw templatesError;

      // Fetch user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError;
      }

      setNotifications(notificationsData || []);
      setTemplates(templatesData || []);
      setPreferences(preferencesData);
      setFilteredNotifications(notificationsData || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch notifications: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.team_id, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading) {
      let filtered = notifications;

      // Filter by tab (all, unread, read, archived)
      if (activeTab === 'unread') {
        filtered = filtered.filter(n => !n.is_read && !n.is_archived);
      } else if (activeTab === 'read') {
        filtered = filtered.filter(n => n.is_read && !n.is_archived);
      } else if (activeTab === 'archived') {
        filtered = filtered.filter(n => n.is_archived);
      } else if (activeTab === 'sent') {
        filtered = filtered.filter(n => n.sender_id === user.id);
      } else {
        // All - exclude archived unless specifically viewing archived
        filtered = filtered.filter(n => !n.is_archived);
      }

      // Filter by search term
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(notification => 
          notification.title?.toLowerCase().includes(lowerSearchTerm) ||
          notification.message?.toLowerCase().includes(lowerSearchTerm) ||
          notification.type?.toLowerCase().includes(lowerSearchTerm)
        );
      }

      // Filter by type
      if (typeFilter !== 'all') {
        filtered = filtered.filter(notification => notification.type === typeFilter);
      }

      // Filter by priority
      if (priorityFilter !== 'all') {
        filtered = filtered.filter(notification => notification.priority === priorityFilter);
      }

      setFilteredNotifications(filtered);
    }
  }, [searchTerm, activeTab, typeFilter, priorityFilter, notifications, loading, user.id]);

  const handleRefresh = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setPriorityFilter('all');
    fetchData();
  };

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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleMarkAsRead = async (notificationId, isRead = true) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: isRead,
          read_at: isRead ? new Date().toISOString() : null
        })
        .eq('id', notificationId);

      if (error) throw error;

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update notification: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read && n.recipient_id === user.id);
      
      if (unreadNotifications.length === 0) {
        toast({
          title: 'No unread notifications',
          description: 'All notifications are already marked as read.'
        });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Marked ${unreadNotifications.length} notifications as read`
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to mark notifications as read: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleArchive = async (notificationId, isArchived = true) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_archived: isArchived,
          archived_at: isArchived ? new Date().toISOString() : null
        })
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Notification ${isArchived ? 'archived' : 'unarchived'} successfully`
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isArchived ? 'archive' : 'unarchive'} notification: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notification deleted successfully'
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete notification: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsDialog(true);
    
    // Mark as read when viewed
    if (!notification.is_read && notification.recipient_id === user.id) {
      handleMarkAsRead(notification.id, true);
    }
  };

  const NotificationCard = ({ notification }) => {
    const TypeIcon = getTypeIcon(notification.type);
    const isUnread = !notification.is_read && notification.recipient_id === user.id;
    const isSent = notification.sender_id === user.id;
    const isExpired = notification.expires_at && new Date(notification.expires_at) < new Date();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-slate-800 border rounded-lg p-4 hover:border-slate-600 transition-colors cursor-pointer ${
          isUnread ? 'border-blue-500 bg-slate-800/80' : 'border-slate-700'
        } ${isExpired ? 'opacity-60' : ''}`}
        onClick={() => handleViewNotification(notification)}
      >
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${isUnread ? 'bg-blue-600' : 'bg-slate-700'}`}>
            <TypeIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`font-semibold truncate ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                    {notification.title}
                  </h3>
                  {isUnread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
                <p className="text-slate-400 text-sm line-clamp-2 mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center space-x-2 flex-wrap">
                  <Badge className={getTypeColor(notification.type)} variant="outline">
                    {notification.type}
                  </Badge>
                  <Badge 
                    className={`${getPriorityColor(notification.priority)} border-current`} 
                    variant="outline"
                  >
                    {notification.priority}
                  </Badge>
                  {isSent && (
                    <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                      Sent
                    </Badge>
                  )}
                  {isExpired && (
                    <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
                      Expired
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                {!isSent && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id, !notification.is_read);
                      }}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      {notification.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchive(notification.id, !notification.is_archived);
                      }}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {(isSent || user.role === 'full_admin') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                {!isSent && notification.sender && (
                  <span>
                    From: {notification.sender.preferred_name || notification.sender.legal_first_name}
                  </span>
                )}
                {isSent && notification.recipient && (
                  <span>
                    To: {notification.recipient.preferred_name || notification.recipient.legal_first_name}
                  </span>
                )}
              </div>
              <span>{formatDate(notification.created_at)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const StatsCards = () => {
    const totalNotifications = notifications.filter(n => n.recipient_id === user.id).length;
    const unreadCount = notifications.filter(n => !n.is_read && n.recipient_id === user.id).length;
    const todayCount = notifications.filter(n => {
      const today = new Date();
      const notificationDate = new Date(n.created_at);
      return notificationDate.toDateString() === today.toDateString() && n.recipient_id === user.id;
    }).length;
    const sentCount = notifications.filter(n => n.sender_id === user.id).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Notifications</p>
                <p className="text-white text-2xl font-bold">{totalNotifications}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Unread</p>
                <p className="text-white text-2xl font-bold">{unreadCount}</p>
              </div>
              <BellOff className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Today</p>
                <p className="text-white text-2xl font-bold">{todayCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Sent</p>
                <p className="text-white text-2xl font-bold">{sentCount}</p>
              </div>
              <Send className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingBar text="Loading notification center..." />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read && n.recipient_id === user.id).length;
  const isAdmin = ['admin', 'full_admin'].includes(user.role);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notification Center</h1>
          <p className="text-slate-800 dark:text-slate-400 mt-2">Manage alerts, announcements, and team communications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowPreferencesDialog(true)} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </Button>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
          {isAdmin && (
            <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StatsCards />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Notifications</CardTitle>
            <CardDescription className="text-slate-400">
              Stay updated with important alerts, announcements, and team communications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  type="search"
                  placeholder="Search notifications (title, message, type...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="announcement">Announcement</option>
                  <option value="reminder">Reminder</option>
                  <option value="system">System</option>
                  <option value="invoice">Invoice</option>
                  <option value="proposal">Proposal</option>
                  <option value="lead">Lead</option>
                  <option value="project">Project</option>
                  <option value="credential">Credential</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="all">
                  All ({notifications.filter(n => !n.is_archived && n.recipient_id === user.id).length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="read">
                  Read ({notifications.filter(n => n.is_read && !n.is_archived && n.recipient_id === user.id).length})
                </TabsTrigger>
                <TabsTrigger value="archived">
                  Archived ({notifications.filter(n => n.is_archived && n.recipient_id === user.id).length})
                </TabsTrigger>
                <TabsTrigger value="sent">
                  Sent ({notifications.filter(n => n.sender_id === user.id).length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg mb-2">
                      {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' 
                        ? "No notifications match your filters." 
                        : activeTab === 'unread' 
                          ? "No unread notifications"
                          : activeTab === 'archived'
                            ? "No archived notifications"
                            : activeTab === 'sent'
                              ? "No sent notifications"
                              : "No notifications yet"}
                    </p>
                    <p className="text-slate-500 mb-4">
                      {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all'
                        ? "Try adjusting your search or filters."
                        : activeTab === 'unread'
                          ? "All caught up! Check back later for new notifications."
                          : activeTab === 'sent' && isAdmin
                            ? "Send your first notification to get started."
                            : "Notifications will appear here when you receive them."}
                    </p>
                    {activeTab === 'sent' && isAdmin && !searchTerm && typeFilter === 'all' && priorityFilter === 'all' && (
                      <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Send First Notification
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map(notification => (
                      <NotificationCard key={notification.id} notification={notification} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <CreateNotificationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        templates={templates}
        onNotificationCreated={fetchData}
      />

      <NotificationPreferencesDialog
        open={showPreferencesDialog}
        onOpenChange={setShowPreferencesDialog}
        preferences={preferences}
        onPreferencesUpdated={fetchData}
      />

      <NotificationDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        notification={selectedNotification}
      />
    </div>
  );
};

export default NotificationCenter;