import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Check, Phone, Mail, Users, MessageSquare, CheckCircle } from 'lucide-react';

const CONTACT_LOG_TYPES = ['Call', 'Email', 'Meeting', 'Message', 'Other'];

export const ContactLogEditor = ({ log, onSave, onCancel }) => {
    const [data, setData] = useState(log);
    const handleChange = (field, value) => setData(prev => ({ ...prev, [field]: value }));

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800 p-4 rounded-lg border border-purple-500 overflow-hidden mb-4"
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-slate-300">Date</Label><Input type="date" value={data.date} onChange={(e) => handleChange('date', e.target.value)} className="bg-slate-700 border-slate-600" /></div>
                    <div><Label className="text-slate-300">Type</Label><Select value={data.type} onValueChange={(v) => handleChange('type', v)}><SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue placeholder="Select type..." /></SelectTrigger><SelectContent className="bg-slate-700 text-white">{CONTACT_LOG_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div><Label className="text-slate-300">Summary</Label><Input value={data.summary} onChange={(e) => handleChange('summary', e.target.value)} className="bg-slate-700 border-slate-600" /></div>
                <div><Label className="text-slate-300">Notes</Label><Textarea value={data.notes} onChange={(e) => handleChange('notes', e.target.value)} className="bg-slate-700 border-slate-600" /></div>
                <div className="flex justify-end space-x-2">
                    <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
                    <Button type="button" onClick={() => onSave(data)} className="bg-green-600 hover:bg-green-700"><Check className="w-4 h-4 mr-2" /> Save Log</Button>
                </div>
            </div>
        </motion.div>
    );
};

export const ContactLogItem = ({ log, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const ICONS = {
        Call: <Phone className="w-4 h-4 text-blue-400" />,
        Email: <Mail className="w-4 h-4 text-yellow-400" />,
        Meeting: <Users className="w-4 h-4 text-green-400" />,
        Message: <MessageSquare className="w-4 h-4 text-purple-400" />,
        Other: <CheckCircle className="w-4 h-4 text-slate-400" />,
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700 w-full mb-3">
            <CardContent className="p-4">
                <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center space-x-3">
                        {ICONS[log.type] || ICONS['Other']}
                        <div>
                            <p className="font-bold text-white">{log.summary}</p>
                            <p className="text-sm text-slate-400">{new Date(log.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })} - {log.type}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button type="button" size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button type="button" size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="h-8 w-8 text-red-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </div>
                <AnimatePresence>
                    {isExpanded && log.notes && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                            <div className="border-t border-slate-700 pt-3">
                                <p className="text-slate-300 whitespace-pre-wrap">{log.notes}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};