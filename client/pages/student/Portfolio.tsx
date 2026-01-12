import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileBadge2, 
  Download, 
  RefreshCw, 
  Star, 
  TrendingUp, 
  Target,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { 
  GeneratePortfolioRequest, 
  GeneratePortfolioResponse, 
  AnalyzeCertificatesRequest, 
  AnalyzeCertificatesResponse,
  JobRole,
  PortfolioItem,
  ResumeSuggestion
} from "@shared/api";
import { PDFGenerator } from "@/lib/pdf-utils";

export default function StudentPortfolio() {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [analysis, setAnalysis] = useState<AnalyzeCertificatesResponse | null>(null);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchJobRoles();
    generatePortfolio();
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

  const generatePortfolio = async () => {
    if (!user) return;
    
    setLoading(true);
    setError("");
    
    try {
      const request: GeneratePortfolioRequest = {
        studentId: user.id,
        includeAllCertificates: true
      };
      
      const response = await fetch('/api/portfolio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      const data: GeneratePortfolioResponse = await response.json();
      setPortfolioItems(data.portfolioItems);
    } catch (err) {
      setError('Failed to generate portfolio');
      console.error('Error generating portfolio:', err);
    } finally {
      setLoading(false);
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
      
      const data: AnalyzeCertificatesResponse = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError('Failed to analyze certificates');
      console.error('Error analyzing certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPortfolio = async () => {
    const portfolioData = {
      student: user?.name,
      generatedAt: new Date().toISOString(),
      items: portfolioItems
    };
    
    await PDFGenerator.generatePortfolioPDF(portfolioData, `portfolio-${user?.name}-${Date.now()}.pdf`);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: "bg-blue-100 text-blue-800",
      professional: "bg-green-100 text-green-800", 
      technical: "bg-purple-100 text-purple-800",
      leadership: "bg-orange-100 text-orange-800",
      creative: "bg-pink-100 text-pink-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "text-red-600",
      medium: "text-yellow-600", 
      low: "text-green-600"
    };
    return colors[priority as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio & Analysis</h1>
          <p className="text-muted-foreground">Generate your portfolio and get career insights</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generatePortfolio} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
          <Button onClick={downloadPortfolio} disabled={portfolioItems.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio Items</TabsTrigger>
          <TabsTrigger value="analysis">Career Analysis</TabsTrigger>
          <TabsTrigger value="suggestions">Resume Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {portfolioItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {item.description}
                      </CardDescription>
                    </div>
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Relevance Score</span>
                        <span>{item.relevanceScore}%</span>
                      </div>
                      <Progress value={item.relevanceScore} className="h-2" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.skills.slice(0, 5).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {item.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <select 
              value={selectedJobRole} 
              onChange={(e) => setSelectedJobRole(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Job Roles</option>
              {jobRoles.map((role) => (
                <option key={role.id} value={role.id}>{role.title}</option>
              ))}
            </select>
            <Button onClick={analyzeCertificates} disabled={loading}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyze Certificates
            </Button>
          </div>

          {analysis && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.overallProfile.totalSkills.length}</div>
                    <p className="text-xs text-muted-foreground">Unique skills identified</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Top Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.overallProfile.strengths.length}</div>
                    <p className="text-xs text-muted-foreground">Strong skill areas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Improvement Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.overallProfile.improvementAreas.length}</div>
                    <p className="text-xs text-muted-foreground">Skills to develop</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.overallProfile.strengths.map((strength, idx) => (
                        <Badge key={idx} variant="default" className="mr-2 mb-2">
                          {strength}
                        </Badge>
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
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.overallProfile.improvementAreas.map((area, idx) => (
                        <Badge key={idx} variant="outline" className="mr-2 mb-2">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Certificate Analysis</h3>
                {analysis.analysis.map((cert) => (
                  <Card key={cert.certificateId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{cert.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(cert.category)}>
                            {cert.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{cert.relevanceScore}%</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
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
                            <p className="text-sm font-medium mb-2">Top Job Matches:</p>
                            <div className="space-y-2">
                              {cert.jobMatches.slice(0, 3).map((match) => (
                                <div key={match.jobRoleId} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <span className="text-sm font-medium">{match.jobTitle}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{match.matchScore}%</span>
                                    <Progress value={match.matchScore} className="w-16 h-2" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          {analysis?.resumeSuggestions && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resume Suggestions by Job Role</h3>
              {analysis.resumeSuggestions.map((suggestion) => (
                <Card key={suggestion.jobRoleId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{suggestion.jobTitle}</CardTitle>
                        <CardDescription className="mt-1">
                          {suggestion.reasoning}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority} priority
                        </Badge>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{suggestion.overallMatch}%</div>
                          <div className="text-xs text-muted-foreground">match</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                          {suggestion.recommendedCertificates.map((certId, idx) => {
                            const cert = analysis.analysis.find(c => c.certificateId === certId);
                            return (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {cert?.title || certId}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
