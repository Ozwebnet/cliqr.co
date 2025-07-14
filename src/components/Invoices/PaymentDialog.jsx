import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { CreditCard, DollarSign, Calendar, Receipt } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabaseClient';

const PaymentDialog = ({ open, onOpenChange, invoice, onPaymentRecorded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payment_amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    payment_reference: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      payment_amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      payment_reference: '',
      notes: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getOutstandingAmount = () => {
    if (!invoice) return 0;
    // This would normally fetch existing payments, but for now we'll use the total amount
    return invoice.total_amount || 0;
  };

  const handleSubmit = async () => {
    if (!formData.payment_amount || !formData.payment_date || !formData.payment_method) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in the payment amount, date, and method.',
        variant: 'destructive'
      });
      return;
    }

    const paymentAmount = parseFloat(formData.payment_amount);
    const outstandingAmount = getOutstandingAmount();

    if (paymentAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Payment amount must be greater than zero.',
        variant: 'destructive'
      });
      return;
    }

    if (paymentAmount > outstandingAmount) {
      toast({
        title: 'Amount Too High',
        description: `Payment amount cannot exceed the outstanding amount of ${formatCurrency(outstandingAmount)}.`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Record the payment
      const { error: paymentError } = await supabase
        .from('invoice_payments')
        .insert({
          invoice_id: invoice.id,
          payment_amount: paymentAmount,
          payment_date: formData.payment_date,
          payment_method: formData.payment_method,
          payment_reference: formData.payment_reference || null,
          notes: formData.notes || null,
          created_by: user.id,
          team_id: user.team_id
        });

      if (paymentError) throw paymentError;

      // Update invoice status if fully paid
      const newStatus = paymentAmount >= outstandingAmount ? 'paid' : 'viewed';
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'paid') {
        updateData.paid_at = new Date().toISOString();
        updateData.payment_method = formData.payment_method;
        updateData.payment_reference = formData.payment_reference || null;
      }

      const { error: invoiceError } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoice.id);

      if (invoiceError) throw invoiceError;

      toast({
        title: 'Success',
        description: `Payment of ${formatCurrency(paymentAmount)} recorded successfully!`
      });

      onPaymentRecorded();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to record payment: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  const outstandingAmount = getOutstandingAmount();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!loading) { onOpenChange(isOpen); if (!isOpen) resetForm(); } }}>
      <DialogContent className="sm:max-w-2xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-green-500" />
            Record Payment
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Record a payment for invoice #{invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          {/* Invoice Summary */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Invoice:</span>
                <span className="text-white font-medium">{invoice.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Client:</span>
                <span className="text-white">
                  {invoice.client?.business_name || invoice.client?.preferred_name || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Amount:</span>
                <span className="text-white font-semibold">{formatCurrency(invoice.total_amount)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                <span className="text-slate-400">Outstanding:</span>
                <span className="text-orange-400 font-bold text-lg">{formatCurrency(outstandingAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_amount" className="text-slate-300">Payment Amount (AUD) *</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  min="0"
                  max={outstandingAmount}
                  step="0.01"
                  value={formData.payment_amount}
                  onChange={(e) => handleInputChange('payment_amount', e.target.value)}
                  placeholder={`Max: ${formatCurrency(outstandingAmount)}`}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_date" className="text-slate-300">Payment Date *</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => handleInputChange('payment_date', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-slate-300">Payment Method *</Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_reference" className="text-slate-300">Payment Reference</Label>
                <Input
                  id="payment_reference"
                  value={formData.payment_reference}
                  onChange={(e) => handleInputChange('payment_reference', e.target.value)}
                  placeholder="Transaction ID, cheque number, etc."
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-300">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this payment"
                className="bg-slate-800 border-slate-600 text-white"
                rows={3}
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-slate-300">Quick Amount Selection</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleInputChange('payment_amount', outstandingAmount.toString())}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                Full Amount ({formatCurrency(outstandingAmount)})
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleInputChange('payment_amount', (outstandingAmount / 2).toFixed(2))}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                Half ({formatCurrency(outstandingAmount / 2)})
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleInputChange('payment_amount', (outstandingAmount / 4).toFixed(2))}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                Quarter ({formatCurrency(outstandingAmount / 4)})
              </Button>
            </div>
          </div>

          {/* Payment Preview */}
          {formData.payment_amount && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Payment Amount:</span>
                    <span className="text-green-400 font-semibold">{formatCurrency(parseFloat(formData.payment_amount) || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Remaining Balance:</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(outstandingAmount - (parseFloat(formData.payment_amount) || 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                    <span className="text-slate-300">Status After Payment:</span>
                    <span className={`font-semibold ${
                      (parseFloat(formData.payment_amount) || 0) >= outstandingAmount 
                        ? 'text-green-400' 
                        : 'text-yellow-400'
                    }`}>
                      {(parseFloat(formData.payment_amount) || 0) >= outstandingAmount ? 'Paid in Full' : 'Partially Paid'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="p-6 pt-0">
          <div className="flex items-center justify-end space-x-2 w-full">
            <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }} disabled={loading} className="text-slate-300 border-slate-600 hover:bg-slate-700">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !formData.payment_amount || !formData.payment_date || !formData.payment_method} 
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;