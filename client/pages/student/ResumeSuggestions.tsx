import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Target, 
  Star, 
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Download,
  Eye,
  Plus,
  Minus
} from "lucide-react";
import { 
  AnalyzeCertificatesRequest, 
  AnalyzeCertificatesResponse,
  JobRole,
  ResumeSuggestion
} from "@shared/api";
import { PDFGenerator } from "@/lib/pdf-utils";

interface CertificateRecommendation {
  certificateId: string;
  title: string;
  category: string;
  relevanceScore: number;
  reason: string;
  selected: boolean;
}

export default function ResumeSuggestions() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalyzeCertificatesResponse | null>(null);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<string>("");
  const [recommendations, setRecommendations] = useState<CertificateRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchJobRoles();
    if (user) {
      analyzeCertificates();
    }
  }, [user]);

  const fetchJobRoles = async () => {
    try {
      const response = await fetch('/api/portfolio/job-roles');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setJobRoles(data.jobRoles);
    } catch (err) {
      console.error('Error fetching job roles:', err);
      setError(`Failed to fetch job roles: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
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
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data: AnalyzeCertificatesResponse = await response.json();
      setAnalysis(data);
      
      // Generate recommendations
      generateRecommendations(data);
    } catch (err) {
      console.error('Error analyzing certificates:', err);
      setError(`Failed to analyze certificates: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (data: AnalyzeCertificatesResponse) => {
    const recs: CertificateRecommendation[] = data.analysis.map(cert => {
      const jobMatch = cert.jobMatches.find(m => m.jobRoleId === selectedJobRole);
      const relevanceScore = jobMatch ? jobMatch.matchScore : cert.relevanceScore;
      
      let reason = "";
      if (relevanceScore >= 70) {
        reason = "Excellent match - highly relevant for this role";
      } else if (relevanceScore >= 50) {
        reason = "Good match - shows relevant skills";
      } else if (relevanceScore >= 30) {
        reason = "Moderate match - demonstrates some relevant skills";
      } else {
        reason = "Low match - consider only if space allows";
      }

      return {
        certificateId: cert.certificateId,
        title: cert.title,
        category: cert.category,
        relevanceScore,
        reason,
        selected: relevanceScore >= 50 // Auto-select high-relevance certificates
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);

    setRecommendations(recs);
  };

  const toggleCertificate = (certificateId: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.certificateId === certificateId 
          ? { ...rec, selected: !rec.selected }
          : rec
      )
    );
  };

  const selectAll = () => {
    setRecommendations(prev => prev.map(rec => ({ ...rec, selected: true })));
  };

  const deselectAll = () => {
    setRecommendations(prev => prev.map(rec => ({ ...rec, selected: false })));
  };

  const generateResumeSection = () => {
    const selectedCerts = recommendations.filter(rec => rec.selected);
    return selectedCerts.map(cert => 
      `• ${cert.title} - ${cert.category} (${cert.relevanceScore}% match)`
    ).join('\n');
  };

  const downloadRecommendations = async () => {
    const selectedCerts = recommendations.filter(rec => rec.selected);
    const data = {
      jobRole: jobRoles.find(jr => jr.id === selectedJobRole)?.title || 'All Roles',
      selectedCertificates: selectedCerts,
      resumeSection: generateResumeSection(),
      generatedAt: new Date().toISOString()
    };
    
    await PDFGenerator.generateAnalysisPDF({
      student: 'Resume Recommendations',
      analyzedAt: new Date().toISOString(),
      analysis: {
        analysis: selectedCerts.map(cert => ({
          certificateId: cert.certificateId,
          title: cert.title,
          skills: [],
          category: cert.category,
          relevanceScore: cert.relevanceScore,
          jobMatches: []
        })),
        resumeSuggestions: [{
          jobRoleId: selectedJobRole,
          jobTitle: data.jobRole,
          recommendedCertificates: selectedCerts.map(c => c.certificateId),
          overallMatch: Math.round(selectedCerts.reduce((sum, c) => sum + c.relevanceScore, 0) / selectedCerts.length) || 0,
          reasoning: `Selected ${selectedCerts.length} certificates for ${data.jobRole}`,
          priority: 'high' as const
        }],
        overallProfile: {
          totalSkills: [],
          skillCategories: {},
          strengths: selectedCerts.map(c => c.title),
          improvementAreas: []
        }
      }
    }, `resume-suggestions-${selectedJobRole}-${Date.now()}.pdf`);
  };

  const getPriorityColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50";
    if (score >= 50) return "text-blue-600 bg-blue-50";
    if (score >= 30) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  const selectedCount = recommendations.filter(rec => rec.selected).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Certificate Suggestions</h1>
          <p className="text-muted-foreground">Get AI-powered recommendations for which certificates to include in your resume</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={analyzeCertificates} disabled={loading} variant="outline">
            <Target className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Analyze
          </Button>
          <Button onClick={downloadRecommendations} disabled={selectedCount === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download ({selectedCount})
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4 mb-6">
        <Select value={selectedJobRole} onValueChange={setSelectedJobRole}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select target job role" />
          </SelectTrigger>
          <SelectContent>
            {jobRoles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.title} ({role.experienceLevel})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={selectAll} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Select All
        </Button>
        <Button onClick={deselectAll} variant="outline" size="sm">
          <Minus className="h-4 w-4 mr-1" />
          Deselect All
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing certificates...</p>
          </div>
        </div>
      )}

      {!loading && analysis && recommendations.length > 0 && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recommendations Summary
              </CardTitle>
              <CardDescription>
                {jobRoles.find(jr => jr.id === selectedJobRole)?.title || 'All Roles'} - {selectedCount} of {recommendations.length} certificates selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {recommendations.filter(r => r.relevanceScore >= 70).length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {recommendations.filter(r => r.relevanceScore >= 50 && r.relevanceScore < 70).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Medium Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {recommendations.filter(r => r.relevanceScore < 50).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Low Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Certificate Recommendations</h3>
            {recommendations.map((rec) => (
              <Card key={rec.certificateId} className={`hover:shadow-md transition-shadow ${rec.selected ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Checkbox
                        checked={rec.selected}
                        onCheckedChange={() => toggleCertificate(rec.certificateId)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{rec.title}</h4>
                          <Badge variant="outline">{rec.category}</Badge>
                          <Badge className={getPriorityColor(rec.relevanceScore)}>
                            {rec.relevanceScore}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Relevance:</span>
                          <Progress value={rec.relevanceScore} className="w-32 h-2" />
                          <span className="text-sm text-muted-foreground">{rec.relevanceScore}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {rec.selected && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resume Preview */}
          {selectedCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume Section Preview
                </CardTitle>
                <CardDescription>How your selected certificates will appear in your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Certifications & Achievements</h4>
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generateResumeSection()}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!loading && !analysis && !error && user && (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
          <p className="text-muted-foreground mb-4">Select a job role and click "Analyze" to get certificate recommendations</p>
          <Button onClick={analyzeCertificates}>
            <Target className="h-4 w-4 mr-2" />
            Start Analysis
          </Button>
        </div>
      )}
    </div>
  );
}
