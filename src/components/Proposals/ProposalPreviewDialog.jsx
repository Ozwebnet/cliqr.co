import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  Send, 
  Edit, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import LoadingBar from '@/components/ui/LoadingBar';

const ProposalPreviewDialog = ({ open, onOpenChange, proposal }) => {
  const [proposalItems, setProposalItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && proposal?.id) {
      fetchProposalItems();
    }
  }, [open, proposal?.id]);

  const fetchProposalItems = async () => {
    if (!proposal?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposal_items')
        .select('*')
        .eq('proposal_id', proposal.id)
        .order('sort_order');

      if (error) throw error;
      setProposalItems(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch proposal items: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDownload = () => {
    toast({
      title: '🚧 Download Not Implemented',
      description: "PDF download isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleSend = () => {
    toast({
      title: '🚧 Send Proposal Not Implemented',
      description: "Proposal sending isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleEdit = () => {
    toast({
      title: '🚧 Edit Proposal Not Implemented',
      description: "Proposal editing isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  if (!proposal) return null;

  // Handle template preview
  if (proposal.template) {
    const template = proposal.template;
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Template Preview: {template.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <Badge className="bg-slate-700 text-slate-300" variant="secondary">
                {template.category?.replace('_', ' ') || 'General'}
              </Badge>
              {template.is_default && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                  Default Template
                </Badge>
              )}
            </div>

            {template.description && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <p className="text-slate-300">{template.description}</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Template Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.template_content?.sections?.map((section, index) => (
                  <div key={section.id || index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="text-white font-semibold mb-2">{section.title}</h4>
                    <p className="text-slate-400 text-sm mb-2">{section.content}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {section.type || 'text'}
                      </Badge>
                      {section.required && (
                        <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {proposal.title}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(proposal.status)} variant="outline">
                <div className="flex items-center space-x-1">
                  {getStatusIcon(proposal.status)}
                  <span className="capitalize">{proposal.status}</span>
                </div>
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-slate-400 text-sm">
            <span>#{proposal.proposal_number}</span>
            <span>•</span>
            <span>Created {formatDate(proposal.created_at)}</span>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" onClick={handleDownload} className="text-slate-300 border-slate-600 hover:bg-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            {proposal.status === 'draft' && (
              <Button onClick={handleSend} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Send className="w-4 h-4 mr-2" />
                Send to Client
              </Button>
            )}
            <Button variant="outline" onClick={handleEdit} className="text-slate-300 border-slate-600 hover:bg-slate-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Proposal Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-slate-400">Business:</span>
                  <p className="text-white font-medium">
                    {proposal.client?.business_name || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Contact:</span>
                  <p className="text-white">
                    {proposal.client?.preferred_name || proposal.client?.legal_first_name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="text-white">{proposal.client?.email || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Proposal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-slate-400">Total Amount:</span>
                  <p className="text-green-400 font-bold text-xl">{formatCurrency(proposal.total_amount)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Valid Until:</span>
                  <p className="text-white">{formatDate(proposal.valid_until)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Created By:</span>
                  <p className="text-white">
                    {proposal.created_by_user?.preferred_name || proposal.created_by_user?.legal_first_name || 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {proposal.description && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{proposal.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Proposal Items */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Proposal Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingBar text="Loading proposal items..." />
              ) : proposalItems.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No items found for this proposal.</p>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left text-slate-400 pb-2">Item</th>
                          <th className="text-right text-slate-400 pb-2">Qty</th>
                          <th className="text-right text-slate-400 pb-2">Unit Price</th>
                          <th className="text-right text-slate-400 pb-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposalItems.map((item, index) => (
                          <tr key={item.id || index} className="border-b border-slate-700 last:border-b-0">
                            <td className="py-3">
                              <div>
                                <p className="text-white font-medium">{item.title}</p>
                                {item.description && (
                                  <p className="text-slate-400 text-sm">{item.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="text-right text-white py-3">{item.quantity}</td>
                            <td className="text-right text-white py-3">{formatCurrency(item.unit_price)}</td>
                            <td className="text-right text-green-400 font-medium py-3">
                              {formatCurrency(item.total_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-600">
                          <td colSpan="3" className="text-right text-white font-semibold py-3">
                            Total:
                          </td>
                          <td className="text-right text-green-400 font-bold text-xl py-3">
                            {formatCurrency(proposal.total_amount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {proposal.payment_terms && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Payment Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm">{proposal.payment_terms}</p>
                </CardContent>
              </Card>
            )}
            
            {proposal.delivery_timeline && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Delivery Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm">{proposal.delivery_timeline}</p>
                </CardContent>
              </Card>
            )}
            
            {proposal.terms_and_conditions && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm">{proposal.terms_and_conditions}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Internal Notes */}
          {proposal.internal_notes && (
            <Card className="bg-slate-800 border-slate-700 border-dashed">
              <CardHeader>
                <CardTitle className="text-yellow-400 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Internal Notes (Not visible to client)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm">{proposal.internal_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Proposal Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span className="text-white">{formatDate(proposal.created_at)}</span>
                </div>
                {proposal.sent_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sent:</span>
                    <span className="text-white">{formatDate(proposal.sent_at)}</span>
                  </div>
                )}
                {proposal.viewed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Viewed:</span>
                    <span className="text-white">{formatDate(proposal.viewed_at)}</span>
                  </div>
                )}
                {proposal.responded_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Responded:</span>
                    <span className="text-white">{formatDate(proposal.responded_at)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalPreviewDialog;