import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, FileText, User, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabaseClient';

const CreateProposalDialog = ({ open, onOpenChange, templates, clients, onProposalCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    template_id: '',
    valid_until: '',
    terms_and_conditions: '',
    payment_terms: '',
    delivery_timeline: '',
    internal_notes: ''
  });
  const [proposalItems, setProposalItems] = useState([
    { title: '', description: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);

  const resetForm = useCallback(() => {
    setStep(1);
    setFormData({
      title: '',
      description: '',
      client_id: '',
      template_id: '',
      valid_until: '',
      terms_and_conditions: '',
      payment_terms: '',
      delivery_timeline: '',
      internal_notes: ''
    });
    setProposalItems([
      { title: '', description: '', quantity: 1, unit_price: 0, total_price: 0 }
    ]);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...proposalItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total price for this item
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : updatedItems[index].quantity;
      const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : updatedItems[index].unit_price;
      updatedItems[index].total_price = quantity * unitPrice;
    }
    
    setProposalItems(updatedItems);
  };

  const addItem = () => {
    setProposalItems([...proposalItems, { title: '', description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index) => {
    if (proposalItems.length > 1) {
      setProposalItems(proposalItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return proposalItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const generateProposalNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PROP-${year}${month}-${random}`;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.client_id) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in the proposal title and select a client.',
        variant: 'destructive'
      });
      return;
    }

    if (proposalItems.some(item => !item.title || item.unit_price <= 0)) {
      toast({
        title: 'Invalid Items',
        description: 'Please ensure all items have a title and valid price.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const proposalNumber = generateProposalNumber();
      const totalAmount = calculateTotal();

      // Create proposal
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          title: formData.title,
          description: formData.description,
          client_id: formData.client_id,
          template_id: formData.template_id || null,
          proposal_number: proposalNumber,
          total_amount: totalAmount,
          valid_until: formData.valid_until || null,
          terms_and_conditions: formData.terms_and_conditions,
          payment_terms: formData.payment_terms,
          delivery_timeline: formData.delivery_timeline,
          internal_notes: formData.internal_notes,
          created_by: user.id,
          team_id: user.team_id,
          status: 'draft'
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Create proposal items
      const itemsToInsert = proposalItems.map((item, index) => ({
        proposal_id: proposal.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        sort_order: index
      }));

      const { error: itemsError } = await supabase
        .from('proposal_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: 'Success',
        description: `Proposal "${formData.title}" created successfully!`
      });

      onProposalCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create proposal: ${error.message}`,
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
            Create New Proposal
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Proposal Items' : 'Review & Create'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">Proposal Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter proposal title"
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
                  placeholder="Brief description of the proposal"
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
                  <Label htmlFor="valid_until" className="text-slate-300">Valid Until</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => handleInputChange('valid_until', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="payment_terms" className="text-slate-300">Payment Terms</Label>
                  <Textarea
                    id="payment_terms"
                    value={formData.payment_terms}
                    onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                    placeholder="e.g., 50% upfront, 50% on completion"
                    className="bg-slate-800 border-slate-600 text-white"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_timeline" className="text-slate-300">Delivery Timeline</Label>
                  <Textarea
                    id="delivery_timeline"
                    value={formData.delivery_timeline}
                    onChange={(e) => handleInputChange('delivery_timeline', e.target.value)}
                    placeholder="e.g., 6-8 weeks from contract signing"
                    className="bg-slate-800 border-slate-600 text-white"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internal_notes" className="text-slate-300">Internal Notes</Label>
                  <Textarea
                    id="internal_notes"
                    value={formData.internal_notes}
                    onChange={(e) => handleInputChange('internal_notes', e.target.value)}
                    placeholder="Notes for internal use only"
                    className="bg-slate-800 border-slate-600 text-white"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Proposal Items</h3>
                <Button onClick={addItem} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {proposalItems.map((item, index) => (
                  <Card key={index} className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-slate-300">Item {index + 1}</CardTitle>
                        {proposalItems.length > 1 && (
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
                      <div className="grid grid-cols-3 gap-4">
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

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span className="text-white">Total Amount:</span>
                  <span className="text-green-400">${calculateTotal().toFixed(2)} AUD</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Review Your Proposal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Proposal Details
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
                    {formData.valid_until && (
                      <div>
                        <span className="text-slate-400">Valid Until:</span>
                        <p className="text-white">{new Date(formData.valid_until).toLocaleDateString()}</p>
                      </div>
                    )}
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
                    Proposal Items ({proposalItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {proposalItems.map((item, index) => (
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
                    <div className="flex items-center justify-between pt-3 border-t border-slate-600">
                      <span className="text-white font-semibold text-lg">Total:</span>
                      <span className="text-green-400 font-bold text-xl">${calculateTotal().toFixed(2)} AUD</span>
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
                  {loading ? 'Creating...' : 'Create Proposal'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProposalDialog;