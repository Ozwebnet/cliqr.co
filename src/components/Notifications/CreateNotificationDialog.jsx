import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { 
  Send, 
  Users, 
  User, 
  Calendar, 
  Clock, 
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Megaphone,
  Settings,
  FileText,
  Receipt,
  Shield,
  Folder
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabaseClient';

const CreateNotificationDialog = ({ open, onOpenChange, templates, onNotificationCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    recipients: [],
    send_to_all: false,
    template_id: '',
    action_url: '',
    action_label: '',
    expires_at: '',
    scheduled_for: ''
  });

  const resetForm = useCallback(() => {
    setStep(1);
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      recipients: [],
      send_to_all: false,
      template_id: '',
      action_url: '',
      action_label: '',
      expires_at: '',
      scheduled_for: ''
    });
  }, []);

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
    }
  }, [open]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, preferred_name, legal_first_name, email, role')
        .eq('team_id', user.team_id)
        .eq('status', 'active')
        .neq('id', user.id)
        .order('preferred_name');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch team members: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        title: template.title_template,
        message: template.message_template,
        type: template.type,
        action_url: template.action_url_template || '',
        action_label: template.action_label || ''
      }));
    }
  };

  const handleRecipientToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(userId)
        ? prev.recipients.filter(id => id !== userId)
        : [...prev.recipients, userId]
    }));
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

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a title and message for the notification.',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.send_to_all && formData.recipients.length === 0) {
      toast({
        title: 'No Recipients',
        description: 'Please select recipients or choose to send to all team members.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const recipients = formData.send_to_all 
        ? teamMembers.map(member => member.id)
        : formData.recipients;

      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        action_url: formData.action_url || null,
        action_label: formData.action_label || null,
        expires_at: formData.expires_at || null,
        scheduled_for: formData.scheduled_for || null,
        sender_id: user.id,
        team_id: user.team_id,
        sent_at: formData.scheduled_for ? null : new Date().toISOString()
      };

      // Create notifications for each recipient
      const notifications = recipients.map(recipientId => ({
        ...notificationData,
        recipient_id: recipientId
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Notification sent to ${recipients.length} recipient${recipients.length > 1 ? 's' : ''}!`
      });

      onNotificationCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to send notification: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const TypeIcon = getTypeIcon(formData.type);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!loading) { onOpenChange(isOpen); if (!isOpen) resetForm(); } }}>
      <DialogContent className="sm:max-w-3xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white overflow-y-auto max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Send Notification
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Step {step} of 3: {step === 1 ? 'Message Content' : step === 2 ? 'Recipients' : 'Review & Send'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Template Selection */}
              {templates.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Use Template (Optional)</Label>
                  <Select value={formData.template_id} onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            <span>{template.name}</span>
                            <Badge className={getTypeColor(template.type)} variant="outline">
                              {template.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter notification title"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-slate-300">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="w-4 h-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="credential">Credential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-300">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Enter your notification message"
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-slate-300">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action_label" className="text-slate-300">Action Button Text</Label>
                  <Input
                    id="action_label"
                    value={formData.action_label}
                    onChange={(e) => handleInputChange('action_label', e.target.value)}
                    placeholder="e.g., View Details, Take Action"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action_url" className="text-slate-300">Action URL</Label>
                <Input
                  id="action_url"
                  value={formData.action_url}
                  onChange={(e) => handleInputChange('action_url', e.target.value)}
                  placeholder="/dashboard, /invoices/123, https://example.com"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_for" className="text-slate-300">Schedule For (Optional)</Label>
                  <Input
                    id="scheduled_for"
                    type="datetime-local"
                    value={formData.scheduled_for}
                    onChange={(e) => handleInputChange('scheduled_for', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires_at" className="text-slate-300">Expires At (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => handleInputChange('expires_at', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Select Recipients
                </h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send_to_all"
                    checked={formData.send_to_all}
                    onCheckedChange={(checked) => handleInputChange('send_to_all', checked)}
                  />
                  <Label htmlFor="send_to_all" className="text-slate-300">Send to all team members</Label>
                </div>

                {!formData.send_to_all && (
                  <div className="space-y-3">
                    <p className="text-slate-400 text-sm">Select individual team members:</p>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {teamMembers.map(member => (
                        <div key={member.id} className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
                          <Checkbox
                            id={member.id}
                            checked={formData.recipients.includes(member.id)}
                            onCheckedChange={() => handleRecipientToggle(member.id)}
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {member.preferred_name || member.legal_first_name}
                            </p>
                            <p className="text-slate-400 text-sm">{member.email}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.send_to_all && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <p className="text-slate-300">
                        This notification will be sent to all {teamMembers.length} team members.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Review Your Notification</h3>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TypeIcon className="w-5 h-5 mr-2" />
                    Notification Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(formData.type)} variant="outline">
                      {formData.type}
                    </Badge>
                    <Badge variant="outline" className={`${
                      formData.priority === 'urgent' ? 'text-red-500' :
                      formData.priority === 'high' ? 'text-orange-500' :
                      formData.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    } border-current`}>
                      {formData.priority} priority
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-2">{formData.title}</h4>
                    <p className="text-slate-300 mb-4">{formData.message}</p>
                    {formData.action_label && formData.action_url && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        {formData.action_label}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Delivery Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Recipients:</span>
                    <span className="text-white">
                      {formData.send_to_all 
                        ? `All team members (${teamMembers.length})`
                        : `${formData.recipients.length} selected members`
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Delivery:</span>
                    <span className="text-white">
                      {formData.scheduled_for ? `Scheduled for ${new Date(formData.scheduled_for).toLocaleString()}` : 'Immediate'}
                    </span>
                  </div>
                  {formData.expires_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Expires:</span>
                      <span className="text-white">{new Date(formData.expires_at).toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-0">
          <div className="flex items-center justify-between w-full">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="text-slate-300 border-slate-600 hover:bg-slate-700">
                  Previous
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }} disabled={loading} className="text-slate-300 border-slate-600 hover:bg-slate-700">
                Cancel
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Sending...' : formData.scheduled_for ? 'Schedule' : 'Send Now'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNotificationDialog;