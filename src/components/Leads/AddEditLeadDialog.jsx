import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Save, X, Plus, Trash2, HelpCircle } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import FormSection from './AddEditLeadDialog/FormSection';
import { InterestEditor, InterestCardDisplay } from './AddEditLeadDialog/InterestComponents';
import { ContactLogEditor, ContactLogItem } from './AddEditLeadDialog/ContactLogComponents';

const APPROACH_OPTIONS = ['Outbound', 'Inbound'];
const SOURCE_OPTIONS = ['In-Person', 'Phone', 'Email', 'Social Media', 'Referral', 'Other'];
const INDUSTRY_OPTIONS = ['Automotive', 'Real Estate', 'Food & Beverage', 'Salon', 'Other'];
const ROLE_OPTIONS = ['Owner', 'Manager', 'Marketing Manager', 'Other'];
const STAGE_OPTIONS = {
  'new': { label: 'New Lead', description: 'A lead that has just been added to the system and hasn\'t been contacted yet.' },
  'contacted': { label: 'Contacted', description: 'Initial outreach has been made, but no meaningful discussion yet.' },
  'discovery': { label: 'Discovery', description: 'You\'re currently gathering information about the lead\'s needs and goals.' },
  'qualified': { label: 'Qualified', description: 'The lead fits your ideal customer profile and is likely to buy.' },
  'proposal': { label: 'Proposal Sent', description: 'You\'ve sent a formal proposal outlining the offer and pricing.' },
  'negotiation': { label: 'Negotiation', description: 'The lead is reviewing or discussing terms before making a decision.' },
  'won': { label: 'Won', description: 'The deal is successfully closed — the lead has converted to a customer.' },
  'lost': { label: 'Lost', description: 'The lead did not convert. No further engagement is planned.' },
};

const AddEditLeadDialog = ({ isOpen, onClose, lead, onLeadSaved, teamId, userId, onDeleteLead }) => {
  const initialFormData = {
    company_name: '', contact_name: '', personal_notes: '', approach: '',
    source: '', other_source: '', industry: '', other_industry: '', role: '', other_role: '',
    interests_one_off: [], interests_retainers: [], contact_history: [],
    stage: 'new', notes: '', next_contact_date: '', next_contact_time: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [editingInterest, setEditingInterest] = useState(null);
  const [deletingInterest, setDeletingInterest] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null);
  const [showNewLogEditor, setShowNewLogEditor] = useState(false);

  useEffect(() => {
    if (lead) {
      let history = lead.contact_history || [];
      if (Array.isArray(history) && history.length > 0 && (history[0].type === 'last' || history[0].type === 'next')) {
        history = [];
      }

      let next_contact_date = '';
      let next_contact_time = '';
      if (lead.next_contact_date) {
        const d = new Date(lead.next_contact_date);
        if (!isNaN(d)) {
          next_contact_date = format(d, 'yyyy-MM-dd');
          if (d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0) {
            next_contact_time = format(d, 'HH:mm');
          }
        }
      }

      setFormData({
        company_name: lead.company_name || '', contact_name: lead.contact_name || '', personal_notes: lead.personal_notes || '',
        approach: lead.approach || '', source: SOURCE_OPTIONS.includes(lead.source) ? lead.source : 'Other', other_source: SOURCE_OPTIONS.includes(lead.source) ? '' : lead.source,
        industry: INDUSTRY_OPTIONS.includes(lead.industry) ? lead.industry : 'Other', other_industry: INDUSTRY_OPTIONS.includes(lead.industry) ? '' : lead.industry,
        role: ROLE_OPTIONS.includes(lead.role) ? lead.role : 'Other', other_role: ROLE_OPTIONS.includes(lead.role) ? '' : lead.role,
        interests_one_off: lead.interests_one_off || [], interests_retainers: lead.interests_retainers || [],
        contact_history: history, stage: lead.stage || 'new', notes: lead.notes || '',
        next_contact_date, next_contact_time,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [lead, isOpen]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleClearNextContact = () => {
    setFormData(prev => ({ ...prev, next_contact_date: '', next_contact_time: '' }));
  };

  const handleSaveInterest = (interestData) => {
    const { type, index } = editingInterest;
    const key = type === 'one-off' ? 'interests_one_off' : 'interests_retainers';
    const interests = [...formData[key]];
    if (index === null) interests.push(interestData); else interests[index] = interestData;
    setFormData(prev => ({ ...prev, [key]: interests }));
    setEditingInterest(null);
  };

  const confirmDeleteInterest = () => {
    if (!deletingInterest) return;
    const { type, index } = deletingInterest;
    const key = type === 'one-off' ? 'interests_one_off' : 'interests_retainers';
    const interests = formData[key].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [key]: interests }));
    setDeletingInterest(null);
  };
  
  const handleSaveContactLog = (logData) => {
    const logs = [...formData.contact_history];
    if (editingLog.index === null) {
        logs.push({ ...logData, id: Date.now() });
    } else {
        logs[editingLog.index] = logData;
    }
    setFormData(prev => ({ ...prev, contact_history: logs }));
    setEditingLog(null);
    setShowNewLogEditor(false);
  };
  
  const confirmDeleteLog = () => {
      if (deletingLog === null) return;
      const logs = formData.contact_history.filter((_, i) => i !== deletingLog);
      setFormData(prev => ({ ...prev, contact_history: logs }));
      setDeletingLog(null);
  };

  const handleDelete = () => {
    if (lead && onDeleteLead) {
      onDeleteLead(lead.id);
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalContactDate = null;
    if (formData.next_contact_date) {
      const datePart = formData.next_contact_date;
      const timePart = formData.next_contact_time || '00:00';
      finalContactDate = new Date(`${datePart}T${timePart}:00`).toISOString();
    }

    const dataToSave = {
      ...formData,
      next_contact_date: finalContactDate,
      source: formData.source === 'Other' ? formData.other_source : formData.source,
      industry: formData.industry === 'Other' ? formData.other_industry : formData.industry,
      role: formData.role === 'Other' ? formData.other_role : formData.role,
      team_id: teamId, updated_at: new Date().toISOString(),
    };
    delete dataToSave.other_source;
    delete dataToSave.other_industry;
    delete dataToSave.other_role;
    delete dataToSave.next_contact_time;

    try {
      let error;
      if (lead) {
        const { error: updateError } = await supabase.from('leads').update(dataToSave).eq('id', lead.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('leads').insert([{ ...dataToSave, created_by: userId }]);
        error = insertError;
      }
      if (error) throw error;
      toast({ title: 'Success', description: `Lead ${lead ? 'updated' : 'added'} successfully.` });
      onLeadSaved();
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: `Failed to save lead: ${error.message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500";
  const labelClass = "text-slate-300";
  const sortedHistory = formData.contact_history.map((log, index) => ({ ...log, originalIndex: index })).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-4xl max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl">{lead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
            <DialogDescription className="text-slate-400">Fill in the information for a new lead.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-2">
            <form id="lead-form" onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div><Label className={labelClass}>Approach</Label><Select name="approach" value={formData.approach} onValueChange={(v) => handleSelectChange('approach', v)}><SelectTrigger className={inputClass}><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-slate-700 text-white">{APPROACH_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className={labelClass}>Source</Label><Select name="source" value={formData.source} onValueChange={(v) => handleSelectChange('source', v)}><SelectTrigger className={inputClass}><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-slate-700 text-white">{SOURCE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>{formData.source === 'Other' && <Input name="other_source" value={formData.other_source} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Please specify" />}</div>
                <div><Label className={labelClass}>Company Name</Label><Input name="company_name" value={formData.company_name} onChange={handleChange} className={inputClass} /></div>
                <div><Label className={labelClass}>Industry</Label><Select name="industry" value={formData.industry} onValueChange={(v) => handleSelectChange('industry', v)}><SelectTrigger className={inputClass}><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-slate-700 text-white">{INDUSTRY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>{formData.industry === 'Other' && <Input name="other_industry" value={formData.other_industry} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Please specify" />}</div>
                <div><Label className={labelClass}>Person Name</Label><Input name="contact_name" value={formData.contact_name} onChange={handleChange} className={inputClass} /></div>
                <div><Label className={labelClass}>Role</Label><Select name="role" value={formData.role} onValueChange={(v) => handleSelectChange('role', v)}><SelectTrigger className={inputClass}><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent className="bg-slate-700 text-white">{ROLE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>{formData.role === 'Other' && <Input name="other_role" value={formData.other_role} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Please specify" />}</div>
              </div>
              <div><Label className={labelClass}>Personal Notes</Label><Textarea name="personal_notes" value={formData.personal_notes} onChange={handleChange} className={inputClass} /></div>

              <FormSection title="Interests">{['one-off', 'retainers'].map(type => (<div key={type} className="mb-6"><div className="flex justify-between items-center mb-3"><h4 className="text-lg font-medium text-slate-200">{type === 'one-off' ? 'One-off Services' : 'Ongoing Retainers'}</h4><Button type="button" size="sm" variant="outline" onClick={() => setEditingInterest({ type, index: null, data: { service: '', scope: '', benefits: '', price: 0 } })}><Plus className="w-4 h-4 mr-2" /> Add</Button></div><div className="space-y-3">{formData[type === 'one-off' ? 'interests_one_off' : 'interests_retainers'].map((interest, index) => (<InterestCardDisplay key={index} interest={interest} onEdit={() => setEditingInterest({ type, index, data: interest })} onDelete={() => setDeletingInterest({ type, index })} />))}<AnimatePresence>{editingInterest?.type === type && editingInterest?.index === null && (<InterestEditor interest={editingInterest.data} onSave={handleSaveInterest} onCancel={() => setEditingInterest(null)} />)}</AnimatePresence></div></div>))}</FormSection>

              <FormSection title="Contact Log">
                <div className="flex justify-end mb-4"><Button type="button" size="sm" variant="outline" onClick={() => setShowNewLogEditor(true)}><Plus className="w-4 h-4 mr-2" /> Log a Contact</Button></div>
                <AnimatePresence>
                  {showNewLogEditor && (
                    <ContactLogEditor 
                      log={{ date: new Date().toISOString().split('T')[0], type: 'Call', summary: '', notes: '' }}
                      onSave={(logData) => {
                          const logs = [...formData.contact_history, { ...logData, id: Date.now() }];
                          setFormData(prev => ({ ...prev, contact_history: logs}));
                          setShowNewLogEditor(false);
                      }}
                      onCancel={() => setShowNewLogEditor(false)}
                    />
                  )}
                </AnimatePresence>
                {sortedHistory.length > 0 ? (
                    sortedHistory.map((log) => (
                        <ContactLogItem key={log.id || log.originalIndex} log={log} onEdit={() => setEditingLog({ index: log.originalIndex, data: log })} onDelete={() => setDeletingLog(log.originalIndex)} />
                    ))
                ) : (
                    <p className="text-slate-400 text-center py-4">No contact history logged yet.</p>
                )}
              </FormSection>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label className={labelClass}>Current Stage</Label>
                  <Select name="stage" value={formData.stage} onValueChange={(v) => handleSelectChange('stage', v)}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent className="bg-slate-700 text-white">
                      <TooltipProvider>
                        {Object.entries(STAGE_OPTIONS).map(([value, { label, description }]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{label}</span>
                              <Tooltip>
                                <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <HelpCircle className="w-4 h-4 text-slate-400 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <p>{description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </SelectItem>
                        ))}
                      </TooltipProvider>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className={labelClass}>Next Contact</Label>
                    {(formData.next_contact_date || formData.next_contact_time) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearNextContact}
                        className="text-slate-400 hover:text-white hover:bg-slate-700 h-6 px-2 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input type="date" name="next_contact_date" value={formData.next_contact_date} onChange={handleChange} className={inputClass} />
                    <Input type="time" name="next_contact_time" value={formData.next_contact_time} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </div>
              <div><Label className={labelClass}>General Notes</Label><Textarea name="notes" value={formData.notes} onChange={handleChange} className={inputClass} /></div>
            </form>
          </div>
          <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t border-slate-700 flex justify-between items-center w-full">
            <div>
              {lead && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Lead
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" onClick={onClose}><X className="w-4 h-4 mr-2" /> Cancel</Button>
              <Button type="submit" form="lead-form" disabled={loading} className="bg-gradient-to-r from-blue-500 to-purple-600"><Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Lead'}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {editingInterest && editingInterest.index !== null && (<Dialog open={true} onOpenChange={() => setEditingInterest(null)}><DialogContent className="bg-slate-900 border-slate-700 text-white"><DialogHeader><DialogTitle>Edit {editingInterest.type === 'one-off' ? 'Service' : 'Retainer'}</DialogTitle></DialogHeader><InterestEditor interest={editingInterest.data} onSave={handleSaveInterest} onCancel={() => setEditingInterest(null)} /></DialogContent></Dialog>)}
        {editingLog && (<Dialog open={true} onOpenChange={() => setEditingLog(null)}><DialogContent className="bg-slate-900 border-slate-700 text-white"><DialogHeader><DialogTitle>Edit Contact Log</DialogTitle></DialogHeader><ContactLogEditor log={editingLog.data} onSave={handleSaveContactLog} onCancel={() => setEditingLog(null)} /></DialogContent></Dialog>)}
      </AnimatePresence>
      
      {deletingInterest && (<ConfirmDeleteDialog isOpen={!!deletingInterest} onClose={() => setDeletingInterest(null)} onConfirm={confirmDeleteInterest} title="Delete Interest" description="Are you sure you want to delete this item? This action cannot be undone." />)}
      {deletingLog !== null && (<ConfirmDeleteDialog isOpen={deletingLog !== null} onClose={() => setDeletingLog(null)} onConfirm={confirmDeleteLog} title="Delete Contact Log" description="Are you sure you want to delete this log entry? This action cannot be undone." />)}
    </>
  );
};

export default AddEditLeadDialog;