import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useParaphraser } from "@/hooks/use-paraphraser";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, GraduationCap, Copy, Download, Sparkles, Shield, CheckCircle, Bot, CloudUpload, FileText, Zap, Globe, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Highlight {
  start: number;
  end: number;
  type: 'synonym' | 'grammar' | 'tone';
}

export default function Paraphraser() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<"academic" | "formal" | "creative" | "seo" | "simplify">("academic");
  const [language, setLanguage] = useState("English");
  const [citationFormat, setCitationFormat] = useState<"APA" | "MLA" | "Chicago">("APA");
  const [styleMatching, setStyleMatching] = useState(false);
  
  const {
    paraphrase,
    uploadFile,
    result,
    isLoading,
    uploadProgress,
    clearSession,
  } = useParaphraser();

  const handleParaphrase = useCallback(async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to paraphrase.",
        variant: "destructive",
      });
      return;
    }

    try {
      await paraphrase({
        text: inputText,
        mode,
        language,
        citationFormat,
        styleMatching,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to paraphrase text. Please try again.",
        variant: "destructive",
      });
    }
  }, [inputText, mode, language, citationFormat, styleMatching, paraphrase, toast]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await uploadFile(file);
      setInputText(result.extractedText);
      toast({
        title: "File Uploaded",
        description: `Successfully extracted text from ${result.fileName}`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the uploaded file. Please try again.",
        variant: "destructive",
      });
    }
  }, [uploadFile, toast]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleClear = useCallback(() => {
    setInputText("");
    clearSession();
  }, [clearSession]);

  const getWordCount = (text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  const renderHighlightedText = (text: string, highlights: Highlight[] | null) => {
    if (!highlights || highlights.length === 0) {
      return text;
    }

    const parts = [];
    let lastIndex = 0;

    highlights
      .sort((a, b) => a.start - b.start)
      .forEach((highlight, index) => {
        // Add text before highlight
        if (highlight.start > lastIndex) {
          parts.push(text.slice(lastIndex, highlight.start));
        }

        // Add highlighted text
        const highlightedText = text.slice(highlight.start, highlight.end);
        const className = `highlight-${highlight.type}`;
        parts.push(
          <span key={index} className={className}>
            {highlightedText}
          </span>
        );

        lastIndex = highlight.end;
      });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-300">
      {/* Enhanced Header with ScholarWriter.com branding */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <GraduationCap className="scholar-primary text-3xl drop-shadow-sm" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-scholar-secondary rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Scholar AI Paraphrased Pro
                  </h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Powered by</p>
                    <Badge variant="secondary" className="scholar-gradient text-white font-semibold px-3 py-1">
                      ScholarWriter.com
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Enhanced
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Feature badges */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                  <Shield className="h-4 w-4 scholar-secondary" />
                  <span className="font-medium">Privacy Protected</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                  <Zap className="h-4 w-4 scholar-accent" />
                  <span className="font-medium">Auto-Cleanup</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                  <Globe className="h-4 w-4 scholar-primary" />
                  <span className="font-medium">Multilingual</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 shadow-sm"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 text-slate-600" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-400" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Enhanced Sidebar Settings */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28 shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl">
              <CardHeader className="pb-6 px-6 pt-6">
                <CardTitle className="text-xl flex items-center space-x-3">
                  <div className="p-2 bg-scholar-primary/10 rounded-lg">
                    <Bot className="h-6 w-6 scholar-primary" />
                  </div>
                  <span className="font-bold">AI Settings</span>
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">Customize your paraphrasing experience with advanced options</p>
              </CardHeader>
              <CardContent className="space-y-8 px-6 pb-8">
                {/* Enhanced Paraphrasing Modes */}
                <div>
                  <Label className="text-sm font-semibold mb-6 block flex items-center space-x-3">
                    <div className="p-1.5 bg-scholar-primary/10 rounded-md">
                      <Sparkles className="h-4 w-4 scholar-primary" />
                    </div>
                    <span>Writing Mode</span>
                  </Label>
                  <RadioGroup value={mode} onValueChange={(value) => setMode(value as typeof mode)} className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-scholar-primary/30 transition-all duration-200">
                      <RadioGroupItem value="academic" id="academic" className="scholar-primary" />
                      <div className="flex-1">
                        <Label htmlFor="academic" className="text-sm font-semibold cursor-pointer text-slate-800 dark:text-slate-200">Academic</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Scholarly tone with formal language</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-scholar-primary/30 transition-all duration-200">
                      <RadioGroupItem value="formal" id="formal" className="scholar-primary" />
                      <div className="flex-1">
                        <Label htmlFor="formal" className="text-sm font-semibold cursor-pointer text-slate-800 dark:text-slate-200">Formal</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Professional business writing</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-scholar-primary/30 transition-all duration-200">
                      <RadioGroupItem value="creative" id="creative" className="scholar-primary" />
                      <div className="flex-1">
                        <Label htmlFor="creative" className="text-sm font-semibold cursor-pointer text-slate-800 dark:text-slate-200">Creative</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Engaging and expressive style</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-scholar-primary/30 transition-all duration-200">
                      <RadioGroupItem value="seo" id="seo" className="scholar-primary" />
                      <div className="flex-1">
                        <Label htmlFor="seo" className="text-sm font-semibold cursor-pointer text-slate-800 dark:text-slate-200">SEO-Optimized</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Search engine friendly content</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-scholar-primary/30 transition-all duration-200">
                      <RadioGroupItem value="simplify" id="simplify" className="scholar-primary" />
                      <div className="flex-1">
                        <Label htmlFor="simplify" className="text-sm font-semibold cursor-pointer text-slate-800 dark:text-slate-200">Simplify</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Easy-to-understand language</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Enhanced Language Selection */}
                <div>
                  <Label className="text-sm font-semibold mb-4 block flex items-center space-x-3">
                    <div className="p-1.5 bg-scholar-primary/10 rounded-md">
                      <Globe className="h-4 w-4 scholar-primary" />
                    </div>
                    <span>Language</span>
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl hover:border-scholar-primary/30 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="English">🇺🇸 English</SelectItem>
                      <SelectItem value="Spanish">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="French">🇫🇷 French</SelectItem>
                      <SelectItem value="German">🇩🇪 German</SelectItem>
                      <SelectItem value="Urdu">🇵🇰 Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Enhanced Citation Format */}
                <div>
                  <Label className="text-sm font-semibold mb-4 block flex items-center space-x-3">
                    <div className="p-1.5 bg-scholar-primary/10 rounded-md">
                      <FileText className="h-4 w-4 scholar-primary" />
                    </div>
                    <span>Citation Format</span>
                  </Label>
                  <Select value={citationFormat} onValueChange={(value) => setCitationFormat(value as typeof citationFormat)}>
                    <SelectTrigger className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl hover:border-scholar-primary/30 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="APA">APA Style</SelectItem>
                      <SelectItem value="MLA">MLA Format</SelectItem>
                      <SelectItem value="Chicago">Chicago Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Enhanced Style Matching Toggle */}
                <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-scholar-accent/10 rounded-md">
                        <Star className="h-4 w-4 scholar-accent" />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Style Matching</Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Adapt to your writing style</p>
                      </div>
                    </div>
                    <Switch
                      checked={styleMatching}
                      onCheckedChange={setStyleMatching}
                      className="data-[state=checked]:bg-scholar-primary"
                    />
                  </div>
                </div>

                {/* Enhanced Color Legend */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-600">
                  <h4 className="text-sm font-medium mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full scholar-gradient"></div>
                    <span>Edit Highlights</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="w-4 h-4 rounded-full bg-[hsl(217,91%,60%)] shadow-sm"></div>
                      <div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Synonym changes</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Word replacements</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <div className="w-4 h-4 rounded-full bg-[hsl(158,64%,52%)] shadow-sm"></div>
                      <div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Grammar enhancements</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Structure improvements</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                      <div className="w-4 h-4 rounded-full bg-[hsl(43,96%,56%)] shadow-sm"></div>
                      <div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Tone/style shifts</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Voice adjustments</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Main Content Area */}
          <div className="lg:col-span-3">
            {/* Enhanced File Upload Section */}
            <Card className="mb-10 shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl">
              <CardHeader className="pb-6 px-8 pt-8">
                <div className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl flex items-center space-x-4">
                    <div className="p-3 bg-scholar-primary/10 rounded-xl">
                      <CloudUpload className="h-7 w-7 scholar-primary" />
                    </div>
                    <span className="font-bold">Document Upload</span>
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-xs px-3 py-1">
                      <Zap className="w-3 h-3 mr-1" />
                      Auto-cleanup
                    </Badge>
                    <span className="text-sm text-slate-500 dark:text-slate-400">PDF, DOCX, TXT • 10MB max</span>
                  </div>
                </div>
                <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                  Upload documents to extract text automatically. Files are securely processed and automatically deleted after 2 hours for privacy protection.
                </p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-16 text-center hover:border-scholar-primary dark:hover:border-scholar-primary transition-all duration-300 cursor-pointer group bg-gradient-to-br from-slate-50/80 to-blue-50/80 dark:from-slate-800/50 dark:to-slate-700/50">
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                  <div className="space-y-6">
                    <CloudUpload className="mx-auto h-20 w-20 text-slate-400 dark:text-slate-500 group-hover:text-scholar-primary group-hover:scale-110 transition-all duration-300" />
                    <div>
                      <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">Drop your documents here</p>
                      <p className="text-base text-slate-500 dark:text-slate-500 mb-8">or click to browse and select files</p>
                    </div>
                    <Button
                      onClick={() => document.getElementById('fileUpload')?.click()}
                      className="scholar-gradient text-white font-semibold px-10 py-4 rounded-xl hover:shadow-xl transition-all duration-300"
                      disabled={uploadProgress > 0 && uploadProgress < 100}
                      size="lg"
                    >
                      {uploadProgress > 0 && uploadProgress < 100 ? (
                        <>
                          <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Uploading... {uploadProgress}%</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-6 h-6 mr-3" />
                          Browse Files
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Text Processing Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Enhanced Input Area */}
              <Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl">
                <CardHeader className="pb-6 px-8 pt-8">
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl flex items-center space-x-3">
                      <div className="p-2 bg-scholar-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 scholar-primary" />
                      </div>
                      <span className="font-bold">Original Text</span>
                    </CardTitle>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {getWordCount(inputText)} words
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(inputText)}
                        disabled={!inputText}
                        className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <Textarea
                    placeholder="Enter your text here or upload a document above to get started..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-96 resize-none border-slate-200 dark:border-slate-600 focus-visible:ring-scholar-primary bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm text-base leading-relaxed p-6 rounded-xl"
                  />
                  <div className="mt-6 flex justify-between items-center">
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      size="sm"
                      disabled={!inputText}
                      className="text-slate-600 dark:text-slate-400 px-6 py-2 rounded-xl"
                    >
                      Clear Text
                    </Button>
                    <Button
                      onClick={handleParaphrase}
                      disabled={!inputText.trim() || isLoading}
                      className="scholar-gradient text-white font-semibold px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-3" />
                          Paraphrase Text
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Output Area */}
              <Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl">
                <CardHeader className="pb-6 px-8 pt-8">
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl flex items-center space-x-3">
                      <div className="p-2 bg-scholar-secondary/10 rounded-lg">
                        <CheckCircle className="h-6 w-6 scholar-secondary" />
                      </div>
                      <span className="font-bold">Paraphrased Result</span>
                    </CardTitle>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {result ? getWordCount(result.paraphrasedText) : 0} words
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => result && handleCopy(result.paraphrasedText)}
                        disabled={!result}
                        className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!result}
                        className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="min-h-96 overflow-y-auto leading-relaxed bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-600 p-6">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-6">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-600"></div>
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-scholar-primary border-t-transparent absolute inset-0"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">AI Processing</p>
                          <p className="text-base text-slate-500 dark:text-slate-400">Analyzing and paraphrasing your text...</p>
                        </div>
                      </div>
                    ) : result ? (
                      <div className="text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                        {renderHighlightedText(result.paraphrasedText, result.highlights)}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full space-y-6 text-slate-500 dark:text-slate-400">
                        <Bot className="h-20 w-20 opacity-30" />
                        <div className="text-center">
                          <p className="text-xl font-semibold mb-3">Ready for paraphrasing</p>
                          <p className="text-base">Your enhanced text will appear here with color-coded highlights</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Summary and Stats */}
            {result && (
              <Card className="mt-10 shadow-xl border-0 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 backdrop-blur-md rounded-2xl">
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                      <div className="text-3xl font-bold scholar-primary mb-2">{result.mode.toUpperCase()}</div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Writing Mode</div>
                    </div>
                    <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                      <div className="text-3xl font-bold scholar-secondary mb-2">{result.language}</div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Language</div>
                    </div>
                    <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                      <div className="text-3xl font-bold scholar-accent mb-2">{result.citationFormat}</div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Citation Style</div>
                    </div>
                    <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                      <div className="text-3xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {result.highlights ? result.highlights.length : 0}
                      </div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Improvements</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Style Matching Upload (when enabled) */}
            {styleMatching && (
              <Card className="mt-8 shadow-lg border-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-scholar-accent/10 p-3 rounded-lg">
                      <Star className="scholar-accent text-xl" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Style Matching Sample</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Upload a writing sample to match your personal writing style in the paraphrased output. This helps maintain consistency with your unique voice and tone.
                      </p>
                      <div className="border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-lg p-6 text-center bg-white/50 dark:bg-slate-700/50">
                        <FileText className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">Drop a sample document or click to browse</p>
                        <Button variant="outline" className="mt-3" size="sm">
                          Upload Sample
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Enhanced Footer with ScholarWriter.com Branding */}
        <footer className="mt-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="scholar-primary text-2xl" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Scholar AI Paraphrased Pro</h3>
                    <Badge variant="secondary" className="scholar-gradient text-white font-semibold mt-1">
                      ScholarWriter.com
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Advanced AI-powered paraphrasing tool designed for academic and professional writing. 
                  Built with cutting-edge technology to preserve citations and enhance your content.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-800 dark:text-white">Key Features</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 scholar-secondary" />
                    <span>5 Writing Modes (Academic, Formal, Creative, SEO, Simplify)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 scholar-secondary" />
                    <span>Color-Coded Edit Visualization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 scholar-secondary" />
                    <span>Citation Integrity (APA, MLA, Chicago)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 scholar-secondary" />
                    <span>Multilingual Support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 scholar-secondary" />
                    <span>Auto-Cleanup for Privacy</span>
                  </li>
                </ul>
              </div>

              {/* Technology & Credits */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-800 dark:text-white">Powered By</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <Bot className="h-8 w-8 scholar-primary" />
                    <div>
                      <div className="font-medium text-slate-800 dark:text-white">Google Gemini AI</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Advanced language processing</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <Shield className="h-8 w-8 scholar-secondary" />
                    <div>
                      <div className="font-medium text-slate-800 dark:text-white">Privacy First</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">End-to-end encryption</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    © 2025 ScholarWriter.com - Advanced Academic Writing Tools
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    All rights reserved. Built with modern web technologies for optimal performance.
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Service Online</span>
                  </div>
                  <Badge variant="outline" className="scholar-gradient text-white">
                    v2.0 Pro
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
