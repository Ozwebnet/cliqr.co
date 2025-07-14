import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Edit, 
  Share2, 
  Trash2,
  Star,
  StarOff,
  Globe,
  Database,
  Server,
  Smartphone,
  CreditCard,
  Mail,
  Settings,
  Shield,
  Key,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const CredentialDetailsDialog = ({ open, onOpenChange, credential }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  if (!credential) return null;

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

  const getPasswordStrengthText = (score) => {
    if (score >= 85) return 'Very Strong';
    if (score >= 70) return 'Strong';
    if (score >= 50) return 'Good';
    if (score >= 30) return 'Weak';
    return 'Very Weak';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  const handleEdit = () => {
    toast({
      title: '🚧 Edit Credential Not Implemented',
      description: "Credential editing isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleShare = () => {
    toast({
      title: '🚧 Share Credential Not Implemented',
      description: "Credential sharing isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleDelete = () => {
    toast({
      title: '🚧 Delete Credential Not Implemented',
      description: "Credential deletion isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleToggleFavorite = () => {
    toast({
      title: '🚧 Toggle Favorite Not Implemented',
      description: "Favorite toggling isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const CategoryIcon = getCategoryIcon(credential.category);
  const isExpiringSoon = credential.expires_at && new Date(credential.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {credential.title}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleFavorite}
                className="text-slate-400 hover:text-yellow-500"
              >
                {credential.is_favorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge className={getCategoryColor(credential.category)} variant="outline">
              <CategoryIcon className="w-3 h-3 mr-1" />
              {credential.category}
            </Badge>
            {credential.is_shared && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                <Share2 className="w-3 h-3 mr-1" />
                Shared
              </Badge>
            )}
            {credential.requires_2fa && (
              <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                <Shield className="w-3 h-3 mr-1" />
                2FA Required
              </Badge>
            )}
            {isExpiringSoon && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200" variant="outline">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Expiring Soon
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          {/* Description */}
          {credential.description && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <p className="text-slate-300">{credential.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Access Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {credential.website_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Website:</span>
                    <div className="flex items-center space-x-2">
                      <a
                        href={credential.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm truncate max-w-48"
                      >
                        {credential.website_url}
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyToClipboard(credential.website_url, 'Website URL')}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(credential.website_url, '_blank')}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {credential.username && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Username:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono text-sm">{credential.username}</span>
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
                    <span className="text-slate-400">Email:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono text-sm">{credential.email}</span>
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Password:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono text-sm">
                          {showPassword ? '••••••••••••' : '••••••••••••'}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
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
                    {credential.password_strength_score > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Strength:</span>
                        <div className="flex items-center space-x-2">
                          {credential.password_strength_score >= 70 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                          <span className={getPasswordStrengthColor(credential.password_strength_score)}>
                            {getPasswordStrengthText(credential.password_strength_score)} ({credential.password_strength_score}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span className="text-white text-sm">{formatDate(credential.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Updated:</span>
                  <span className="text-white text-sm">{formatDate(credential.updated_at)}</span>
                </div>
                {credential.expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Expires:</span>
                    <span className={`text-sm ${isExpiringSoon ? 'text-orange-400' : 'text-white'}`}>
                      {formatDate(credential.expires_at)}
                    </span>
                  </div>
                )}
                {credential.last_accessed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Accessed:</span>
                    <span className="text-white text-sm">{formatDate(credential.last_accessed_at)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Created By:</span>
                  <span className="text-white text-sm">
                    {credential.created_by_user?.preferred_name || credential.created_by_user?.legal_first_name || 'Unknown'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          {credential.tags && credential.tags.length > 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {credential.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {credential.notes_encrypted && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">Notes</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNotes(!showNotes)}
                    className="text-slate-400 hover:text-white"
                  >
                    {showNotes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showNotes ? (
                  <p className="text-slate-300 whitespace-pre-wrap">{credential.notes_encrypted}</p>
                ) : (
                  <p className="text-slate-500 italic">Click the eye icon to view notes</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Two-Factor Authentication:</span>
                <span className={`text-sm ${credential.requires_2fa ? 'text-green-400' : 'text-slate-400'}`}>
                  {credential.requires_2fa ? 'Required' : 'Not Required'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Shared with Team:</span>
                <span className={`text-sm ${credential.is_shared ? 'text-blue-400' : 'text-slate-400'}`}>
                  {credential.is_shared ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Favorite:</span>
                <span className={`text-sm ${credential.is_favorite ? 'text-yellow-400' : 'text-slate-400'}`}>
                  {credential.is_favorite ? 'Yes' : 'No'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialDetailsDialog;