import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { MailWarning, UserCircle, Building } from 'lucide-react';
import UserDetailsDialog from '@/components/CRM/UserDetailsDialog';

const UserListItem = ({ 
  clientUser, 
  isRecyclingBin = false, 
  authData, 
  currentAuthUser, 
  onSoftDelete, 
  onPermanentDelete, 
  onRestoreUser,
  onUserUpdated,
  initialLoadComplete 
}) => {
  
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  const showPendingVerification = initialLoadComplete && authData?.fetched && !authData?.email_confirmed_at;

  const handleOpenDetails = () => {
    setIsUserDetailsOpen(true);
  };

  const displayName = clientUser.preferred_name || clientUser.name;
  const avatarInitial = clientUser.business_name?.charAt(0)?.toUpperCase() || displayName?.charAt(0)?.toUpperCase() || <Building size={20}/>;


  return (
   <>
    <motion.div
      key={clientUser.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-colors space-y-4 sm:space-y-0"
    >
      <div 
        className="flex items-center space-x-4 cursor-pointer group flex-grow min-w-0"
        onClick={handleOpenDetails}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
          {avatarInitial}
        </div>
        <div className="min-w-0">
          <h4 className="text-white font-medium group-hover:text-purple-300 transition-colors truncate" title={clientUser.business_name || 'N/A'}>{clientUser.business_name || 'N/A'}</h4>
          <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors truncate" title={displayName || clientUser.email}>{displayName || clientUser.email}</p>
          {!isRecyclingBin && showPendingVerification && (
              <Badge variant="destructive" className="mt-1 text-xs">
                  <MailWarning className="mr-1 h-3 w-3" />
                  Pending Verification
              </Badge>
          )}
          {isRecyclingBin && clientUser.deleted_at && (
              <p className="text-xs text-orange-400 mt-1">
                  Deleted on: {new Date(clientUser.deleted_at).toLocaleDateString()} (Auto-deletes in {Math.max(0, 30 - Math.floor((Date.now() - new Date(clientUser.deleted_at).getTime()) / (1000 * 60 * 60 * 24)))} days)
              </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 self-end sm:self-center ml-0 sm:ml-4 flex-shrink-0">
        <Badge variant="outline" className="capitalize text-xs">{clientUser.role.replace('_', ' ')}</Badge>
      </div>
    </motion.div>
    
    <UserDetailsDialog
      userToView={clientUser}
      authData={authData}
      isOpen={isUserDetailsOpen}
      setIsOpen={setIsUserDetailsOpen}
      onUserUpdated={onUserUpdated}
      onSoftDelete={onSoftDelete}
      onPermanentDelete={onPermanentDelete}
      onRestoreUser={onRestoreUser}
      isRecyclingBin={isRecyclingBin}
      initialLoadComplete={initialLoadComplete}
    />
   </>
  );
};

export default UserListItem;