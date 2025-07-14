import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MailWarning, Edit, UserCircle, CalendarDays, Briefcase, ShieldCheck, Trash2, RotateCcw, Phone, Building, Landmark, Clock } from 'lucide-react';
import EditUserDialog from '@/components/CRM/EditUserDialog';
import DeleteUserDialog from '@/components/CRM/DeleteUserDialog';
import { useAuth } from '@/hooks/useAuth.jsx';

const UserDetailsDialog = ({
  userToView,
  authData,
  isOpen,
  setIsOpen,
  onUserUpdated,
  onSoftDelete,
  onPermanentDelete,
  onRestoreUser,
  isRecyclingBin = false,
  initialLoadComplete
}) => {
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const { user: currentAuthUser } = useAuth();

  if (!userToView) return null;

  const isEmailVerified = authData?.fetched && !!authData?.email_confirmed_at;
  const showPendingVerification = initialLoadComplete && authData?.fetched && !authData?.email_confirmed_at;
  const lastSignInAt = authData?.last_sign_in_at;

  const canEdit = currentAuthUser?.role === 'full_admin' ||
                  (currentAuthUser?.role === 'admin' && userToView.role === 'client');

  const canManageDeletion = currentAuthUser?.role === 'full_admin' && currentAuthUser?.id !== userToView.id;

  const openEditDialog = () => {
    setIsOpen(false); 
    setIsEditUserDialogOpen(true);
  };

  const handleEditDialogClose = (updated) => {
    setIsEditUserDialogOpen(false);
    if(updated) onUserUpdated();
  }
  
  const DetailItem = ({ icon, label, value, valueClass = "text-slate-200" }) => (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 text-slate-400 pt-0.5">{icon}</div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-sm font-medium ${valueClass}`}>{value || <span className="italic text-slate-500">Not provided</span>}</p>
      </div>
    </div>
  );
  
  const displayName = userToView.preferred_name || userToView.name || userToView.email;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg bg-slate-800 border-slate-700 text-white overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserCircle className="mr-2 h-6 w-6 text-purple-400" />
              User Details: {displayName}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Viewing profile information for {userToView.email}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
            <DetailItem icon={<Briefcase size={16} />} label="Role" value={<Badge variant="outline" className="capitalize text-xs">{userToView.role?.replace('_', ' ')}</Badge>} />
            <DetailItem icon={<Landmark size={16} />} label="Email" value={userToView.email} />
            
            {showPendingVerification && (
              <div className="md:col-span-2 flex items-center space-x-2 text-yellow-400">
                <MailWarning size={16} />
                <p className="text-sm">Email verification pending</p>
              </div>
            )}
            {isEmailVerified && (
                 <div className="md:col-span-1 flex items-center space-x-2 text-green-400">
                    <ShieldCheck size={16} />
                    <p className="text-sm">Email Verified</p>
                </div>
            )}
             {lastSignInAt && (
              <DetailItem icon={<Clock size={16} />} label="Last Sign In" value={new Date(lastSignInAt).toLocaleString()} />
            )}


            <h3 className="md:col-span-2 text-lg font-semibold text-purple-300 mt-2 mb-1">Legal Information</h3>
            <DetailItem icon={<UserCircle size={16} />} label="Legal First Name" value={userToView.legal_first_name} />
            <DetailItem icon={<UserCircle size={16} />} label="Legal Middle Name" value={userToView.legal_middle_name} />
            <DetailItem icon={<UserCircle size={16} />} label="Legal Last Name" value={userToView.legal_last_name} />
            <DetailItem icon={<UserCircle size={16} />} label="Preferred Name" value={userToView.preferred_name} />
            
            <h3 className="md:col-span-2 text-lg font-semibold text-purple-300 mt-2 mb-1">Contact & Business</h3>
            <DetailItem icon={<Phone size={16} />} label="Phone Number" value={userToView.phone_number} />
            <DetailItem icon={<Building size={16} />} label="Business Name" value={userToView.business_name} />
            <DetailItem icon={<Landmark size={16} />} label="ABN" value={userToView.abn} />
            <DetailItem icon={<Landmark size={16} />} label="ACN" value={userToView.acn} />
            
            <h3 className="md:col-span-2 text-lg font-semibold text-purple-300 mt-2 mb-1">Account Dates</h3>
            <DetailItem icon={<CalendarDays size={16} />} label="Member Since" value={new Date(userToView.created_at).toLocaleDateString()} />
            {userToView.updated_at && <DetailItem icon={<CalendarDays size={16} />} label="Last Updated" value={new Date(userToView.updated_at).toLocaleDateString()} />}
            
            {isRecyclingBin && userToView.deleted_at && (
              <div className="md:col-span-2">
                <DetailItem 
                  icon={<Trash2 size={16} />} 
                  label="Deleted On" 
                  value={`${new Date(userToView.deleted_at).toLocaleDateString()} (Auto-deletes in ${Math.max(0, 30 - Math.floor((Date.now() - new Date(userToView.deleted_at).getTime()) / (1000 * 60 * 60 * 24)))} days)`} 
                  valueClass="text-orange-400"
                />
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between pt-4">
            <div>
              {isRecyclingBin && canManageDeletion && (
                <>
                  <Button variant="outline" size="sm" className="mr-2 border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400" onClick={() => { onRestoreUser(userToView.id); setIsOpen(false); }}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Restore User
                  </Button>
                  <DeleteUserDialog 
                    userToDelete={userToView} 
                    onConfirmDelete={() => {onPermanentDelete(userToView.id); setIsOpen(false);}} 
                    dialogType="permanentDelete" 
                  />
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="text-slate-300 border-slate-600 hover:bg-slate-700">
                Close
              </Button>
              {!isRecyclingBin && canEdit && (
                <Button onClick={openEditDialog} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Edit className="mr-2 h-4 w-4" /> Edit User
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {canEdit && (
        <EditUserDialog
          userToEdit={userToView}
          isOpen={isEditUserDialogOpen}
          setIsOpen={setIsEditUserDialogOpen}
          onUserUpdated={handleEditDialogClose}
          onSoftDelete={onSoftDelete}
          isRecyclingBinView={isRecyclingBin}
        />
      )}
    </>
  );
};

export default UserDetailsDialog;