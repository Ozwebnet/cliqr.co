import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  RefreshCw, 
  Mail, 
  Clock, 
  Send, 
  X, 
  Users, 
  UserPlus,
  AlertCircle,
  CheckCircle,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import LoadingBar from '@/components/ui/LoadingBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PendingInvitesManager = () => {
  const { user } = useAuth();
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchPendingInvites = useCallback(async () => {
    if (!isMounted.current || !user?.team_id) return;
    
    setLoading(true);
    try {
      // Use the database function to get pending invitations (bypasses RLS)
      const { data: invitationsData, error: invitationsError } = await supabase
        .rpc('get_pending_invitations', { p_team_id: user.team_id });

      if (invitationsError) throw invitationsError;

      let allPendingInvites = [];

      if (invitationsData) {
        allPendingInvites = invitationsData.map(invite => ({
          id: invite.id,
          email: invite.email,
          role: invite.role,
          created_at: invite.created_at,
          legal_first_name: invite.legal_first_name,
          legal_last_name: invite.legal_last_name,
          preferred_name: invite.preferred_name,
          business_name: invite.business_name,
          invited_at: invite.created_at,
          status: 'pending_invitation',
          invite_type: 'invitation_table',
          user_id: invite.user_id,
          token: invite.token,
          invited_by_name: invite.invited_by_name || 'Unknown'
        }));
      }

      if (isMounted.current) {
        setPendingInvites(allPendingInvites);
      }
    } catch (error) {
      if (isMounted.current) {
        toast({
          title: 'Error',
          description: `Failed to fetch pending invites: ${error.message}`,
          variant: 'destructive'
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [user?.team_id]);

  useEffect(() => {
    fetchPendingInvites();
  }, [fetchPendingInvites]);

  const handleResendInvite = async (invite) => {
    try {
      // Use the database function to resend invitation
      const { data, error } = await supabase
        .rpc('resend_invitation', { p_invitation_id: invite.id });

      if (error) throw error;
      
      if (data.success) {
        // Try to send the actual email using the admin-invite-user function
        try {
          const { data: emailData, error: emailError } = await supabase.functions.invoke('admin-invite-user', {
            body: JSON.stringify({ 
              email: data.email, 
              role: data.role,
              resend: true,
              token: data.token,
              invitation_id: data.invitation_id
            }),
          });

          if (emailError) {
            console.warn('Email sending failed:', emailError);
            toast({
              title: 'Invitation Updated',
              description: `Invitation for ${invite.email} has been updated, but email sending may have failed. Please check your email service.`,
              variant: 'default'
            });
          } else if (emailData?.error) {
            console.warn('Email function returned error:', emailData.error);
            toast({
              title: 'Invitation Updated',
              description: `Invitation for ${invite.email} has been updated, but email sending may have failed.`,
              variant: 'default'
            });
          } else {
            toast({
              title: 'Invitation Resent',
              description: `Invitation email has been resent to ${invite.email}`,
              variant: 'success'
            });
          }
        } catch (emailError) {
          console.warn('Email sending function not available or failed:', emailError);
          toast({
            title: 'Invitation Updated',
            description: `Invitation for ${invite.email} has been updated. Email sending requires additional setup.`,
            variant: 'default'
          });
        }
        
        // Refresh the list
        fetchPendingInvites();
      } else {
        throw new Error(data.error || 'Failed to resend invitation');
      }
    } catch (error) {
      toast({
        title: 'Failed to Resend',
        description: error.message || 'An error occurred while resending the invitation',
        variant: 'destructive'
      });
    }
  };

  const handleCancelInvite = async (invite) => {
    try {
      // Use the database function to cancel invitation
      const { data, error } = await supabase
        .rpc('cancel_invitation', { p_invitation_id: invite.id });

      if (error) throw error;
      
      if (data.success) {
        toast({
          title: 'Invitation Cancelled',
          description: `Invitation for ${invite.email} has been cancelled`,
          variant: 'success'
        });
        
        // Refresh the list
        fetchPendingInvites();
      } else {
        throw new Error(data.error || 'Failed to cancel invitation');
      }
    } catch (error) {
      toast({
        title: 'Failed to Cancel',
        description: error.message || 'An error occurred while cancelling the invitation',
        variant: 'destructive'
      });
    }
  };



  const getInviteDisplayName = (invite) => {
    if (invite.preferred_name) return invite.preferred_name;
    if (invite.legal_first_name && invite.legal_last_name) {
      return `${invite.legal_first_name} ${invite.legal_last_name}`;
    }
    return invite.email;
  };

  const getTimeSinceInvited = (invitedAt) => {
    const now = new Date();
    const invited = new Date(invitedAt);
    const diffInHours = Math.floor((now - invited) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'client':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'admin':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'full_admin':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  if (loading) {
    return (
      <Card className="glass-effect border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingBar text="Loading pending invitations..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="glass-effect border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center text-lg">
              <Mail className="w-4 h-4 mr-2" />
              Pending Invitations
              {pendingInvites.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {pendingInvites.length}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPendingInvites}
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {pendingInvites.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No pending invitations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                      {invite.role === 'client' ? (
                        <UserPlus className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium text-sm">
                          {getInviteDisplayName(invite)}
                        </h4>
                        <Badge className={getRoleColor(invite.role)} size="sm">
                          {invite.role.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs">{invite.email}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>Invited {getTimeSinceInvited(invite.invited_at)}</span>
                          {invite.invited_by_name && (
                            <span className="text-slate-600">by {invite.invited_by_name}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-yellow-500">
                          <AlertCircle className="w-3 h-3" />
                          <span>
                            {invite.invite_type === 'pending_onboarding' && 'Pending onboarding'}
                            {invite.invite_type === 'invitation_table' && 'Awaiting response'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvite(invite)}
                      className="text-blue-400 border-blue-400 hover:bg-blue-400/10 text-xs px-2 py-1"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Resend
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2 py-1">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleCancelInvite(invite)}
                          className="text-red-400 focus:text-red-400"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel Invitation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PendingInvitesManager; 