import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Search, 
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import LoadingBar from '@/components/ui/LoadingBar';
import LeadStatsCards from '@/components/Leads/LeadStatsCards';
import LeadPipelineView from '@/components/Leads/LeadPipelineView';
import LeadListView from '@/components/Leads/LeadListView';
import AddEditLeadDialog from '@/components/Leads/AddEditLeadDialog';
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog';

const LeadsDashboard = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('pipeline');
  const [isAddEditLeadDialogOpen, setIsAddEditLeadDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchLeads = useCallback(async (isRefresh = false) => {
    if (!isMounted.current || !user?.team_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('team_id', user.team_id)
        .order('created_at', { ascending: false });

      if (!isMounted.current) return;

      if (error) {
        toast({ title: 'Error Fetching Leads', description: `Failed to fetch leads: ${error.message}`, variant: 'destructive' });
        if (isMounted.current) {
          setLeads([]);
          setFilteredLeads([]);
        }
        return;
      }
      
      if (isMounted.current) {
        setLeads(data || []);
        setFilteredLeads(data || []);
      }
    } catch (error) {
      if (isMounted.current) {
        toast({ title: 'Unexpected Error', description: `An error occurred while fetching leads: ${error.message}`, variant: 'destructive' });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [user?.team_id]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (!loading) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      setFilteredLeads(
        leads.filter(lead => 
          lead.company_name?.toLowerCase().includes(lowerSearchTerm) ||
          lead.contact_name?.toLowerCase().includes(lowerSearchTerm) ||
          lead.email?.toLowerCase().includes(lowerSearchTerm) ||
          lead.phone?.toLowerCase().includes(lowerSearchTerm) ||
          lead.source?.toLowerCase().includes(lowerSearchTerm)
        )
      );
    }
  }, [searchTerm, leads, loading]);

  const handleRefresh = () => {
    setSearchTerm('');
    fetchLeads(true);
  };

  const handleOpenAddLeadDialog = () => {
    setEditingLead(null);
    setIsAddEditLeadDialogOpen(true);
  };

  const handleOpenEditLeadDialog = (lead) => {
    setEditingLead(lead);
    setIsAddEditLeadDialogOpen(true);
  };

  const handleLeadSaved = () => {
    setIsAddEditLeadDialogOpen(false);
    fetchLeads(true);
  };

  const requestDeleteLead = (leadId) => {
    setLeadToDelete(leadId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadToDelete)
        .eq('team_id', user.team_id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Lead deleted successfully.' });
      fetchLeads(true);
    } catch (error) {
      toast({ title: 'Error Deleting Lead', description: error.message, variant: 'destructive' });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };
  
  const handleStageChange = async (leadId, newStage) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({ stage: newStage, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .eq('team_id', user.team_id)
        .select()
        .single();

      if (error) throw error;
      
      if (isMounted.current) {
        setLeads(prevLeads => prevLeads.map(l => l.id === leadId ? data : l));
      }
    } catch (error) {
      toast({ title: 'Error Updating Lead Stage', description: error.message, variant: 'destructive' });
    }
  };


  if (loading && leads.length === 0) {
    return (
      <div className="space-y-6">
        <LoadingBar text="Loading lead pipeline..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap lg:flex-row items-start lg:items-center justify-between gap-4"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white truncate">Leads Pipeline</h1>
          <p className="text-slate-800 dark:text-slate-400 text-sm lg:text-base mt-1">Track prospects, manage opportunities, and convert leads to clients</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button variant="outline" onClick={handleRefresh} disabled={loading} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenAddLeadDialog} className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full"
      >
        <LeadStatsCards leads={leads} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <Card className="glass-effect border-slate-700 w-full">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-slate-900 dark:text-white text-lg lg:text-xl">Lead Management</CardTitle>
                <CardDescription className="text-slate-800 dark:text-slate-400 text-sm">
                  Manage your sales pipeline and track lead progress through different stages.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                type="search"
                placeholder="Search leads (company, contact, email, phone...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            <Tabs defaultValue={activeView} onValueChange={setActiveView} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="pipeline" className="text-sm">Pipeline View</TabsTrigger>
                <TabsTrigger value="list" className="text-sm">List View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pipeline" className="mt-4">
                {loading && filteredLeads.length === 0 ? (
                  <LoadingBar text="Fetching pipeline..."/>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    {searchTerm ? "No leads match your search." : "No leads found. Add your first lead to get started!"}
                  </div>
                ) : (
                  <LeadPipelineView 
                    leads={filteredLeads} 
                    onEditLead={handleOpenEditLeadDialog} 
                    onStageChange={handleStageChange}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="list" className="mt-4">
                 {loading && filteredLeads.length === 0 ? (
                  <LoadingBar text="Fetching list..."/>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    {searchTerm ? "No leads match your search." : "No leads found. Add your first lead to get started!"}
                  </div>
                ) : (
                  <LeadListView 
                    leads={filteredLeads} 
                    onEditLead={handleOpenEditLeadDialog}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {isAddEditLeadDialogOpen && (
        <AddEditLeadDialog
          isOpen={isAddEditLeadDialogOpen}
          onClose={() => setIsAddEditLeadDialogOpen(false)}
          lead={editingLead}
          onLeadSaved={handleLeadSaved}
          teamId={user.team_id}
          userId={user.id}
          onDeleteLead={requestDeleteLead}
        />
      )}

      {isConfirmDeleteDialogOpen && (
        <ConfirmDeleteDialog
          isOpen={isConfirmDeleteDialogOpen}
          onClose={() => setIsConfirmDeleteDialogOpen(false)}
          onConfirm={confirmDeleteLead}
          title="Delete Lead"
          description="Are you sure you want to delete this lead? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default LeadsDashboard;