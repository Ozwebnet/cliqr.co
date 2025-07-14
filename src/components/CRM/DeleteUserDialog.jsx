import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Trash, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const DeleteUserDialog = ({ userToDelete, onConfirmDelete, dialogType = 'softDelete' }) => {
  const [open, setOpen] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!userToDelete) return null;

  const isPermanentDelete = dialogType === 'permanentDelete';
  const title = isPermanentDelete ? 'Permanently Delete Account' : 'Delete Account';
  const description = isPermanentDelete 
    ? `Are you sure you want to permanently delete ${userToDelete.name}'s account? This action cannot be undone.`
    : `Are you sure you want to delete ${userToDelete.name}'s account? The account will be moved to the Recycling Bin and permanently deleted after 30 days.`;
  const buttonText = isPermanentDelete ? 'Permanently Delete' : 'Delete Account';
  const buttonClass = isPermanentDelete ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700';


  const handleConfirm = async () => {
    if (confirmationEmail !== userToDelete.email) {
      toast({ title: 'Error', description: 'Email confirmation does not match.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    await onConfirmDelete(userToDelete.id);
    setIsSubmitting(false);
    setOpen(false);
    setConfirmationEmail('');
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    toast({ title: 'Pasting Disabled', description: 'Please type the email address manually for confirmation.', variant: 'destructive'});
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isSubmitting) setOpen(isOpen); }}>
      <DialogTrigger asChild>
        {isPermanentDelete ? (
          <Button variant="ghost" size="icon">
            <Trash className="h-4 w-4 text-red-500 hover:text-red-400" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-300 pt-2">
            {description}
            <br />
            To confirm, please type the user's email address: <strong className="text-slate-100">{userToDelete.email}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={`confirmation-email-delete-${userToDelete.id}`} className="text-slate-300">Confirm Email</Label>
            <Input 
              id={`confirmation-email-delete-${userToDelete.id}`} 
              value={confirmationEmail} 
              onChange={(e) => setConfirmationEmail(e.target.value)} 
              onPaste={handlePaste}
              className="bg-slate-800 border-slate-600" 
              placeholder="Type email to confirm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {if(!isSubmitting)setOpen(false)}}>Cancel</Button>
          <Button 
            type="submit" 
            onClick={handleConfirm} 
            disabled={isSubmitting || confirmationEmail !== userToDelete.email}
            className={buttonClass}
          >
            {isSubmitting ? (isPermanentDelete ? 'Deleting...' : 'Moving to Bin...') : buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;