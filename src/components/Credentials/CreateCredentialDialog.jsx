import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Key, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Globe,
  Database,
  Server,
  Smartphone,
  CreditCard,
  Mail,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { supabase } from '@/lib/supabaseClient';
import { analyzePasswordStrength, generateSecurePassword } from '@/lib/encryption';

const CreateCredentialDialog = ({ open, onOpenChange, categories, onCredentialCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    website_url: '',
    username: '',
    email: '',
    password: '',
    notes: '',
    tags: [],
    is_shared: false,
    shared_with: [],
    requires_2fa: false,
    expires_at: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [], strength: 'Very Weak' });
  const [newTag, setNewTag] = useState('');

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      category: 'general',
      website_url: '',
      username: '',
      email: '',
      password: '',
      notes: '',
      tags: [],
      is_shared: false,
      shared_with: [],
      requires_2fa: false,
      expires_at: ''
    });
    setPasswordStrength({ score: 0, feedback: [], strength: 'Very Weak' });
    setNewTag('');
    setShowPassword(false);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Analyze password strength when password changes
    if (field === 'password') {
      const strength = analyzePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleGeneratePassword = () => {
    try {
      const newPassword = generateSecurePassword({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: true,
        excludeAmbiguous: true
      });
      handleInputChange('password', newPassword);
      toast({
        title: 'Password Generated',
        description: 'A secure password has been generated for you.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate password',
        variant: 'destructive'
      });
    }
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

  const getStrengthColor = (score) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    if (score >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const getStrengthIcon = (score) => {
    if (score >= 70) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 50) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a title for the credential.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, we'll store the password as plain text
      // In production, this should be encrypted client-side before sending
      const credentialData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        website_url: formData.website_url.trim() || null,
        username: formData.username.trim() || null,
        email: formData.email.trim() || null,
        password_encrypted: formData.password || null, // Should be encrypted
        notes_encrypted: formData.notes.trim() || null, // Should be encrypted
        tags: formData.tags.length > 0 ? formData.tags : null,
        is_shared: formData.is_shared,
        shared_with: formData.shared_with.length > 0 ? formData.shared_with : null,
        requires_2fa: formData.requires_2fa,
        expires_at: formData.expires_at || null,
        password_strength_score: passwordStrength.score,
        created_by: user.id,
        team_id: user.team_id
      };

      const { error } = await supabase
        .from('credentials')
        .insert(credentialData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Credential "${formData.title}" created successfully!`
      });

      onCredentialCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create credential: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const CategoryIcon = getCategoryIcon(formData.category);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!loading) { onOpenChange(isOpen); if (!isOpen) resetForm(); } }}>
      <DialogContent className="sm:max-w-2xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white overflow-y-auto max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Add New Credential
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Securely store passwords, API keys, and other sensitive information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Gmail Account, AWS Console"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-300">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <div className="flex items-center space-x-2">
                      <CategoryIcon className="w-4 h-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="api">API Key</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
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
                placeholder="Brief description of this credential"
                className="bg-slate-800 border-slate-600 text-white"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url" className="text-slate-300">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                placeholder="https://example.com"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Login Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Login Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Username or login ID"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="user@example.com"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password"
                  className="bg-slate-800 border-slate-600 text-white pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleGeneratePassword}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <Key className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {formData.password && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 text-sm">Password Strength:</span>
                      <div className="flex items-center space-x-2">
                        {getStrengthIcon(passwordStrength.score)}
                        <span className={`text-sm font-medium ${getStrengthColor(passwordStrength.score)}`}>
                          {passwordStrength.strength} ({passwordStrength.score}%)
                        </span>
                      </div>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="space-y-1">
                        {passwordStrength.feedback.map((feedback, index) => (
                          <p key={index} className="text-slate-400 text-xs">• {feedback}</p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-300">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or instructions"
                className="bg-slate-800 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Tags</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddTag}
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300">
                      {tag}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 p-0 h-auto text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expires_at" className="text-slate-300">Expires At (Optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => handleInputChange('expires_at', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_2fa"
                    checked={formData.requires_2fa}
                    onCheckedChange={(checked) => handleInputChange('requires_2fa', checked)}
                  />
                  <Label htmlFor="requires_2fa" className="text-slate-300">Requires 2FA</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_shared"
                    checked={formData.is_shared}
                    onCheckedChange={(checked) => handleInputChange('is_shared', checked)}
                  />
                  <Label htmlFor="is_shared" className="text-slate-300">Share with team</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          <div className="flex items-center justify-end space-x-2 w-full">
            <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }} disabled={loading} className="text-slate-300 border-slate-600 hover:bg-slate-700">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.title.trim()} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              {loading ? 'Creating...' : 'Create Credential'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCredentialDialog;