import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  Star,
  Save
} from "lucide-react";
import { 
  AnalyzeCertificatesRequest, 
  AnalyzeCertificatesResponse,
  JobRole,
  ResumeSuggestion,
  PortfolioItem
} from "@shared/api";
import { PDFGenerator } from "@/lib/pdf-utils";

interface ResumeSection {
  id: string;
  title: string;
  content: string;
  included: boolean;
}

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalyzeCertificatesResponse | null>(null);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<string>("");
  const [resumeSections, setResumeSections] = useState<ResumeSection[]>([]);
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchJobRoles();
    initializeResumeSections();
  }, []);

  const fetchJobRoles = async () => {
    try {
      const response = await fetch('/api/portfolio/job-roles');
      const data = await response.json();
      setJobRoles(data.jobRoles);
    } catch (err) {
      console.error('Error fetching job roles:', err);
    }
  };

  const initializeResumeSections = () => {
    setResumeSections([
      { id: 'summary', title: 'Professional Summary', content: '', included: true },
      { id: 'skills', title: 'Skills', content: '', included: true },
      { id: 'experience', title: 'Experience', content: '', included: true },
      { id: 'education', title: 'Education', content: '', included: true },
      { id: 'certifications', title: 'Certifications', content: '', included: true },
      { id: 'projects', title: 'Projects', content: '', included: false },
      { id: 'achievements', title: 'Achievements', content: '', included: false }
    ]);
  };

  const analyzeCertificates = async () => {
    if (!user) return;
    
    setLoading(true);
    setError("");
    
    try {
      const request: AnalyzeCertificatesRequest = {
        studentId: user.id,
        jobRoleId: selectedJobRole || undefined
      };
      
      const response = await fetch('/api/portfolio/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      const data: AnalyzeCertificatesResponse = await response.json();
      setAnalysis(data);
      
      // Auto-populate resume sections based on analysis
      populateResumeSections(data);
    } catch (err) {
      setError('Failed to analyze certificates');
      console.error('Error analyzing certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const populateResumeSections = (data: AnalyzeCertificatesResponse) => {
    const newSections = [...resumeSections];
    
    // Professional Summary
    const summarySection = newSections.find(s => s.id === 'summary');
    if (summarySection) {
      summarySection.content = `Experienced professional with expertise in ${data.overallProfile.strengths.slice(0, 3).join(', ')}. 
      Demonstrated skills in ${data.overallProfile.totalSkills.length} areas with strong focus on ${data.overallProfile.strengths[0] || 'problem-solving'}. 
      Seeking opportunities to leverage technical and analytical skills in a challenging role.`;
    }
    
    // Skills
    const skillsSection = newSections.find(s => s.id === 'skills');
    if (skillsSection) {
      skillsSection.content = data.overallProfile.totalSkills.slice(0, 15).join(', ');
    }
    
    // Certifications
    const certsSection = newSections.find(s => s.id === 'certifications');
    if (certsSection) {
      certsSection.content = data.analysis.map(cert => 
        `• ${cert.title} - ${cert.category} (${cert.relevanceScore}% relevance)`
      ).join('\n');
    }
    
    setResumeSections(newSections);
  };

  const updateSection = (id: string, content: string) => {
    setResumeSections(prev => 
      prev.map(section => 
        section.id === id ? { ...section, content } : section
      )
    );
  };

  const toggleSection = (id: string) => {
    setResumeSections(prev => 
      prev.map(section => 
        section.id === id ? { ...section, included: !section.included } : section
      )
    );
  };

  const generateResume = () => {
    const includedSections = resumeSections.filter(s => s.included);
    const resumeContent = includedSections.map(section => 
      `## ${section.title}\n${section.content}`
    ).join('\n\n');
    
    return `# ${personalInfo.name}
${personalInfo.email ? `Email: ${personalInfo.email}` : ''}
${personalInfo.phone ? `Phone: ${personalInfo.phone}` : ''}
${personalInfo.location ? `Location: ${personalInfo.location}` : ''}
${personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : ''}
${personalInfo.github ? `GitHub: ${personalInfo.github}` : ''}

${resumeContent}`;
  };

  const downloadResume = async () => {
    const resumeData = {
      name: personalInfo.name,
      email: personalInfo.email,
      phone: personalInfo.phone,
      location: personalInfo.location,
      linkedin: personalInfo.linkedin,
      github: personalInfo.github,
      sections: resumeSections.filter(s => s.included)
    };
    
    await PDFGenerator.generateResumePDF(resumeData, `resume-${personalInfo.name}-${Date.now()}.pdf`);
  };

  const downloadPDF = async () => {
    await downloadResume();
  };

  const getJobRoleSuggestions = () => {
    if (!analysis) return [];
    return analysis.resumeSuggestions.slice(0, 3);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
          <p className="text-muted-foreground">Build your resume with AI-powered suggestions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadResume} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download MD
          </Button>
          <Button onClick={downloadPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Configuration */}
        <div className="space-y-6">
          {/* Job Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Target Job Role
              </CardTitle>
              <CardDescription>Select a job role for personalized suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedJobRole} onValueChange={setSelectedJobRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job role" />
                </SelectTrigger>
                <SelectContent>
                  {jobRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.title} ({role.experienceLevel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={analyzeCertificates} disabled={loading} className="w-full">
                <Lightbulb className="h-4 w-4 mr-2" />
                Get AI Suggestions
              </Button>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={personalInfo.linkedin}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, linkedin: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={personalInfo.github}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, github: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resume Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Sections</CardTitle>
              <CardDescription>Choose which sections to include</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resumeSections.map((section) => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.id}
                    checked={section.included}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <Label htmlFor={section.id} className="text-sm font-medium">
                    {section.title}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Suggestions
                </CardTitle>
                <CardDescription>Based on your certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getJobRoleSuggestions().map((suggestion) => (
                    <div key={suggestion.jobRoleId} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{suggestion.jobTitle}</h4>
                        <Badge variant="outline">{suggestion.overallMatch}% match</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Resume Editor */}
        <div className="lg:col-span-2 space-y-6">
          {resumeSections.map((section) => (
            section.included && (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {section.title}
                    <div className="flex items-center gap-2">
                      {analysis && section.id === 'skills' && (
                        <Badge variant="secondary" className="text-xs">
                          AI Generated
                        </Badge>
                      )}
                      {analysis && section.id === 'certifications' && (
                        <Badge variant="secondary" className="text-xs">
                          From Certificates
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, e.target.value)}
                    placeholder={`Enter your ${section.title.toLowerCase()}...`}
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>
            )
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Resume Preview
          </CardTitle>
          <CardDescription>Preview your resume as it will appear</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-6 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {generateResume()}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
