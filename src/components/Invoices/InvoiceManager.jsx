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
  AlertTriangle,
  CreditCard,
  Receipt,
  TrendingUp,
  Filter,
  MoreHorizontal,
  Mail,
  Repeat
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import LoadingBar from '@/components/ui/LoadingBar';
import CreateInvoiceDialog from '@/components/Invoices/CreateInvoiceDialog';
import InvoiceDetailsDialog from '@/components/Invoices/InvoiceDetailsDialog';
import PaymentDialog from '@/components/Invoices/PaymentDialog';

const InvoiceManager = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('invoices');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.team_id) return;
    
    setLoading(true);
    try {
      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          client:client_id(id, preferred_name, legal_first_name, business_name, email),
          created_by_user:created_by(preferred_name, legal_first_name)
        `)
        .eq('team_id', user.team_id)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('invoice_templates')
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

      setInvoices(invoicesData || []);
      setTemplates(templatesData || []);
      setClients(clientsData || []);
      setFilteredInvoices(invoicesData || []);
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
      let filtered = invoices;

      // Filter by search term
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(invoice => 
          invoice.invoice_number?.toLowerCase().includes(lowerSearchTerm) ||
          invoice.title?.toLowerCase().includes(lowerSearchTerm) ||
          invoice.client?.business_name?.toLowerCase().includes(lowerSearchTerm) ||
          invoice.client?.preferred_name?.toLowerCase().includes(lowerSearchTerm) ||
          invoice.status?.toLowerCase().includes(lowerSearchTerm)
        );
      }

      // Filter by status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(invoice => invoice.status === statusFilter);
      }

      setFilteredInvoices(filtered);
    }
  }, [searchTerm, statusFilter, invoices, loading]);

  const handleRefresh = () => {
    setSearchTerm('');
    setStatusFilter('all');
    fetchData();
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200',
      viewed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-orange-100 text-orange-800 border-orange-200',
      refunded: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <Edit className="w-4 h-4" />,
      sent: <Send className="w-4 h-4" />,
      viewed: <Eye className="w-4 h-4" />,
      paid: <CheckCircle className="w-4 h-4" />,
      overdue: <AlertTriangle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      refunded: <Receipt className="w-4 h-4" />
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

  const getDaysOverdue = (dueDate, status) => {
    if (status === 'paid' || !dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleCreateInvoice = () => {
    setShowCreateDialog(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsDialog(true);
  };

  const handleEditInvoice = (invoice) => {
    toast({
      title: '🚧 Edit Invoice Not Implemented',
      description: "Invoice editing isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleDuplicateInvoice = (invoice) => {
    toast({
      title: '🚧 Duplicate Invoice Not Implemented',
      description: "Invoice duplication isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invoice deleted successfully'
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete invoice: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleSendInvoice = (invoice) => {
    toast({
      title: '🚧 Send Invoice Not Implemented',
      description: "Invoice sending isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleRecordPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };

  const InvoiceCard = ({ invoice }) => {
    const daysOverdue = getDaysOverdue(invoice.due_date, invoice.status);
    const isOverdue = daysOverdue > 0 && invoice.status !== 'paid';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-white font-semibold text-lg">{invoice.title}</h3>
              <Badge className={getStatusColor(invoice.status)} variant="outline">
                <div className="flex items-center space-x-1">
                  {getStatusIcon(invoice.status)}
                  <span className="capitalize">{invoice.status}</span>
                </div>
              </Badge>
              {invoice.is_recurring && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200" variant="outline">
                  <Repeat className="w-3 h-3 mr-1" />
                  Recurring
                </Badge>
              )}
              {isOverdue && (
                <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
                  {daysOverdue} days overdue
                </Badge>
              )}
            </div>
            <p className="text-slate-400 text-sm mb-2">#{invoice.invoice_number}</p>
            {invoice.description && (
              <p className="text-slate-300 text-sm mb-3 line-clamp-2">{invoice.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center text-slate-300 text-sm">
              <Building className="w-4 h-4 mr-2 text-slate-400" />
              {invoice.client?.business_name || invoice.client?.preferred_name || 'No client'}
            </div>
            <div className="flex items-center text-slate-300 text-sm">
              <User className="w-4 h-4 mr-2 text-slate-400" />
              {invoice.client?.preferred_name || invoice.client?.legal_first_name || 'Unknown'}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-slate-300 text-sm">
              <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
              {formatCurrency(invoice.total_amount)}
            </div>
            <div className="flex items-center text-slate-300 text-sm">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              Due: {formatDate(invoice.due_date)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center text-slate-400 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Created {formatDate(invoice.created_at)}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewInvoice(invoice)}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            {invoice.status === 'draft' && (
              <Button
                size="sm"
                onClick={() => handleSendInvoice(invoice)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
            )}
            {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'overdue') && (
              <Button
                size="sm"
                onClick={() => handleRecordPayment(invoice)}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                <CreditCard className="w-4 h-4 mr-1" />
                Record Payment
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditInvoice(invoice)}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDuplicateInvoice(invoice)}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteInvoice(invoice.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

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
              setSelectedInvoice({ template });
              setShowDetailsDialog(true);
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
    const totalInvoices = invoices.length;
    const totalValue = invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const paidValue = paidInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const overdueInvoices = invoices.filter(i => i.status === 'overdue' || getDaysOverdue(i.due_date, i.status) > 0);
    const overdueValue = overdueInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const pendingValue = totalValue - paidValue;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Invoices</p>
                <p className="text-white text-2xl font-bold">{totalInvoices}</p>
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
                <p className="text-slate-400 text-sm">Paid</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(paidValue)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Outstanding</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(pendingValue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingBar text="Loading invoice manager..." />
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Invoice Management</h1>
          <p className="text-slate-800 dark:text-slate-400 mt-2">Create, send, and track professional invoices</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateInvoice} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
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
            <CardTitle className="text-white">Invoice Management</CardTitle>
            <CardDescription className="text-slate-400">
              Manage your invoices and templates with professional tools for client billing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  type="search"
                  placeholder="Search invoices (number, client, title...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="viewed">Viewed</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
                <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="invoices" className="mt-6">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg mb-2">
                      {searchTerm || statusFilter !== 'all' ? "No invoices match your filters." : "No invoices yet"}
                    </p>
                    <p className="text-slate-500 mb-4">
                      {searchTerm || statusFilter !== 'all' ? "Try adjusting your search or filters." : "Create your first invoice to get started!"}
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                      <Button onClick={handleCreateInvoice} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Invoice
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredInvoices.map(invoice => (
                      <InvoiceCard key={invoice.id} invoice={invoice} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="templates" className="mt-6">
                {templates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg mb-2">No templates available</p>
                    <p className="text-slate-500 mb-4">Templates help you create invoices faster with pre-built structures.</p>
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
      <CreateInvoiceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        templates={templates}
        clients={clients}
        onInvoiceCreated={fetchData}
      />

      <InvoiceDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        invoice={selectedInvoice}
      />

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        invoice={selectedInvoice}
        onPaymentRecorded={fetchData}
      />
    </div>
  );
};

export default InvoiceManager;