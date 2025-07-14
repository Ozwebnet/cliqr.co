import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { 
  RefreshCw, 
  Copy, 
  Eye, 
  EyeOff, 
  Key, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Type,
  Hash
} from 'lucide-react';
import { generateSecurePassword, analyzePasswordStrength } from '@/lib/encryption';

const PasswordGeneratorDialog = ({ open, onOpenChange }) => {
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [], strength: 'Very Weak' });
  const [showPassword, setShowPassword] = useState(true);
  const [generationType, setGenerationType] = useState('password');
  const [options, setOptions] = useState({
    type: 'password',
    // Password options
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
    excludeAmbiguous: false,
    // Passphrase options
    wordCount: 4,
    separator: '-',
    capitalizeWords: false,
    numberPosition: 'end',
    symbolPosition: 'end'
  });

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleGenerationTypeChange = (type) => {
    setGenerationType(type);
    setOptions(prev => ({ ...prev, type }));
  };

  const generatePassword = () => {
    try {
      const newPassword = generateSecurePassword(options);
      setPassword(newPassword);
      const strength = analyzePasswordStrength(newPassword);
      setPasswordStrength(strength);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate password',
        variant: 'destructive'
      });
    }
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: 'Copied',
        description: 'Password copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy password',
        variant: 'destructive'
      });
    }
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

  const getStrengthBadgeColor = (score) => {
    if (score >= 85) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 30) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Generate initial password when dialog opens
  React.useEffect(() => {
    if (open && !password) {
      generatePassword();
    }
  }, [open]);

  // Regenerate password when options change
  React.useEffect(() => {
    if (password) {
      generatePassword();
    }
  }, [options]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-slate-900/90 backdrop-blur-md border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 flex items-center">
            <Key className="w-6 h-6 mr-2 text-blue-500" />
            Password Generator
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Generate secure passwords with customizable options for maximum security.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          {/* Generated Password */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Generated Password
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-300 border-slate-600 hover:bg-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generatePassword}
                    className="text-slate-300 border-slate-600 hover:bg-slate-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  readOnly
                  className="bg-slate-700 border-slate-600 text-white font-mono text-lg pr-12"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              {password && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Password Strength:</span>
                    <div className="flex items-center space-x-2">
                      {getStrengthIcon(passwordStrength.score)}
                      <Badge className={getStrengthBadgeColor(passwordStrength.score)} variant="outline">
                        {passwordStrength.strength} ({passwordStrength.score}%)
                      </Badge>
                    </div>
                  </div>
                  
                  {passwordStrength.feedback.length > 0 && (
                    <div className="bg-slate-700 rounded-lg p-3">
                      <p className="text-slate-300 text-sm font-medium mb-2">Recommendations:</p>
                      <div className="space-y-1">
                        {passwordStrength.feedback.map((feedback, index) => (
                          <p key={index} className="text-slate-400 text-xs">• {feedback}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generation Options */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Generation Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={generationType} onValueChange={handleGenerationTypeChange}>
                <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                  <TabsTrigger value="password" className="data-[state=active]:bg-slate-600">
                    <Hash className="w-4 h-4 mr-2" />
                    Password
                  </TabsTrigger>
                  <TabsTrigger value="passphrase" className="data-[state=active]:bg-slate-600">
                    <Type className="w-4 h-4 mr-2" />
                    Passphrase
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="password" className="space-y-6 mt-6">
              {/* Length Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Password Length</Label>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                    {options.length} characters
                  </Badge>
                </div>
                <Slider
                  value={[options.length]}
                  onValueChange={(value) => handleOptionChange('length', value[0])}
                  min={8}
                  max={64}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>8</span>
                  <span>64</span>
                </div>
              </div>

              {/* Character Type Options */}
              <div className="space-y-4">
                <h4 className="text-slate-300 font-medium">Include Characters</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uppercase"
                      checked={options.includeUppercase}
                      onCheckedChange={(checked) => handleOptionChange('includeUppercase', checked)}
                    />
                    <Label htmlFor="uppercase" className="text-slate-300">Uppercase (A-Z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowercase"
                      checked={options.includeLowercase}
                      onCheckedChange={(checked) => handleOptionChange('includeLowercase', checked)}
                    />
                    <Label htmlFor="lowercase" className="text-slate-300">Lowercase (a-z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbers"
                      checked={options.includeNumbers}
                      onCheckedChange={(checked) => handleOptionChange('includeNumbers', checked)}
                    />
                    <Label htmlFor="numbers" className="text-slate-300">Numbers (0-9)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="symbols"
                      checked={options.includeSymbols}
                      onCheckedChange={(checked) => handleOptionChange('includeSymbols', checked)}
                    />
                    <Label htmlFor="symbols" className="text-slate-300">Symbols (!@#$%)</Label>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-4">
                <h4 className="text-slate-300 font-medium">Advanced Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excludeSimilar"
                      checked={options.excludeSimilar}
                      onCheckedChange={(checked) => handleOptionChange('excludeSimilar', checked)}
                    />
                    <Label htmlFor="excludeSimilar" className="text-slate-300">
                      Exclude similar characters (i, l, 1, L, o, 0, O)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excludeAmbiguous"
                      checked={options.excludeAmbiguous}
                      onCheckedChange={(checked) => handleOptionChange('excludeAmbiguous', checked)}
                    />
                    <Label htmlFor="excludeAmbiguous" className="text-slate-300">
                      Exclude ambiguous symbols ({`{} [] () / \\ ' " ~ , ; . < >`})
                    </Label>
                  </div>
                </div>
              </div>
                </TabsContent>
                
                <TabsContent value="passphrase" className="space-y-6 mt-6">
                  {/* Word Count Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Number of Words</Label>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                        {options.wordCount} words
                      </Badge>
                    </div>
                    <Slider
                      value={[options.wordCount]}
                      onValueChange={(value) => handleOptionChange('wordCount', value[0])}
                      min={3}
                      max={8}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>3</span>
                      <span>8</span>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="space-y-3">
                    <Label className="text-slate-300">Word Separator</Label>
                    <Select value={options.separator} onValueChange={(value) => handleOptionChange('separator', value)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="-">Hyphen (-)</SelectItem>
                        <SelectItem value="_">Underscore (_)</SelectItem>
                        <SelectItem value=".">Period (.)</SelectItem>
                        <SelectItem value="">No separator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Passphrase Options */}
                  <div className="space-y-4">
                    <h4 className="text-slate-300 font-medium">Additional Options</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="capitalizeWords"
                          checked={options.capitalizeWords}
                          onCheckedChange={(checked) => handleOptionChange('capitalizeWords', checked)}
                        />
                        <Label htmlFor="capitalizeWords" className="text-slate-300">Capitalize first letter of each word</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeNumbers"
                          checked={options.includeNumbers}
                          onCheckedChange={(checked) => handleOptionChange('includeNumbers', checked)}
                        />
                        <Label htmlFor="includeNumbers" className="text-slate-300">Include numbers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeSymbols"
                          checked={options.includeSymbols}
                          onCheckedChange={(checked) => handleOptionChange('includeSymbols', checked)}
                        />
                        <Label htmlFor="includeSymbols" className="text-slate-300">Include symbols</Label>
                      </div>
                    </div>
                  </div>

                  {/* Position Options */}
                  <div className="space-y-4">
                    <h4 className="text-slate-300 font-medium">Position Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Number Position</Label>
                        <Select value={options.numberPosition} onValueChange={(value) => handleOptionChange('numberPosition', value)}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="start">Start</SelectItem>
                            <SelectItem value="end">End</SelectItem>
                            <SelectItem value="between">Between words</SelectItem>
                            <SelectItem value="random">Random</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Symbol Position</Label>
                        <Select value={options.symbolPosition} onValueChange={(value) => handleOptionChange('symbolPosition', value)}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="start">Start</SelectItem>
                            <SelectItem value="end">End</SelectItem>
                            <SelectItem value="between">Between words</SelectItem>
                            <SelectItem value="random">Random</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="p-6 pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-slate-400 text-sm">
              Tip: {generationType === 'password' ? 'Use longer passwords with mixed character types' : 'Use 4+ words with numbers and symbols'} for better security
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="text-slate-300 border-slate-600 hover:bg-slate-700">
                Close
              </Button>
              <Button onClick={handleCopyPassword} disabled={!password} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Copy className="mr-2 h-4 w-4" />
                Copy Password
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordGeneratorDialog;