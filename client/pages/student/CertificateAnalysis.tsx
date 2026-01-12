import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Star, 
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Download,
  Share2
} from "lucide-react";
import { 
  AnalyzeCertificatesRequest, 
  AnalyzeCertificatesResponse,
  JobRole,
  ResumeSuggestion
} from "@shared/api";
import { PDFGenerator } from "@/lib/pdf-utils";

export default function CertificateAnalysis() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalyzeCertificatesResponse | null>(null);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<string>("");
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setJobRoles(data.jobRoles);
    } catch (err) {
      console.error('Error fetching job roles:', err);
      setError(`Failed to fetch job roles: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const analyzeCertificates = async () => {
    if (!user) {
      setError('Please log in to analyze certificates');
      return;
    }
    
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
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please check if the server is running.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AnalyzeCertificatesResponse = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Error analyzing certificates:', err);
      setError(`Failed to analyze certificates: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadAnalysis = async () => {
    if (!analysis) return;
    
    const analysisData = {
      student: user?.name,
      analyzedAt: new Date().toISOString(),
      selectedJobRole: selectedJobRole,
      analysis: analysis
    };
    
    await PDFGenerator.generateAnalysisPDF(analysisData, `certificate-analysis-${user?.name}-${Date.now()}.pdf`);
  };

  const shareAnalysis = async () => {
    if (!analysis) return;
    
    const shareData = {
      title: `Certificate Analysis for ${user?.name}`,
      text: `I analyzed my certificates and found ${analysis.resumeSuggestions.length} job role matches!`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
      alert('Analysis summary copied to clipboard!');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "text-red-600 bg-red-50",
      medium: "text-yellow-600 bg-yellow-50", 
      low: "text-green-600 bg-green-50"
    };
    return colors[priority as keyof typeof colors] || "text-gray-600 bg-gray-50";
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificate Analysis</h1>
          <p className="text-muted-foreground">Analyze your certificates and get career insights</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={analyzeCertificates} disabled={loading} variant="outline">
            <BarChart3 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Re-analyze
          </Button>
          <Button onClick={downloadAnalysis} disabled={!analysis}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={shareAnalysis} disabled={!analysis} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
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
            <SelectValue placeholder="Select job role to analyze" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Job Roles</SelectItem>
            {jobRoles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.title} ({role.experienceLevel})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={analyzeCertificates} disabled={loading}>
          <Target className="h-4 w-4 mr-2" />
          Analyze
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

      {!loading && !analysis && !error && !user && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please Log In</h3>
          <p className="text-muted-foreground mb-4">You need to be logged in to analyze certificates</p>
        </div>
      )}

      {!loading && !analysis && !error && user && (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
          <p className="text-muted-foreground mb-4">Click "Analyze" to generate certificate analysis</p>
          <Button onClick={analyzeCertificates}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Start Analysis
          </Button>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.overallProfile.totalSkills.length}</div>
                <p className="text-xs text-muted-foreground">Unique skills</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Job Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.resumeSuggestions.length}</div>
                <p className="text-xs text-muted-foreground">Suitable roles</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top Match</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.max(...analysis.resumeSuggestions.map(s => s.overallMatch), 0)}%
                </div>
                <p className="text-xs text-muted-foreground">Best fit</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.overallProfile.strengths.length}</div>
                <p className="text-xs text-muted-foreground">Strong areas</p>
              </CardContent>
            </Card>
          </div>

          {/* Resume Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Resume Suggestions
              </CardTitle>
              <CardDescription>
                Based on your certificates, here are the best job roles for your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.resumeSuggestions.map((suggestion, idx) => (
                  <div key={suggestion.jobRoleId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{suggestion.jobTitle}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{suggestion.reasoning}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority} priority
                        </Badge>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getMatchColor(suggestion.overallMatch)}`}>
                            {suggestion.overallMatch}%
                          </div>
                          <div className="text-xs text-muted-foreground">match</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Overall Match</span>
                          <span>{suggestion.overallMatch}%</span>
                        </div>
                        <Progress value={suggestion.overallMatch} className="h-2" />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Recommended Certificates:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.recommendedCertificates.map((certId, certIdx) => {
                            const cert = analysis.analysis.find(c => c.certificateId === certId);
                            return (
                              <Badge key={certIdx} variant="secondary" className="text-xs">
                                {cert?.title || certId}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Strengths
                </CardTitle>
                <CardDescription>Areas where you excel based on your certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.overallProfile.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Improvement Areas
                </CardTitle>
                <CardDescription>Skills you could develop to improve your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.overallProfile.improvementAreas.map((area, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Certificate Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Certificate Analysis</CardTitle>
              <CardDescription>Individual analysis of each certificate and its job market relevance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.analysis.map((cert) => (
                  <div key={cert.certificateId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{cert.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{cert.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{cert.relevanceScore}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {cert.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {cert.jobMatches.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Job Matches:</p>
                          <div className="space-y-2">
                            {cert.jobMatches.slice(0, 3).map((match) => (
                              <div key={match.jobRoleId} className="flex items-center justify-between p-2 bg-muted rounded">
                                <span className="text-sm font-medium">{match.jobTitle}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${getMatchColor(match.matchScore)}`}>
                                    {match.matchScore}%
                                  </span>
                                  <Progress value={match.matchScore} className="w-16 h-2" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
