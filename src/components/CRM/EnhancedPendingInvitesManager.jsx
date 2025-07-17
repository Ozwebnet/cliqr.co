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
  MoreHorizontal,
  Eye,
  Edit,
  UserCheck,
  Calendar,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import LoadingBar from '@/components/ui/LoadingBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { 
  getEnhancedPendingInvitations, 
  cancelInvitation, 
  resetInvitation,
  INVITATION_STATES 
} from '@/lib/invitationSchema';

import InvitationReviewDialog from './InvitationReviewDialog';

const EnhancedPendingInvitesManager = () => {
  const { user } = useAuth();
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

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
      const result = await getEnhancedPendingInvitations(user.team_id);
      
      if (result.success && isMounted.current) {
        setPendingInvites(result.data || []);
      } else if (!result.success) {
        // Check if it's a schema error (tables don't exist yet)
        if (result.error?.includes('invitation_onboarding') || result.error?.includes('relationship')) {
          console.warn('Enhanced invitation tables not found. Database migration needed.');
          setPendingInvites([]);
          if (isMounted.current) {
            toast({
              title: 'Database Migration Required',
              description: 'Enhanced invitation workflow requires database setup. Please run the migration script.',
              variant: 'default'
            });
          }
        } else {
          toast({
            title: 'Error',
            description: `Failed to fetch pending invites: ${result.error}`,
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      if (isMounted.current) {
        // Check if it's a schema-related error
        if (error.message?.includes('invitation_onboarding') || error.message?.includes('relationship')) {
          console.warn('Enhanced invitation tables not found:', error.message);
          setPendingInvites([]);
          toast({
            title: 'Database Migration Required',
            description: 'Enhanced invitation workflow requires database setup. Check DATABASE_SETUP_INSTRUCTIONS.md',
            variant: 'default'
          });
        } else {
          toast({
            title: 'Error',
            description: `Failed to fetch pending invites: ${error.message}`,
            variant: 'destructive'
          });
        }
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

  const handleReviewInvitation = (invitation) => {
    setSelectedInvitation(invitation);
    setReviewDialogOpen(true);
  };

  const handleCancelInvitation = async (invitation) => {
    try {
      const result = await cancelInvitation(invitation.id);
      
      if (result.success) {
        toast({
          title: 'Invitation Cancelled',
          description: `Invitation for ${invitation.email} has been cancelled`,
          variant: 'success'
        });
        
        fetchPendingInvites();
      } else {
        throw new Error(result.error || 'Failed to cancel invitation');
      }
    } catch (error) {
      toast({
        title: 'Failed to Cancel',
        description: error.message || 'An error occurred while cancelling the invitation',
        variant: 'destructive'
      });
    }
  };

  const handleResetInvitation = async (invitation) => {
    try {
      const result = await resetInvitation(invitation.id);
      
      if (result.success) {
        toast({
          title: 'Invitation Reset',
          description: `Invitation for ${invitation.email} has been reset and a new link will be sent`,
          variant: 'success'
        });
        
        fetchPendingInvites();
      } else {
        throw new Error(result.error || 'Failed to reset invitation');
      }
    } catch (error) {
      toast({
        title: 'Failed to Reset',
        description: error.message || 'An error occurred while resetting the invitation',
        variant: 'destructive'
      });
    }
  };

  const getInviteDisplayName = (invite) => {
    if (invite.invitee_form_data?.preferred_name) {
      return invite.invitee_form_data.preferred_name;
    }
    if (invite.invitee_form_data?.legal_first_name && invite.invitee_form_data?.legal_last_name) {
      return `${invite.invitee_form_data.legal_first_name} ${invite.invitee_form_data.legal_last_name}`;
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

  const getStatusColor = (status) => {
    switch (status) {
      case INVITATION_STATES.PENDING_INVITEE_RESPONSE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case INVITATION_STATES.PENDING_MANAGER_REVIEW:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case INVITATION_STATES.PENDING_MANAGER_COMPLETION:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case INVITATION_STATES.EXPIRED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case INVITATION_STATES.PENDING_INVITEE_RESPONSE:
        return 'Awaiting Response';
      case INVITATION_STATES.PENDING_MANAGER_REVIEW:
        return 'Ready for Review';
      case INVITATION_STATES.PENDING_MANAGER_COMPLETION:
        return 'Pending Completion';
      case INVITATION_STATES.EXPIRED:
        return 'Expired';
      default:
        return status.replace(/_/g, ' ');
    }
  };

  const canBeReviewed = (invitation) => {
    return invitation.status === INVITATION_STATES.PENDING_MANAGER_REVIEW || 
           invitation.status === INVITATION_STATES.PENDING_MANAGER_COMPLETION;
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
    <>
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
            <CardDescription className="text-slate-400">
              Two-stage invitation workflow with form completion and manager review
            </CardDescription>
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
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                        {invite.role === 'client' ? (
                          <UserPlus className="w-5 h-5" />
                        ) : (
                          <Users className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-medium text-sm">
                            {getInviteDisplayName(invite)}
                          </h4>
                          <Badge className={getRoleColor(invite.role)} size="sm">
                            {invite.role.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(invite.status)} size="sm">
                            {getStatusLabel(invite.status)}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs mb-1">{invite.email}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Invited {getTimeSinceInvited(invite.created_at)}</span>
                          </div>
                          {invite.invited_by_user && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>by {invite.invited_by_user.preferred_name || invite.invited_by_user.legal_first_name}</span>
                            </div>
                          )}
                          {invite.invitee_submitted_at && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>Form submitted {getTimeSinceInvited(invite.invitee_submitted_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {canBeReviewed(invite) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewInvitation(invite)}
                          className="text-blue-400 border-blue-400 hover:bg-blue-400/10 text-xs px-3 py-1"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {invite.status === INVITATION_STATES.PENDING_MANAGER_REVIEW ? 'Review' : 'Complete'}
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="px-2 py-1">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invite.status === INVITATION_STATES.PENDING_INVITEE_RESPONSE && (
                            <DropdownMenuItem onClick={() => handleResetInvitation(invite)}>
                              <Send className="w-4 h-4 mr-2" />
                              Resend Invitation
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => handleResetInvitation(invite)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset Invitation
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => handleCancelInvitation(invite)}
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

      <InvitationReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        invitation={selectedInvitation}
        onInvitationUpdated={fetchPendingInvites}
      />
    </>
  );
};

export default EnhancedPendingInvitesManager; 