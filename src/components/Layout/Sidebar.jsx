import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  DollarSign, 
  Settings, 
  Bell, 
  ShieldCheck, 
  BarChart3,
  LogOut,
  UserCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'accountManagement', label: 'Account Management', icon: Users, adminOnly: true }, 
  { id: 'leads', label: 'Leads', icon: BarChart3, adminOnly: true },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'proposals', label: 'Proposals', icon: FileText, adminOnly: true },
  { id: 'invoices', label: 'Invoices', icon: DollarSign, adminOnly: true },
  { id: 'pricing', label: 'Pricing Calculator', icon: DollarSign, adminOnly: true },
  { id: 'credentials', label: 'Credential Vault', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, isMobile }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error) {
      toast({ title: 'Logout Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const filteredNavItems = navItems.filter(item => !item.adminOnly || (item.adminOnly && ['admin', 'full_admin'].includes(user?.role)));

  const desktopVariants = {
    open: { width: '256px', transition: { type: 'tween', duration: 0.3, ease: 'easeOut' } },
    closed: { width: '72px', transition: { type: 'tween', duration: 0.3, ease: 'easeOut' } },
  };

  const itemVariants = {
    open: { opacity: 1, x: 0, transition: { type: 'tween', duration: 0.2, ease: 'easeOut', delay: 0.15 } },
    closed: { opacity: 0, x: -20, transition: { type: 'tween', duration: 0.2, ease: 'easeIn' } },
  };
  
  const iconVariants = {
    open: { rotate: 0 },
    closed: { rotate: 0 },
  };

  return (
    <motion.aside
      initial={false}
      animate={!isMobile ? (isSidebarOpen ? 'open' : 'closed') : false}
      variants={desktopVariants}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={
        isMobile 
        ? `nav-drawer ${isSidebarOpen ? 'open' : ''} bg-purple-500/90 dark:bg-slate-900/70 backdrop-blur-lg border-r border-purple-700 dark:border-slate-700 flex flex-col`
        : "relative bg-purple-500/90 dark:bg-slate-900/70 backdrop-blur-lg border-r border-purple-700 dark:border-slate-700 flex flex-col h-full"
      }
    >
      <nav className="flex-1 p-2 space-y-1 pt-16">
        {filteredNavItems.map((item) => (
          <motion.button
            key={item.id}
            variants={iconVariants}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center justify-start my-2 transition-colors duration-150 bg-transparent group`}
            title={item.label}
          >
            <span
              className={`flex items-center justify-center transition-all duration-200
                ${activeTab === item.id
                  ? 'bg-gradient-to-br from-purple-400 to-purple-500 dark:from-purple-600 dark:to-blue-500 text-white shadow-lg rounded-full w-11 h-11'
                  : 'text-slate-800 dark:text-slate-400 group-hover:bg-purple-100/70 dark:group-hover:bg-slate-700/50 group-hover:text-slate-900 dark:group-hover:text-white rounded-full w-11 h-11'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
            </span>
            <div className="flex-1 text-left overflow-hidden">
              <AnimatePresence>
                {(isSidebarOpen || isMobile) && (
                  <motion.span 
                    className="whitespace-nowrap ml-3 text-slate-900 dark:text-white" 
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        ))}
      </nav>

              <div className="p-2 border-t border-purple-700 dark:border-slate-700">
        <motion.button
          variants={iconVariants}
          onClick={() => handleNavClick('settings')}
          className={`w-full flex items-center justify-start my-2 transition-colors duration-150 bg-transparent group`}
          title="Settings"
        >
          <span
            className={`flex items-center justify-center transition-all duration-200
              ${activeTab === 'settings'
                ? 'bg-gradient-to-br from-purple-400 to-purple-500 dark:from-purple-600 dark:to-blue-500 text-white shadow-lg rounded-full w-11 h-11'
                : 'text-slate-800 dark:text-slate-400 group-hover:bg-purple-100/70 dark:group-hover:bg-slate-700/50 group-hover:text-slate-900 dark:group-hover:text-white rounded-full w-11 h-11'
              }
            `}
          >
            <UserCircle className="w-5 h-5 flex-shrink-0" />
          </span>
          <div className="flex-1 text-left overflow-hidden">
            <AnimatePresence>
              {(isSidebarOpen || isMobile) && (
                <motion.span 
                  className="whitespace-nowrap ml-3 overflow-hidden text-ellipsis text-slate-900 dark:text-white" 
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  {user?.name || user?.email || 'Profile'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
        <motion.button
          variants={iconVariants}
          onClick={handleLogout}
          className={`w-full flex items-center p-3 rounded-md transition-colors duration-150 text-slate-800 dark:text-slate-400 hover:bg-red-500/20 hover:text-red-400`}
          title="Logout"
        >
          <LogOut className={`w-5 h-5 flex-shrink-0 ${isSidebarOpen || isMobile ? 'mr-3' : 'mr-0'}`} />
          <div className="flex-1 text-left overflow-hidden">
            <AnimatePresence>
              {(isSidebarOpen || isMobile) && (
                <motion.span 
                  className="whitespace-nowrap text-slate-900 dark:text-white" 
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;