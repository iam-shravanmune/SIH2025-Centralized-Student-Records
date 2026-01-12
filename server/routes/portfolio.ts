import { RequestHandler } from "express";
import { 
  GeneratePortfolioRequest, 
  GeneratePortfolioResponse, 
  PortfolioItem,
  JobRole,
  CertificateAnalysis,
  JobRoleMatch,
  ResumeSuggestion,
  AnalyzeCertificatesRequest,
  AnalyzeCertificatesResponse
} from "@shared/api";

// Mock job roles database
const JOB_ROLES: JobRole[] = [
  {
    id: "jr_1",
    title: "Software Developer",
    description: "Develop and maintain software applications",
    requiredSkills: ["JavaScript", "React", "Node.js", "Git", "Problem Solving"],
    preferredSkills: ["TypeScript", "MongoDB", "AWS", "Docker", "Testing"],
    experienceLevel: "entry",
    industry: "Technology"
  },
  {
    id: "jr_2", 
    title: "Data Scientist",
    description: "Analyze data and build machine learning models",
    requiredSkills: ["Python", "Machine Learning", "Statistics", "SQL", "Data Analysis"],
    preferredSkills: ["TensorFlow", "Pandas", "R", "Deep Learning", "Cloud Computing"],
    experienceLevel: "mid",
    industry: "Technology"
  },
  {
    id: "jr_3",
    title: "Project Manager",
    description: "Lead and coordinate project teams",
    requiredSkills: ["Leadership", "Communication", "Planning", "Agile", "Risk Management"],
    preferredSkills: ["PMP", "Scrum Master", "Budget Management", "Team Building", "Stakeholder Management"],
    experienceLevel: "mid",
    industry: "Management"
  },
  {
    id: "jr_4",
    title: "UI/UX Designer",
    description: "Design user interfaces and experiences",
    requiredSkills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Thinking"],
    preferredSkills: ["Adobe Creative Suite", "HTML/CSS", "JavaScript", "Accessibility", "Animation"],
    experienceLevel: "entry",
    industry: "Design"
  },
  {
    id: "jr_5",
    title: "DevOps Engineer",
    description: "Manage infrastructure and deployment pipelines",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
    preferredSkills: ["Terraform", "Monitoring", "Security", "Python", "Cloud Architecture"],
    experienceLevel: "mid",
    industry: "Technology"
  }
];

// Mock skill extraction and categorization
function extractSkillsFromCertificate(certificateTitle: string): string[] {
  const skillMap: Record<string, string[]> = {
    "javascript": ["JavaScript", "Programming", "Web Development"],
    "react": ["React", "JavaScript", "Frontend Development", "UI/UX"],
    "python": ["Python", "Programming", "Data Science", "Backend Development"],
    "machine learning": ["Machine Learning", "Python", "Data Science", "AI", "Statistics"],
    "data science": ["Data Science", "Python", "Statistics", "Data Analysis", "Machine Learning"],
    "project management": ["Project Management", "Leadership", "Planning", "Communication"],
    "leadership": ["Leadership", "Team Management", "Communication", "Strategic Thinking"],
    "design": ["UI/UX Design", "Figma", "Creative Design", "User Experience"],
    "cloud": ["Cloud Computing", "AWS", "DevOps", "Infrastructure"],
    "database": ["Database Management", "SQL", "Data Modeling", "Backend Development"],
    "mobile": ["Mobile Development", "React Native", "iOS", "Android"],
    "security": ["Cybersecurity", "Security", "Risk Management", "Compliance"],
    "networking": ["Networking", "System Administration", "Infrastructure", "Security"],
    "testing": ["Testing", "Quality Assurance", "Automation", "Software Testing"],
    "agile": ["Agile", "Scrum", "Project Management", "Team Collaboration"]
  };

  const title = certificateTitle.toLowerCase();
  const skills: string[] = [];
  
  for (const [keyword, skillList] of Object.entries(skillMap)) {
    if (title.includes(keyword)) {
      skills.push(...skillList);
    }
  }
  
  // Add some generic skills if no specific matches
  if (skills.length === 0) {
    skills.push("Problem Solving", "Communication", "Learning");
  }
  
  return [...new Set(skills)]; // Remove duplicates
}

function categorizeCertificate(certificateTitle: string, skills: string[]): 'academic' | 'professional' | 'technical' | 'leadership' | 'creative' {
  const title = certificateTitle.toLowerCase();
  
  if (title.includes('leadership') || title.includes('management') || skills.some(s => s.toLowerCase().includes('leadership'))) {
    return 'leadership';
  }
  if (title.includes('design') || title.includes('ui') || title.includes('ux') || skills.some(s => s.toLowerCase().includes('design'))) {
    return 'creative';
  }
  if (title.includes('data') || title.includes('machine learning') || title.includes('python') || skills.some(s => s.toLowerCase().includes('data'))) {
    return 'technical';
  }
  if (title.includes('project') || title.includes('business') || skills.some(s => s.toLowerCase().includes('management'))) {
    return 'professional';
  }
  
  return 'academic';
}

function calculateRelevanceScore(skills: string[], jobSkills: string[]): number {
  const matchedSkills = skills.filter(skill => 
    jobSkills.some(jobSkill => 
      skill.toLowerCase().includes(jobSkill.toLowerCase()) || 
      jobSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  return Math.round((matchedSkills.length / jobSkills.length) * 100);
}

export const generatePortfolio: RequestHandler = async (req, res) => {
  try {
    const { studentId, includeAllCertificates = true, selectedCertificates = [] }: GeneratePortfolioRequest = req.body;
    
    // In a real application, you would fetch certificates from database
    // For now, we'll simulate with mock data
    const mockCertificates = [
      { id: "cert_1", studentId, title: "JavaScript Fundamentals", activityId: "act_1" },
      { id: "cert_2", studentId, title: "React Development Workshop", activityId: "act_2" },
      { id: "cert_3", studentId, title: "Python for Data Science", activityId: "act_3" },
      { id: "cert_4", studentId, title: "Leadership Skills Training", activityId: "act_4" },
      { id: "cert_5", studentId, title: "UI/UX Design Principles", activityId: "act_5" }
    ];
    
    const certificatesToProcess = includeAllCertificates 
      ? mockCertificates 
      : mockCertificates.filter(cert => selectedCertificates.includes(cert.id));
    
    const portfolioItems: PortfolioItem[] = certificatesToProcess.map(cert => {
      const skills = extractSkillsFromCertificate(cert.title);
      const category = categorizeCertificate(cert.title, skills);
      
      return {
        id: `portfolio_${cert.id}`,
        studentId: cert.studentId,
        certificateId: cert.id,
        title: cert.title,
        description: `Portfolio item generated from ${cert.title} certificate. Demonstrates expertise in ${skills.slice(0, 3).join(', ')}.`,
        skills,
        category,
        relevanceScore: 85, // Mock score
        generatedAt: Date.now()
      };
    });
    
    const response: GeneratePortfolioResponse = {
      portfolioItems,
      totalItems: portfolioItems.length,
      generatedAt: Date.now()
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error generating portfolio:', error);
    res.status(500).json({ error: 'Failed to generate portfolio' });
  }
};

export const analyzeCertificates: RequestHandler = async (req, res) => {
  try {
    const { studentId, jobRoleId }: AnalyzeCertificatesRequest = req.body;
    
    // Mock certificates data
    const mockCertificates = [
      { id: "cert_1", studentId, title: "JavaScript Fundamentals", activityId: "act_1" },
      { id: "cert_2", studentId, title: "React Development Workshop", activityId: "act_2" },
      { id: "cert_3", studentId, title: "Python for Data Science", activityId: "act_3" },
      { id: "cert_4", studentId, title: "Leadership Skills Training", activityId: "act_4" },
      { id: "cert_5", studentId, title: "UI/UX Design Principles", activityId: "act_5" }
    ];
    
    const analysis: CertificateAnalysis[] = mockCertificates.map(cert => {
      const skills = extractSkillsFromCertificate(cert.title);
      const category = categorizeCertificate(cert.title, skills);
      
      // Calculate job matches
      const jobMatches: JobRoleMatch[] = JOB_ROLES.map(job => {
        const matchScore = calculateRelevanceScore(skills, [...job.requiredSkills, ...job.preferredSkills]);
        const matchedSkills = skills.filter(skill => 
          [...job.requiredSkills, ...job.preferredSkills].some(jobSkill => 
            skill.toLowerCase().includes(jobSkill.toLowerCase()) || 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        const missingSkills = job.requiredSkills.filter(jobSkill => 
          !skills.some(skill => 
            skill.toLowerCase().includes(jobSkill.toLowerCase()) || 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        
        return {
          jobRoleId: job.id,
          jobTitle: job.title,
          matchScore,
          matchedSkills,
          missingSkills,
          suggestions: missingSkills.slice(0, 3) // Top 3 missing skills as suggestions
        };
      }).filter(match => match.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
      
      return {
        certificateId: cert.id,
        title: cert.title,
        skills,
        category,
        relevanceScore: Math.max(...jobMatches.map(m => m.matchScore), 0),
        jobMatches: jobMatches.slice(0, 5) // Top 5 matches
      };
    });
    
    // Generate resume suggestions
    const resumeSuggestions: ResumeSuggestion[] = JOB_ROLES.map(job => {
      const relevantCerts = analysis.filter(a => 
        a.jobMatches.some(m => m.jobRoleId === job.id && m.matchScore > 30)
      );
      const overallMatch = relevantCerts.length > 0 
        ? Math.round(relevantCerts.reduce((sum, a) => sum + a.relevanceScore, 0) / relevantCerts.length)
        : 0;
      
      const priority: 'high' | 'medium' | 'low' = overallMatch > 70 ? 'high' : overallMatch > 40 ? 'medium' : 'low';
      
      return {
        jobRoleId: job.id,
        jobTitle: job.title,
        recommendedCertificates: relevantCerts.map(a => a.certificateId),
        overallMatch,
        reasoning: overallMatch > 70 
          ? `Strong match with ${relevantCerts.length} relevant certificates`
          : overallMatch > 40 
          ? `Moderate match with some relevant skills`
          : `Limited match - consider additional training in ${job.requiredSkills.slice(0, 3).join(', ')}`,
        priority
      };
    }).filter(s => s.overallMatch > 20).sort((a, b) => b.overallMatch - a.overallMatch);
    
    // Calculate overall profile
    const allSkills = [...new Set(analysis.flatMap(a => a.skills))];
    const skillCategories = analysis.reduce((acc, a) => {
      if (!acc[a.category]) acc[a.category] = [];
      acc[a.category].push(...a.skills);
      return acc;
    }, {} as Record<string, string[]>);
    
    const strengths = Object.entries(skillCategories)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 3)
      .map(([category]) => category);
    
    const improvementAreas = JOB_ROLES
      .flatMap(job => job.requiredSkills)
      .filter(skill => !allSkills.some(s => s.toLowerCase().includes(skill.toLowerCase())))
      .slice(0, 5);
    
    const response: AnalyzeCertificatesResponse = {
      analysis,
      resumeSuggestions,
      overallProfile: {
        totalSkills: allSkills,
        skillCategories,
        strengths,
        improvementAreas
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error analyzing certificates:', error);
    res.status(500).json({ error: 'Failed to analyze certificates' });
  }
};

export const getJobRoles: RequestHandler = async (req, res) => {
  try {
    res.json({ jobRoles: JOB_ROLES });
  } catch (error) {
    console.error('Error fetching job roles:', error);
    res.status(500).json({ error: 'Failed to fetch job roles' });
  }
};
