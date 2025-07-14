import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Search, 
  Plus, 
  Shield, 
  Eye, 
  EyeOff,
  Copy, 
  Edit, 
  Trash2,
  Star,
  StarOff,
  Share2,
  Key,
  Globe,
  Database,
  Server,
  Smartphone,
  CreditCard,
  Mail,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Lock,
  Unlock,
  Filter,
  SortAsc,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import LoadingBar from '@/components/ui/LoadingBar';
import CreateCredentialDialog from '@/components/Credentials/CreateCredentialDialog';
import CredentialDetailsDialog from '@/components/Credentials/CredentialDetailsDialog';
import PasswordGeneratorDialog from '@/components/Credentials/PasswordGeneratorDialog';

const CredentialVault = () => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCredentials, setFilteredCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  const fetchData = useCallback(async () => {
    if (!user?.team_id) return;
    
    setLoading(true);
    try {
      // Fetch credentials
      const { data: credentialsData, error: credentialsError } = await supabase
        .from('credentials')
        .select(`
          *,
          created_by_user:created_by(id, preferred_name, legal_first_name)
        `)
        .eq('team_id', user.team_id)
        .order('updated_at', { ascending: false });

      if (credentialsError) throw credentialsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('credential_categories')
        .select('*')
        .eq('team_id', user.team_id)
        .order('name');

      if (categoriesError) throw categoriesError;

      setCredentials(credentialsData || []);
      setCategories(categoriesData || []);
      setFilteredCredentials(credentialsData || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to fetch credentials: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.team_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading) {
      let filtered = credentials;

      // Filter by search term
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(cred => 
          cred.title?.toLowerCase().includes(lowerSearchTerm) ||
          cred.description?.toLowerCase().includes(lowerSearchTerm) ||
          cred.username?.toLowerCase().includes(lowerSearchTerm) ||
          cred.email?.toLowerCase().includes(lowerSearchTerm) ||
          cred.website_url?.toLowerCase().includes(lowerSearchTerm) ||
          cred.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
        );
      }

      // Filter by category
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(cred => cred.category === selectedCategory);
      }

      // Filter by favorites
      if (showFavoritesOnly) {
        filtered = filtered.filter(cred => cred.is_favorite);
      }

      // Sort credentials
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'category':
            return a.category.localeCompare(b.category);
          case 'created_at':
            return new Date(b.created_at) - new Date(a.created_at);
          case 'updated_at':
          default:
            return new Date(b.updated_at) - new Date(a.updated_at);
        }
      });

      setFilteredCredentials(filtered);
    }
  }, [searchTerm, selectedCategory, showFavoritesOnly, sortBy, credentials, loading]);

  const handleRefresh = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setShowFavoritesOnly(false);
    fetchData();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      website: Globe,
      database: Database,
      api: Key,
      server: Server,
      social: Smartphone,
      financial: CreditCard,
      email: Mail,
      software: Settings,
      general: Shield
    };
    return icons[category] || Shield;
  };

  const getCategoryColor = (category) => {
    const colors = {
      website: 'bg-blue-100 text-blue-800 border-blue-200',
      database: 'bg-green-100 text-green-800 border-green-200',
      api: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      server: 'bg-red-100 text-red-800 border-red-200',
      social: 'bg-purple-100 text-purple-800 border-purple-200',
      financial: 'bg-orange-100 text-orange-800 border-orange-200',
      email: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      software: 'bg-gray-100 text-gray-800 border-gray-200',
      general: 'bg-slate-100 text-slate-800 border-slate-200'
    };
    return colors[category] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getPasswordStrengthColor = (score) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    if (score >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleToggleFavorite = async (credentialId, currentFavorite) => {
    try {
      const { error } = await supabase
        .from('credentials')
        .update({ is_favorite: !currentFavorite })
        .eq('id', credentialId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Credential ${!currentFavorite ? 'added to' : 'removed from'} favorites`
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update favorite: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleCopyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: `${type} copied to clipboard`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const handleTogglePasswordVisibility = (credentialId) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(credentialId)) {
        newSet.delete(credentialId);
      } else {
        newSet.add(credentialId);
      }
      return newSet;
    });
  };

  const handleViewCredential = (credential) => {
    setSelectedCredential(credential);
    setShowDetailsDialog(true);
  };

  const handleEditCredential = (credential) => {
    toast({
      title: '🚧 Edit Credential Not Implemented',
      description: "Credential editing isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleDeleteCredential = async (credentialId) => {
    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', credentialId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Credential deleted successfully'
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete credential: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleShareCredential = (credential) => {
    toast({
      title: '🚧 Share Credential Not Implemented',
      description: "Credential sharing isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const CredentialCard = ({ credential }) => {
    const CategoryIcon = getCategoryIcon(credential.category);
    const isPasswordVisible = visiblePasswords.has(credential.id);
    const isExpiringSoon = credential.expires_at && new Date(credential.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="p-2 bg-slate-700 rounded-lg">
              <CategoryIcon className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-white font-semibold truncate">{credential.title}</h3>
                {credential.is_favorite && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
                {credential.is_shared && (
                  <Share2 className="w-4 h-4 text-blue-500" />
                )}
                {isExpiringSoon && (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                )}
              </div>
              {credential.description && (
                <p className="text-slate-400 text-sm mb-2 line-clamp-2">{credential.description}</p>
              )}
              <div className="flex items-center space-x-2">
                <Badge className={getCategoryColor(credential.category)} variant="outline">
                  {credential.category}
                </Badge>
                {credential.password_strength_score > 0 && (
                  <Badge variant="outline" className={`${getPasswordStrengthColor(credential.password_strength_score)} border-current`}>
                    {credential.password_strength_score}% strength
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleToggleFavorite(credential.id, credential.is_favorite)}
              className="text-slate-400 hover:text-yellow-500"
            >
              {credential.is_favorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {credential.website_url && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Website:</span>
              <div className="flex items-center space-x-2">
                <span className="text-slate-300 text-sm truncate max-w-48">{credential.website_url}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyToClipboard(credential.website_url, 'Website URL')}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
          
          {credential.username && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Username:</span>
              <div className="flex items-center space-x-2">
                <span className="text-slate-300 text-sm truncate max-w-48">{credential.username}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyToClipboard(credential.username, 'Username')}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {credential.email && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Email:</span>
              <div className="flex items-center space-x-2">
                <span className="text-slate-300 text-sm truncate max-w-48">{credential.email}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyToClipboard(credential.email, 'Email')}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {credential.password_encrypted && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Password:</span>
              <div className="flex items-center space-x-2">
                <span className="text-slate-300 text-sm font-mono">
                  {isPasswordVisible ? '••••••••••••' : '••••••••••••'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleTogglePasswordVisibility(credential.id)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyToClipboard('••••••••••••', 'Password')}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center text-slate-400 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Updated {formatDate(credential.updated_at)}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewCredential(credential)}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditCredential(credential)}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleShareCredential(credential)}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteCredential(credential.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const StatsCards = () => {
    const totalCredentials = credentials.length;
    const weakPasswords = credentials.filter(c => c.password_strength_score < 50).length;
    const expiringSoon = credentials.filter(c => 
      c.expires_at && new Date(c.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length;
    const sharedCredentials = credentials.filter(c => c.is_shared).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Credentials</p>
                <p className="text-white text-2xl font-bold">{totalCredentials}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Weak Passwords</p>
                <p className="text-white text-2xl font-bold">{weakPasswords}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Expiring Soon</p>
                <p className="text-white text-2xl font-bold">{expiringSoon}</p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Shared</p>
                <p className="text-white text-2xl font-bold">{sharedCredentials}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingBar text="Loading credential vault..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Credential Vault</h1>
          <p className="text-slate-800 dark:text-slate-400 mt-2">Secure password and credential management for your team</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowPasswordGenerator(true)} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
            <Key className="mr-2 h-4 w-4" />
            Generate Password
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Credential
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StatsCards />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Credential Management</CardTitle>
            <CardDescription className="text-slate-400">
              Securely store and manage passwords, API keys, and other sensitive credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  type="search"
                  placeholder="Search credentials (title, username, email, tags...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="website">Websites</option>
                  <option value="database">Databases</option>
                  <option value="api">API Keys</option>
                  <option value="server">Servers</option>
                  <option value="social">Social</option>
                  <option value="financial">Financial</option>
                  <option value="email">Email</option>
                  <option value="software">Software</option>
                  <option value="general">General</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="updated_at">Last Updated</option>
                  <option value="created_at">Date Created</option>
                  <option value="title">Title</option>
                  <option value="category">Category</option>
                </select>
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={showFavoritesOnly ? "bg-yellow-600 hover:bg-yellow-700" : "text-slate-300 border-slate-600 hover:bg-slate-700"}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Favorites
                </Button>
              </div>
            </div>

            {filteredCredentials.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg mb-2">
                  {searchTerm || selectedCategory !== 'all' || showFavoritesOnly 
                    ? "No credentials match your filters." 
                    : "No credentials yet"}
                </p>
                <p className="text-slate-500 mb-4">
                  {searchTerm || selectedCategory !== 'all' || showFavoritesOnly
                    ? "Try adjusting your search or filters."
                    : "Add your first credential to get started with secure password management!"}
                </p>
                {!searchTerm && selectedCategory === 'all' && !showFavoritesOnly && (
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Credential
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCredentials.map(credential => (
                  <CredentialCard key={credential.id} credential={credential} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <CreateCredentialDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        categories={categories}
        onCredentialCreated={fetchData}
      />

      <CredentialDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        credential={selectedCredential}
      />

      <PasswordGeneratorDialog
        open={showPasswordGenerator}
        onOpenChange={setShowPasswordGenerator}
      />
    </div>
  );
};

export default CredentialVault;