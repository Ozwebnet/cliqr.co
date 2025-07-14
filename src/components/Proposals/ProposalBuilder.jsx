import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Search, 
  Plus, 
  FileText, 
  Send, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Copy,
  Calendar,
  DollarSign,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import LoadingBar from '@/components/ui/LoadingBar';
import CreateProposalDialog from '@/components/Proposals/CreateProposalDialog';
import ProposalPreviewDialog from '@/components/Proposals/ProposalPreviewDialog';

const ProposalBuilder = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('proposals');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.team_id) return;
    
    setLoading(true);
    try {
      // Fetch proposals
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select(`
          *,
          client:client_id(id, preferred_name, legal_first_name, business_name, email),
          created_by_user:created_by(preferred_name, legal_first_name)
        `)
        .eq('team_id', user.team_id)
        .order('created_at', { ascending: false });

      if (proposalsError) throw proposalsError;

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('team_id', user.team_id)
        .order('is_default', { ascending: false });

      if (templatesError) throw templatesError;

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('users')
        .select('id, preferred_name, legal_first_name, business_name, email')
        .eq('team_id', user.team_id)
        .eq('role', 'client')
        .eq('status', 'active')
        .order('preferred_name');

      if (clientsError) throw clientsError;

      setProposals(proposalsData || []);
      setTemplates(templatesData || []);
      setClients(clientsData || []);
      setFilteredProposals(proposalsData || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch data: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.team_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      setFilteredProposals(
        proposals.filter(proposal => 
          proposal.title?.toLowerCase().includes(lowerSearchTerm) ||
          proposal.proposal_number?.toLowerCase().includes(lowerSearchTerm) ||
          proposal.client?.business_name?.toLowerCase().includes(lowerSearchTerm) ||
          proposal.client?.preferred_name?.toLowerCase().includes(lowerSearchTerm) ||
          proposal.status?.toLowerCase().includes(lowerSearchTerm)
        )
      );
    }
  }, [searchTerm, proposals, loading]);

  const handleRefresh = () => {
    setSearchTerm('');
    fetchData();
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200',
      viewed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <Edit className="w-4 h-4" />,
      sent: <Send className="w-4 h-4" />,
      viewed: <Eye className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      expired: <AlertCircle className="w-4 h-4" />
    };
    return icons[status] || <FileText className="w-4 h-4" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleCreateProposal = () => {
    setShowCreateDialog(true);
  };

  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal);
    setShowPreviewDialog(true);
  };

  const handleEditProposal = (proposal) => {
    toast({
      title: '🚧 Edit Proposal Not Implemented',
      description: "Proposal editing isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleDuplicateProposal = (proposal) => {
    toast({
      title: '🚧 Duplicate Proposal Not Implemented',
      description: "Proposal duplication isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleDeleteProposal = async (proposalId) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposalId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Proposal deleted successfully'
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete proposal: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleSendProposal = (proposal) => {
    toast({
      title: '🚧 Send Proposal Not Implemented',
      description: "Proposal sending isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const ProposalCard = ({ proposal }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-white font-semibold text-lg">{proposal.title}</h3>
            <Badge className={getStatusColor(proposal.status)} variant="outline">
              <div className="flex items-center space-x-1">
                {getStatusIcon(proposal.status)}
                <span className="capitalize">{proposal.status}</span>
              </div>
            </Badge>
          </div>
          <p className="text-slate-400 text-sm mb-2">#{proposal.proposal_number}</p>
          {proposal.description && (
            <p className="text-slate-300 text-sm mb-3 line-clamp-2">{proposal.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center text-slate-300 text-sm">
            <Building className="w-4 h-4 mr-2 text-slate-400" />
            {proposal.client?.business_name || proposal.client?.preferred_name || 'No client'}
          </div>
          <div className="flex items-center text-slate-300 text-sm">
            <User className="w-4 h-4 mr-2 text-slate-400" />
            {proposal.client?.preferred_name || proposal.client?.legal_first_name || 'Unknown'}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-slate-300 text-sm">
            <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
            {formatCurrency(proposal.total_amount)}
          </div>
          <div className="flex items-center text-slate-300 text-sm">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            Valid until: {formatDate(proposal.valid_until)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center text-slate-400 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Created {formatDate(proposal.created_at)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewProposal(proposal)}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          {proposal.status === 'draft' && (
            <Button
              size="sm"
              onClick={() => handleSendProposal(proposal)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Send className="w-4 h-4 mr-1" />
              Send
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditProposal(proposal)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDuplicateProposal(proposal)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteProposal(proposal.id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const TemplateCard = ({ template }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-white font-semibold text-lg">{template.name}</h3>
            {template.is_default && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                Default
              </Badge>
            )}
          </div>
          {template.description && (
            <p className="text-slate-400 text-sm mb-3">{template.description}</p>
          )}
          <Badge className="bg-slate-700 text-slate-300" variant="secondary">
            {template.category?.replace('_', ' ') || 'General'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center text-slate-400 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Created {formatDate(template.created_at)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedProposal({ template });
              setShowPreviewDialog(true);
            }}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowCreateDialog(true);
              // Pre-select this template in the dialog
            }}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Use Template
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const StatsCards = () => {
    const totalProposals = proposals.length;
    const totalValue = proposals.reduce((sum, p) => sum + (p.total_amount || 0), 0);
    const acceptedProposals = proposals.filter(p => p.status === 'accepted');
    const acceptedValue = acceptedProposals.reduce((sum, p) => sum + (p.total_amount || 0), 0);
    const conversionRate = totalProposals > 0 ? (acceptedProposals.length / totalProposals * 100).toFixed(1) : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Proposals</p>
                <p className="text-white text-2xl font-bold">{totalProposals}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Value</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Accepted Value</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(acceptedValue)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Conversion Rate</p>
                <p className="text-white text-2xl font-bold">{conversionRate}%</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingBar text="Loading proposal builder..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Proposal Builder</h1>
          <p className="text-slate-800 dark:text-slate-400 mt-2">Create, manage, and track professional business proposals</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateProposal} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create Proposal
          </Button>
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
            <CardTitle className="text-white">Proposal Management</CardTitle>
            <CardDescription className="text-slate-400">
              Manage your proposals and templates with professional tools for client engagement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                type="search"
                placeholder="Search proposals (title, client, status...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
                <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="proposals" className="mt-6">
                {filteredProposals.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg mb-2">
                      {searchTerm ? "No proposals match your search." : "No proposals yet"}
                    </p>
                    <p className="text-slate-500 mb-4">
                      {searchTerm ? "Try adjusting your search terms." : "Create your first proposal to get started!"}
                    </p>
                    {!searchTerm && (
                      <Button onClick={handleCreateProposal} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Proposal
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredProposals.map(proposal => (
                      <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="templates" className="mt-6">
                {templates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg mb-2">No templates available</p>
                    <p className="text-slate-500 mb-4">Templates help you create proposals faster with pre-built structures.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {templates.map(template => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <CreateProposalDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        templates={templates}
        clients={clients}
        onProposalCreated={fetchData}
      />

      <ProposalPreviewDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        proposal={selectedProposal}
      />
    </div>
  );
};

export default ProposalBuilder;