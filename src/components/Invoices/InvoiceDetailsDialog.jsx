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
  AlertTriangle,
  CreditCard,
  Receipt,
  Eye,
  Repeat,
  Calculator
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import LoadingBar from '@/components/ui/LoadingBar';

const InvoiceDetailsDialog = ({ open, onOpenChange, invoice }) => {
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && invoice?.id) {
      fetchInvoiceDetails();
    }
  }, [open, invoice?.id]);

  const fetchInvoiceDetails = async () => {
    if (!invoice?.id) return;
    
    setLoading(true);
    try {
      // Fetch invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('sort_order');

      if (itemsError) throw itemsError;

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      setInvoiceItems(itemsData || []);
      setPayments(paymentsData || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch invoice details: ${error.message}`,
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
      month: 'long',
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

  const getTotalPaid = () => {
    return payments.reduce((sum, payment) => sum + (payment.payment_amount || 0), 0);
  };

  const getOutstandingAmount = () => {
    return (invoice?.total_amount || 0) - getTotalPaid();
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
      title: '🚧 Send Invoice Not Implemented',
      description: "Invoice sending isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleEdit = () => {
    toast({
      title: '🚧 Edit Invoice Not Implemented',
      description: "Invoice editing isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  if (!invoice) return null;

  // Handle template preview
  if (invoice.template) {
    const template = invoice.template;
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

  const daysOverdue = getDaysOverdue(invoice.due_date, invoice.status);
  const isOverdue = daysOverdue > 0 && invoice.status !== 'paid';
  const totalPaid = getTotalPaid();
  const outstandingAmount = getOutstandingAmount();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {invoice.title}
            </DialogTitle>
            <div className="flex items-center space-x-2">
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
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {daysOverdue} days overdue
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 text-slate-400 text-sm">
            <span>#{invoice.invoice_number}</span>
            <span>•</span>
            <span>Created {formatDate(invoice.created_at)}</span>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" onClick={handleDownload} className="text-slate-300 border-slate-600 hover:bg-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            {invoice.status === 'draft' && (
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

          {/* Invoice Header */}
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
                    {invoice.client?.business_name || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Contact:</span>
                  <p className="text-white">
                    {invoice.client?.preferred_name || invoice.client?.legal_first_name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="text-white">{invoice.client?.email || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-slate-400">Issue Date:</span>
                  <p className="text-white">{formatDate(invoice.issue_date)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Due Date:</span>
                  <p className={`${isOverdue ? 'text-red-400' : 'text-white'}`}>
                    {formatDate(invoice.due_date)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Payment Terms:</span>
                  <p className="text-white">{invoice.payment_terms}</p>
                </div>
                <div>
                  <span className="text-slate-400">Created By:</span>
                  <p className="text-white">
                    {invoice.created_by_user?.preferred_name || invoice.created_by_user?.legal_first_name || 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {invoice.description && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{invoice.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Invoice Items */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Invoice Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingBar text="Loading invoice items..." />
              ) : invoiceItems.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No items found for this invoice.</p>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left text-slate-400 pb-2">Item</th>
                          <th className="text-right text-slate-400 pb-2">Qty</th>
                          <th className="text-right text-slate-400 pb-2">Unit Price</th>
                          <th className="text-right text-slate-400 pb-2">Tax Rate</th>
                          <th className="text-right text-slate-400 pb-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceItems.map((item, index) => (
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
                            <td className="text-right text-white py-3">{item.tax_rate}%</td>
                            <td className="text-right text-green-400 font-medium py-3">
                              {formatCurrency(item.total_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Subtotal:</span>
                      <span className="text-white">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Tax:</span>
                      <span className="text-white">{formatCurrency(invoice.tax_amount)}</span>
                    </div>
                    {invoice.discount_amount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Discount:</span>
                        <span className="text-white">-{formatCurrency(invoice.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                      <span className="text-white font-semibold text-lg">Total:</span>
                      <span className="text-green-400 font-bold text-xl">
                        {formatCurrency(invoice.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Amount:</span>
                  <span className="text-white font-semibold">{formatCurrency(invoice.total_amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                  <span className="text-slate-400">Outstanding:</span>
                  <span className={`font-semibold ${outstandingAmount > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                    {formatCurrency(outstandingAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-slate-400 text-sm">No payments recorded yet</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((payment, index) => (
                      <div key={payment.id || index} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                        <div>
                          <p className="text-white text-sm">{formatDate(payment.payment_date)}</p>
                          <p className="text-slate-400 text-xs">{payment.payment_method}</p>
                        </div>
                        <span className="text-green-400 font-medium">{formatCurrency(payment.payment_amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invoice.notes && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}
            
            {invoice.payment_instructions && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Payment Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{invoice.payment_instructions}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Terms and Conditions */}
          {invoice.terms_and_conditions && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{invoice.terms_and_conditions}</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Invoice Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span className="text-white">{formatDate(invoice.created_at)}</span>
                </div>
                {invoice.sent_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sent:</span>
                    <span className="text-white">{formatDate(invoice.sent_at)}</span>
                  </div>
                )}
                {invoice.viewed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Viewed:</span>
                    <span className="text-white">{formatDate(invoice.viewed_at)}</span>
                  </div>
                )}
                {invoice.paid_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Paid:</span>
                    <span className="text-white">{formatDate(invoice.paid_at)}</span>
                  </div>
                )}
                {invoice.is_recurring && invoice.next_invoice_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Next Invoice:</span>
                    <span className="text-white">{formatDate(invoice.next_invoice_date)}</span>
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

export default InvoiceDetailsDialog;