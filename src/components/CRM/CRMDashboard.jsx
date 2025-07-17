import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import AddUserDialog from '@/components/CRM/AddUserDialog';
import TeamMemberSignUpDialog from '@/components/CRM/TeamMember/TeamMemberSignUpDialog';
import UserListItem from '@/components/CRM/UserListItem';
import EnhancedPendingInvitesManager from '@/components/CRM/EnhancedPendingInvitesManager';
import LoadingBar from '@/components/ui/LoadingBar';

const CRMDashboard = () => {
  const { user, softDeleteUser, permanentlyDeleteUser, restoreUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allSoftDeletedUsers, setAllSoftDeletedUsers] = useState([]);
  const [filteredSoftDeletedUsers, setFilteredSoftDeletedUsers] = useState([]);
  const [authUsersData, setAuthUsersData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activeUsers');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchAuthUsersData = useCallback(async (userIds) => {
    if (!isMounted.current || !userIds || userIds.length === 0) return {};
    
    const newAuthData = {};
    await Promise.all(userIds.map(async (userId) => {
      if (!isMounted.current) return;
      try {
        const { data, error } = await supabase.functions.invoke('get-user-auth-status', {
          body: JSON.stringify({ userId })
        });

        if (!isMounted.current) return;

        if (error) {
          console.warn(`Error invoking Edge Function for user ${userId}: ${error.message}`);
          newAuthData[userId] = { email_confirmed_at: null, last_sign_in_at: null, error: error.message, fetched: true };
        } else if (data) {
          newAuthData[userId] = { 
            email_confirmed_at: data.email_confirmed_at, 
            last_sign_in_at: data.last_sign_in_at, 
            fetched: true 
          };
        } else {
          newAuthData[userId] = { email_confirmed_at: null, last_sign_in_at: null, fetched: true };
        }
      } catch (e) {
        if (!isMounted.current) return;
        console.error(`Exception invoking Edge Function for user ${userId}:`, e.message);
        newAuthData[userId] = { email_confirmed_at: null, last_sign_in_at: null, error: e.message, fetched: true };
      }
    }));
    return newAuthData;
  }, []);


  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (!isMounted.current || !user?.team_id) return;
    
    setLoading(true);

    try {
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select(`
              id, email, name, role, created_at, updated_at, team_id, status, deleted_at, 
              legal_first_name, legal_middle_name, legal_last_name, preferred_name, 
              phone_number, business_name, abn, acn, position_job_title, 
              preferred_contact_method, employment_type, 
              portfolio_url, social_profiles, bank_account_name, bsb_number, 
              account_number, skill_set, 
              hourly_rate, government_id_url, signed_agreement_url
            `)
            .eq('team_id', user.team_id);

        if (!isMounted.current) return;

        if (usersError) {
            toast({ title: 'Error Fetching Accounts', description: `Failed to fetch accounts: ${usersError.message}`, variant: 'destructive' });
            if (isMounted.current) {
                setAllUsers([]);
                setFilteredUsers([]);
                setAllSoftDeletedUsers([]);
                setFilteredSoftDeletedUsers([]);
            }
            return; 
        }
        
        const active = usersData.filter(u => u.status === 'active');
        const softDeleted = usersData.filter(u => u.status === 'soft_deleted');
        
        if (isMounted.current) {
            setAllUsers(active);
            setAllSoftDeletedUsers(softDeleted);

            const lowerSearchTerm = searchTerm.toLowerCase();
            setFilteredUsers(
                active.filter(u => 
                  (u.legal_first_name?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.legal_middle_name?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.legal_last_name?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.preferred_name?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.business_name?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.phone_number?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.email?.toLowerCase().includes(lowerSearchTerm))
                )
            );
            setFilteredSoftDeletedUsers(
                softDeleted.filter(u => 
                  (u.legal_first_name?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.legal_middle_name?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.legal_last_name?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.preferred_name?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.business_name?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.phone_number?.toLowerCase().includes(lowerSearchTerm)) ||
                  (u.email?.toLowerCase().includes(lowerSearchTerm))
                )
            );
        }

        const allUserIds = usersData.map(u => u.id);

        if (allUserIds.length > 0) {
            const newAuthDataRequired = isRefresh || !initialLoadComplete || allUserIds.some(id => !authUsersData[id]?.fetched);
            if (newAuthDataRequired) {
                const fetchedAuthData = await fetchAuthUsersData(allUserIds);
                if (isMounted.current) {
                  setAuthUsersData(prev => ({...prev, ...fetchedAuthData}));
                }
            }
        }
    } catch (error) {
        if (isMounted.current) {
            toast({ title: 'Unexpected Error', description: `An error occurred while fetching accounts: ${error.message}`, variant: 'destructive' });
        }
    } finally {
        if (isMounted.current) {
          setLoading(false);
          if (!initialLoadComplete) {
            setInitialLoadComplete(true);
          }
        }
    }
  }, [user?.team_id, fetchAuthUsersData, authUsersData, initialLoadComplete, searchTerm]);

  useEffect(() => {
    if (user?.team_id && !initialLoadComplete) {
        fetchUsers(false); 
    }
  }, [user?.team_id, initialLoadComplete, fetchUsers]);


  useEffect(() => {
    if (!loading) { 
        const lowerSearchTerm = searchTerm.toLowerCase();
        setFilteredUsers(
            allUsers.filter(u => 
            (u.legal_first_name?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.legal_middle_name?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.legal_last_name?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.preferred_name?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.business_name?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.phone_number?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.email?.toLowerCase().includes(lowerSearchTerm))
            )
        );
        setFilteredSoftDeletedUsers(
            allSoftDeletedUsers.filter(u => 
            (u.legal_first_name?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.legal_middle_name?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.legal_last_name?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.preferred_name?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.business_name?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.phone_number?.toLowerCase().includes(lowerSearchTerm)) ||
            (u.email?.toLowerCase().includes(lowerSearchTerm))
            )
        );
    }
  }, [searchTerm, allUsers, allSoftDeletedUsers, loading, activeTab]);

  const handleRefresh = () => {
    setSearchTerm(''); 
    fetchUsers(true); 
  };

  const handleActionThenRefresh = async (actionPromise) => {
    const success = await actionPromise;
    if (success && isMounted.current) {
      fetchUsers(true);
    }
  };

  const handleSoftDelete = (userId) => handleActionThenRefresh(softDeleteUser(userId));
  const handlePermanentDelete = (userId) => handleActionThenRefresh(permanentlyDeleteUser(userId));
  const handleRestoreUser = (userId) => handleActionThenRefresh(restoreUser(userId));
  const handleUserUpdated = () => fetchUsers(true);
  const handleUserAdded = () => fetchUsers(true);
  
  const UsersList = ({ listUsers, isRecyclingBin }) => (
    <div className="space-y-4">
      {listUsers.map((clientUser) => (
        <UserListItem 
          key={clientUser.id} 
          clientUser={clientUser} 
          isRecyclingBin={isRecyclingBin}
          authData={authUsersData[clientUser.id]}
          currentAuthUser={user}
          onSoftDelete={handleSoftDelete}
          onPermanentDelete={handlePermanentDelete}
          onRestoreUser={handleRestoreUser}
          onUserUpdated={handleUserUpdated}
          initialLoadComplete={initialLoadComplete}
        />
      ))}
    </div>
  );

  const renderTabContent = (tabUsers, emptySearchMsg, emptyTabMsg, loadingText) => {
    if (loading && (!initialLoadComplete || (initialLoadComplete && loading))) {
      return <LoadingBar text={loadingText} />;
    }
    if (initialLoadComplete && !loading && tabUsers.length === 0) {
      return (
        <p className="text-center text-slate-400 py-10">
          {searchTerm ? emptySearchMsg : emptyTabMsg}
        </p>
      );
    }
    if (initialLoadComplete && !loading && tabUsers.length > 0) {
      return <UsersList listUsers={tabUsers} isRecyclingBin={activeTab === 'recyclingBin'} />;
    }
    return null;
  };


  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Account Management</h1>
          <p className="text-slate-800 dark:text-slate-400 mt-2">Manage client and team member accounts.</p>
        </div>
        <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleRefresh} disabled={loading && initialLoadComplete}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading && initialLoadComplete ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
            {user?.role === 'full_admin' && (
              <div className="flex space-x-2">
                <AddUserDialog onUserAdded={handleUserAdded} />
                <TeamMemberSignUpDialog onUserAdded={handleUserAdded} />
              </div>
            )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">User Accounts</CardTitle>
            <CardDescription className="text-slate-400">View and manage active user accounts and the recycling bin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                type="search"
                placeholder="Search accounts (name, business, email, phone...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activeUsers">Active Accounts</TabsTrigger>
                <TabsTrigger value="recyclingBin">Recycling Bin</TabsTrigger>
              </TabsList>
              <TabsContent value="activeUsers" className="mt-6">
                {renderTabContent(
                  filteredUsers,
                  "No active accounts match your search.",
                  "No active accounts found.",
                  "Fetching active accounts..."
                )}
              </TabsContent>
              <TabsContent value="recyclingBin" className="mt-6">
                {renderTabContent(
                  filteredSoftDeletedUsers,
                  "No accounts in the bin match your search.",
                  "The recycling bin is empty.",
                  "Checking recycling bin..."
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Pending Invitations Section */}
      <div className="max-w-4xl">
        <EnhancedPendingInvitesManager />
      </div>
    </div>
  );
};

export default CRMDashboard;