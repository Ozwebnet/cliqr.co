import React, { useState, useCallback } from 'react';
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
import { Plus, Trash2, FileText, User, Calendar, DollarSign, Calculator } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabaseClient';

const CreateInvoiceDialog = ({ open, onOpenChange, templates, clients, onInvoiceCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    template_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    payment_terms: 'Net 30',
    tax_rate: 10.0,
    discount_amount: 0,
    notes: '',
    terms_and_conditions: '',
    payment_instructions: '',
    is_recurring: false,
    recurring_frequency: 'monthly'
  });
  const [invoiceItems, setInvoiceItems] = useState([
    { title: '', description: '', quantity: 1, unit_price: 0, total_price: 0, tax_rate: 10.0 }
  ]);

  const resetForm = useCallback(() => {
    setStep(1);
    setFormData({
      title: '',
      description: '',
      client_id: '',
      template_id: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      payment_terms: 'Net 30',
      tax_rate: 10.0,
      discount_amount: 0,
      notes: '',
      terms_and_conditions: '',
      payment_instructions: '',
      is_recurring: false,
      recurring_frequency: 'monthly'
    });
    setInvoiceItems([
      { title: '', description: '', quantity: 1, unit_price: 0, total_price: 0, tax_rate: 10.0 }
    ]);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate due date based on payment terms
    if (field === 'payment_terms' || field === 'issue_date') {
      const issueDate = field === 'issue_date' ? new Date(value) : new Date(formData.issue_date);
      const terms = field === 'payment_terms' ? value : formData.payment_terms;
      
      if (terms && issueDate) {
        let daysToAdd = 30; // Default
        if (terms.includes('15')) daysToAdd = 15;
        else if (terms.includes('30')) daysToAdd = 30;
        else if (terms.includes('60')) daysToAdd = 60;
        else if (terms.includes('90')) daysToAdd = 90;
        else if (terms.toLowerCase().includes('receipt')) daysToAdd = 0;
        
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + daysToAdd);
        setFormData(prev => ({ ...prev, due_date: dueDate.toISOString().split('T')[0] }));
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total price for this item
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : updatedItems[index].quantity;
      const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : updatedItems[index].unit_price;
      updatedItems[index].total_price = quantity * unitPrice;
    }
    
    setInvoiceItems(updatedItems);
  };

  const addItem = () => {
    setInvoiceItems([...invoiceItems, { title: '', description: '', quantity: 1, unit_price: 0, total_price: 0, tax_rate: formData.tax_rate }]);
  };

  const removeItem = (index) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const calculateTaxAmount = () => {
    return invoiceItems.reduce((sum, item) => {
      const itemTax = (item.total_price || 0) * ((item.tax_rate || 0) / 100);
      return sum + itemTax;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxAmount();
    const discount = formData.discount_amount || 0;
    return subtotal + taxAmount - discount;
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.client_id || !formData.due_date) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in the invoice title, select a client, and set a due date.',
        variant: 'destructive'
      });
      return;
    }

    if (invoiceItems.some(item => !item.title || item.unit_price <= 0)) {
      toast({
        title: 'Invalid Items',
        description: 'Please ensure all items have a title and valid price.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const invoiceNumber = generateInvoiceNumber();
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTaxAmount();
      const totalAmount = calculateTotal();

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          title: formData.title,
          description: formData.description,
          client_id: formData.client_id,
          template_id: formData.template_id || null,
          subtotal: subtotal,
          tax_rate: formData.tax_rate,
          tax_amount: taxAmount,
          discount_amount: formData.discount_amount,
          total_amount: totalAmount,
          issue_date: formData.issue_date,
          due_date: formData.due_date,
          payment_terms: formData.payment_terms,
          notes: formData.notes,
          terms_and_conditions: formData.terms_and_conditions,
          payment_instructions: formData.payment_instructions,
          is_recurring: formData.is_recurring,
          recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null,
          next_invoice_date: formData.is_recurring ? formData.due_date : null,
          created_by: user.id,
          team_id: user.team_id,
          status: 'draft'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsToInsert = invoiceItems.map((item, index) => ({
        invoice_id: invoice.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        tax_rate: item.tax_rate,
        sort_order: index
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: 'Success',
        description: `Invoice "${formData.title}" created successfully!`
      });

      onInvoiceCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create invoice: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === formData.template_id);
  const selectedClient = clients.find(c => c.id === formData.client_id);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!loading) { onOpenChange(isOpen); if (!isOpen) resetForm(); } }}>
      <DialogContent className="sm:max-w-4xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white overflow-y-auto max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Create New Invoice
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Invoice Items' : 'Review & Create'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">Invoice Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter invoice title"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client" className="text-slate-300">Client *</Label>
                  <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.business_name || client.preferred_name || client.legal_first_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the invoice"
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="template" className="text-slate-300">Template (Optional)</Label>
                  <Select value={formData.template_id} onValueChange={(value) => handleInputChange('template_id', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            <span>{template.name}</span>
                            {template.is_default && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">Default</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_terms" className="text-slate-300">Payment Terms</Label>
                  <Select value={formData.payment_terms} onValueChange={(value) => handleInputChange('payment_terms', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                      <SelectItem value="Net 90">Net 90</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="issue_date" className="text-slate-300">Issue Date *</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => handleInputChange('issue_date', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date" className="text-slate-300">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate" className="text-slate-300">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.tax_rate}
                    onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => handleInputChange('is_recurring', checked)}
                  />
                  <Label htmlFor="is_recurring" className="text-slate-300">Recurring Invoice</Label>
                </div>
                {formData.is_recurring && (
                  <div className="space-y-2">
                    <Label htmlFor="recurring_frequency" className="text-slate-300">Frequency</Label>
                    <Select value={formData.recurring_frequency} onValueChange={(value) => handleInputChange('recurring_frequency', value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Invoice Items</h3>
                <Button onClick={addItem} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {invoiceItems.map((item, index) => (
                  <Card key={index} className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-slate-300">Item {index + 1}</CardTitle>
                        {invoiceItems.length > 1 && (
                          <Button
                            onClick={() => removeItem(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Title *</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                            placeholder="Service or product name"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Brief description"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Quantity</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Unit Price (AUD)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Tax Rate (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={item.tax_rate}
                            onChange={(e) => handleItemChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Total</Label>
                          <div className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white">
                            ${item.total_price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Subtotal:</span>
                      <span className="text-white">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Tax:</span>
                      <span className="text-white">${calculateTaxAmount().toFixed(2)}</span>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Discount Amount (AUD)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discount_amount}
                        onChange={(e) => handleInputChange('discount_amount', parseFloat(e.target.value) || 0)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between text-lg font-semibold border-t border-slate-600 pt-2">
                      <span className="text-white">Total:</span>
                      <span className="text-green-400">${calculateTotal().toFixed(2)} AUD</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-300">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes for the client"
                    className="bg-slate-800 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_instructions" className="text-slate-300">Payment Instructions</Label>
                  <Textarea
                    id="payment_instructions"
                    value={formData.payment_instructions}
                    onChange={(e) => handleInputChange('payment_instructions', e.target.value)}
                    placeholder="How the client should pay this invoice"
                    className="bg-slate-800 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Review Your Invoice</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Invoice Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-slate-400">Title:</span>
                      <p className="text-white font-medium">{formData.title}</p>
                    </div>
                    {formData.description && (
                      <div>
                        <span className="text-slate-400">Description:</span>
                        <p className="text-white">{formData.description}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400">Issue Date:</span>
                      <p className="text-white">{new Date(formData.issue_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Due Date:</span>
                      <p className="text-white">{new Date(formData.due_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Payment Terms:</span>
                      <p className="text-white">{formData.payment_terms}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedClient && (
                      <>
                        <div>
                          <span className="text-slate-400">Business:</span>
                          <p className="text-white font-medium">
                            {selectedClient.business_name || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Contact:</span>
                          <p className="text-white">
                            {selectedClient.preferred_name || selectedClient.legal_first_name}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Email:</span>
                          <p className="text-white">{selectedClient.email}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Invoice Items ({invoiceItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoiceItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                        <div>
                          <p className="text-white font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-slate-400 text-sm">{item.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-white">{item.quantity} × ${item.unit_price}</p>
                          <p className="text-green-400 font-medium">${item.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="space-y-1 pt-3 border-t border-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Subtotal:</span>
                        <span className="text-white">${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Tax:</span>
                        <span className="text-white">${calculateTaxAmount().toFixed(2)}</span>
                      </div>
                      {formData.discount_amount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Discount:</span>
                          <span className="text-white">-${formData.discount_amount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                        <span className="text-white font-semibold text-lg">Total:</span>
                        <span className="text-green-400 font-bold text-xl">${calculateTotal().toFixed(2)} AUD</span>
                      </div>
                    </div>
                  </div>
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
                  {loading ? 'Creating...' : 'Create Invoice'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;