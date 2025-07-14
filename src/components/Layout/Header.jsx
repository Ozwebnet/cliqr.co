import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Header = ({ setIsSidebarOpen, isMobile }) => {
  const { user, logout } = useAuth();

  const roleDisplayNames = {
    client: 'Client',
    admin: 'Admin',
    full_admin: 'Team Manager',
  };

  const handleUnimplemented = () => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 5000,
    });
  };

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 flex-shrink-0 bg-purple-500/90 dark:bg-slate-900/70 backdrop-blur-lg border-b border-purple-700 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 z-50"
    >
      <div className="flex items-center gap-4">
        {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              onClick={setIsSidebarOpen}
            >
              <Menu className="h-6 w-6" />
            </Button>
        )}
        <img 
            src="https://storage.googleapis.com/hostinger-horizons-assets-prod/8c02bbe1-80b7-49b5-b4ba-340c3af8df69/90c86ab753a1b7ee69cfe8a21275f1fe.png"
            alt="Cliqr.co Logo" 
            className="h-8 w-auto" 
        />
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-700 dark:text-slate-400 h-4 w-4" />
          <Input 
            placeholder="Search projects, clients, or tasks..."
            className="pl-10 bg-purple-100 dark:bg-slate-800 border-purple-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-700 dark:placeholder-slate-400"
            onClick={handleUnimplemented}
          />
        </div>
        <Button variant="ghost" size="icon" className="text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={handleUnimplemented}>
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        
        <div className="hidden md:flex items-center space-x-3">
          <div className="text-right">
            <p className="text-slate-900 dark:text-white text-sm font-medium">{user?.name}</p>
            <p className="text-slate-800 dark:text-slate-400 text-xs capitalize">{roleDisplayNames[user?.role] || user?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={logout}
          className="text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hidden md:inline-flex"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </motion.header>
  );
};

export default Header;