import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import fs from "fs";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const DATA_DIR$3 = path.resolve(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR$3, "users.json");
function ensureStore() {
  if (!fs.existsSync(DATA_DIR$3)) fs.mkdirSync(DATA_DIR$3, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
}
function readDb() {
  ensureStore();
  const raw = fs.readFileSync(USERS_FILE, "utf8");
  return JSON.parse(raw);
}
function writeDb(db) {
  ensureStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify(db, null, 2));
}
function hashPassword(pw) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pw);
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = hash * 31 + data[i] | 0;
  return `h${hash >>> 0}`;
}
const handleRegister = (req, res) => {
  const body = req.body;
  if (!body?.identifier || !body?.password || !body?.name) {
    return res.status(400).json({ error: "identifier, name and password are required" });
  }
  const db = readDb();
  const exists = db.users.find((u) => u.identifier.toLowerCase() === body.identifier.toLowerCase());
  if (exists) return res.status(409).json({ error: "User already exists" });
  const now = Date.now();
  const user = {
    id: randomUUID(),
    identifier: body.identifier,
    name: body.name,
    role: body.role ?? "student",
    createdAt: now,
    passwordHash: hashPassword(body.password)
  };
  db.users.push(user);
  writeDb(db);
  const { passwordHash, ...dto } = user;
  return res.status(201).json({ user: dto });
};
const handleLogin = (req, res) => {
  const body = req.body;
  if (!body?.identifier || !body?.password) {
    return res.status(400).json({ error: "identifier and password are required" });
  }
  const db = readDb();
  const user = db.users.find((u) => u.identifier.toLowerCase() === body.identifier.toLowerCase());
  if (!user) return res.status(404).json({ error: "No registered user with that identifier" });
  if (user.passwordHash !== hashPassword(body.password)) return res.status(401).json({ error: "Invalid credentials" });
  const { passwordHash, ...dto } = user;
  return res.json({ user: dto });
};
const JOB_ROLES = [
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
function extractSkillsFromCertificate(certificateTitle) {
  const skillMap = {
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
  const skills = [];
  for (const [keyword, skillList] of Object.entries(skillMap)) {
    if (title.includes(keyword)) {
      skills.push(...skillList);
    }
  }
  if (skills.length === 0) {
    skills.push("Problem Solving", "Communication", "Learning");
  }
  return [...new Set(skills)];
}
function categorizeCertificate(certificateTitle, skills) {
  const title = certificateTitle.toLowerCase();
  if (title.includes("leadership") || title.includes("management") || skills.some((s) => s.toLowerCase().includes("leadership"))) {
    return "leadership";
  }
  if (title.includes("design") || title.includes("ui") || title.includes("ux") || skills.some((s) => s.toLowerCase().includes("design"))) {
    return "creative";
  }
  if (title.includes("data") || title.includes("machine learning") || title.includes("python") || skills.some((s) => s.toLowerCase().includes("data"))) {
    return "technical";
  }
  if (title.includes("project") || title.includes("business") || skills.some((s) => s.toLowerCase().includes("management"))) {
    return "professional";
  }
  return "academic";
}
function calculateRelevanceScore(skills, jobSkills) {
  const matchedSkills = skills.filter(
    (skill) => jobSkills.some(
      (jobSkill) => skill.toLowerCase().includes(jobSkill.toLowerCase()) || jobSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  return Math.round(matchedSkills.length / jobSkills.length * 100);
}
const generatePortfolio = async (req, res) => {
  try {
    const { studentId, includeAllCertificates = true, selectedCertificates = [] } = req.body;
    const mockCertificates = [
      { id: "cert_1", studentId, title: "JavaScript Fundamentals", activityId: "act_1" },
      { id: "cert_2", studentId, title: "React Development Workshop", activityId: "act_2" },
      { id: "cert_3", studentId, title: "Python for Data Science", activityId: "act_3" },
      { id: "cert_4", studentId, title: "Leadership Skills Training", activityId: "act_4" },
      { id: "cert_5", studentId, title: "UI/UX Design Principles", activityId: "act_5" }
    ];
    const certificatesToProcess = includeAllCertificates ? mockCertificates : mockCertificates.filter((cert) => selectedCertificates.includes(cert.id));
    const portfolioItems = certificatesToProcess.map((cert) => {
      const skills = extractSkillsFromCertificate(cert.title);
      const category = categorizeCertificate(cert.title, skills);
      return {
        id: `portfolio_${cert.id}`,
        studentId: cert.studentId,
        certificateId: cert.id,
        title: cert.title,
        description: `Portfolio item generated from ${cert.title} certificate. Demonstrates expertise in ${skills.slice(0, 3).join(", ")}.`,
        skills,
        category,
        relevanceScore: 85,
        // Mock score
        generatedAt: Date.now()
      };
    });
    const response = {
      portfolioItems,
      totalItems: portfolioItems.length,
      generatedAt: Date.now()
    };
    res.json(response);
  } catch (error) {
    console.error("Error generating portfolio:", error);
    res.status(500).json({ error: "Failed to generate portfolio" });
  }
};
const analyzeCertificates = async (req, res) => {
  try {
    const { studentId, jobRoleId } = req.body;
    const mockCertificates = [
      { id: "cert_1", studentId, title: "JavaScript Fundamentals", activityId: "act_1" },
      { id: "cert_2", studentId, title: "React Development Workshop", activityId: "act_2" },
      { id: "cert_3", studentId, title: "Python for Data Science", activityId: "act_3" },
      { id: "cert_4", studentId, title: "Leadership Skills Training", activityId: "act_4" },
      { id: "cert_5", studentId, title: "UI/UX Design Principles", activityId: "act_5" }
    ];
    const analysis = mockCertificates.map((cert) => {
      const skills = extractSkillsFromCertificate(cert.title);
      const category = categorizeCertificate(cert.title, skills);
      const jobMatches = JOB_ROLES.map((job) => {
        const matchScore = calculateRelevanceScore(skills, [...job.requiredSkills, ...job.preferredSkills]);
        const matchedSkills = skills.filter(
          (skill) => [...job.requiredSkills, ...job.preferredSkills].some(
            (jobSkill) => skill.toLowerCase().includes(jobSkill.toLowerCase()) || jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        const missingSkills = job.requiredSkills.filter(
          (jobSkill) => !skills.some(
            (skill) => skill.toLowerCase().includes(jobSkill.toLowerCase()) || jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        return {
          jobRoleId: job.id,
          jobTitle: job.title,
          matchScore,
          matchedSkills,
          missingSkills,
          suggestions: missingSkills.slice(0, 3)
          // Top 3 missing skills as suggestions
        };
      }).filter((match) => match.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
      return {
        certificateId: cert.id,
        title: cert.title,
        skills,
        category,
        relevanceScore: Math.max(...jobMatches.map((m) => m.matchScore), 0),
        jobMatches: jobMatches.slice(0, 5)
        // Top 5 matches
      };
    });
    const resumeSuggestions = JOB_ROLES.map((job) => {
      const relevantCerts = analysis.filter(
        (a) => a.jobMatches.some((m) => m.jobRoleId === job.id && m.matchScore > 30)
      );
      const overallMatch = relevantCerts.length > 0 ? Math.round(relevantCerts.reduce((sum, a) => sum + a.relevanceScore, 0) / relevantCerts.length) : 0;
      const priority = overallMatch > 70 ? "high" : overallMatch > 40 ? "medium" : "low";
      return {
        jobRoleId: job.id,
        jobTitle: job.title,
        recommendedCertificates: relevantCerts.map((a) => a.certificateId),
        overallMatch,
        reasoning: overallMatch > 70 ? `Strong match with ${relevantCerts.length} relevant certificates` : overallMatch > 40 ? `Moderate match with some relevant skills` : `Limited match - consider additional training in ${job.requiredSkills.slice(0, 3).join(", ")}`,
        priority
      };
    }).filter((s) => s.overallMatch > 20).sort((a, b) => b.overallMatch - a.overallMatch);
    const allSkills = [...new Set(analysis.flatMap((a) => a.skills))];
    const skillCategories = analysis.reduce((acc, a) => {
      if (!acc[a.category]) acc[a.category] = [];
      acc[a.category].push(...a.skills);
      return acc;
    }, {});
    const strengths = Object.entries(skillCategories).sort(([, a], [, b]) => b.length - a.length).slice(0, 3).map(([category]) => category);
    const improvementAreas = JOB_ROLES.flatMap((job) => job.requiredSkills).filter((skill) => !allSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))).slice(0, 5);
    const response = {
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
    console.error("Error analyzing certificates:", error);
    res.status(500).json({ error: "Failed to analyze certificates" });
  }
};
const getJobRoles = async (req, res) => {
  try {
    res.json({ jobRoles: JOB_ROLES });
  } catch (error) {
    console.error("Error fetching job roles:", error);
    res.status(500).json({ error: "Failed to fetch job roles" });
  }
};
const DATA_DIR$2 = path.resolve(process.cwd(), "data");
const ACTIVITIES_FILE$2 = path.join(DATA_DIR$2, "activities.json");
const APPLICATIONS_FILE = path.join(DATA_DIR$2, "student_applications.json");
function readActivities$2() {
  if (!fs.existsSync(ACTIVITIES_FILE$2)) {
    return { activities: [] };
  }
  const raw = fs.readFileSync(ACTIVITIES_FILE$2, "utf8");
  return JSON.parse(raw);
}
function writeActivities(db) {
  fs.writeFileSync(ACTIVITIES_FILE$2, JSON.stringify(db, null, 2));
}
function readApplications() {
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    return { applications: [] };
  }
  const raw = fs.readFileSync(APPLICATIONS_FILE, "utf8");
  return JSON.parse(raw);
}
function writeApplications(db) {
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(db, null, 2));
}
const getActivities = (req, res) => {
  try {
    const { type, category, status } = req.query;
    const db = readActivities$2();
    let activities = db.activities;
    if (type) {
      activities = activities.filter((activity) => activity.type === type);
    }
    if (category) {
      activities = activities.filter((activity) => activity.category === category);
    }
    if (status) {
      activities = activities.filter((activity) => activity.status === status);
    }
    res.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};
const getActivityById = (req, res) => {
  try {
    const { id } = req.params;
    const db = readActivities$2();
    const activity = db.activities.find((a) => a.id === id);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json({ activity });
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
};
const createActivity = (req, res) => {
  try {
    const activityData = req.body;
    const db = readActivities$2();
    const newActivity = {
      id: randomUUID(),
      ...activityData,
      currentParticipants: 0,
      createdAt: Date.now()
    };
    db.activities.push(newActivity);
    writeActivities(db);
    res.status(201).json({ activity: newActivity });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Failed to create activity" });
  }
};
const applyToActivity = (req, res) => {
  try {
    const { studentId, activityId } = req.body;
    const activitiesDb = readActivities$2();
    const applicationsDb = readApplications();
    const activity = activitiesDb.activities.find((a) => a.id === activityId);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    const existingApplication = applicationsDb.applications.find(
      (app2) => app2.studentId === studentId && app2.activityId === activityId
    );
    if (existingApplication) {
      return res.status(409).json({ error: "Already applied to this activity" });
    }
    if (activity.currentParticipants >= activity.maxParticipants) {
      return res.status(400).json({ error: "Activity is full" });
    }
    const newApplication = {
      id: randomUUID(),
      studentId,
      activityId,
      status: "pending",
      appliedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      approvedDate: null,
      approvedBy: null,
      notes: "",
      createdAt: Date.now()
    };
    applicationsDb.applications.push(newApplication);
    writeApplications(applicationsDb);
    res.status(201).json({ application: newApplication });
  } catch (error) {
    console.error("Error applying to activity:", error);
    res.status(500).json({ error: "Failed to apply to activity" });
  }
};
const getStudentApplications = (req, res) => {
  try {
    const { studentId } = req.params;
    const applicationsDb = readApplications();
    const activitiesDb = readActivities$2();
    const applications = applicationsDb.applications.filter((app2) => app2.studentId === studentId).map((app2) => {
      const activity = activitiesDb.activities.find((a) => a.id === app2.activityId);
      return {
        ...app2,
        activity: activity || null
      };
    });
    res.json({ applications });
  } catch (error) {
    console.error("Error fetching student applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};
const updateApplicationStatus = (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes, approvedBy } = req.body;
    const applicationsDb = readApplications();
    const application = applicationsDb.applications.find((app2) => app2.id === applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    application.status = status;
    application.notes = notes || application.notes;
    if (status === "approved") {
      application.approvedDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      application.approvedBy = approvedBy;
      const activitiesDb = readActivities$2();
      const activity = activitiesDb.activities.find((a) => a.id === application.activityId);
      if (activity) {
        activity.currentParticipants += 1;
        writeActivities(activitiesDb);
      }
    }
    writeApplications(applicationsDb);
    res.json({ application });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: "Failed to update application status" });
  }
};
const DATA_DIR$1 = path.resolve(process.cwd(), "data");
const ATTENDANCE_FILE = path.join(DATA_DIR$1, "attendance.json");
const ACTIVITIES_FILE$1 = path.join(DATA_DIR$1, "activities.json");
function readAttendance() {
  if (!fs.existsSync(ATTENDANCE_FILE)) {
    return { attendance: [] };
  }
  const raw = fs.readFileSync(ATTENDANCE_FILE, "utf8");
  return JSON.parse(raw);
}
function writeAttendance(db) {
  fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(db, null, 2));
}
function readActivities$1() {
  if (!fs.existsSync(ACTIVITIES_FILE$1)) {
    return { activities: [] };
  }
  const raw = fs.readFileSync(ACTIVITIES_FILE$1, "utf8");
  return JSON.parse(raw);
}
const getAttendanceByStudent = (req, res) => {
  try {
    const { studentId } = req.params;
    const { activityId, startDate, endDate } = req.query;
    const attendanceDb = readAttendance();
    const activitiesDb = readActivities$1();
    let attendance = attendanceDb.attendance.filter((record) => record.studentId === studentId);
    if (activityId) {
      attendance = attendance.filter((record) => record.activityId === activityId);
    }
    if (startDate && endDate) {
      attendance = attendance.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
      });
    }
    const attendanceWithDetails = attendance.map((record) => {
      const activity = activitiesDb.activities.find((a) => a.id === record.activityId);
      return {
        ...record,
        activity: activity || null
      };
    });
    res.json({ attendance: attendanceWithDetails });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};
const getAttendanceByActivity = (req, res) => {
  try {
    const { activityId } = req.params;
    const { date } = req.query;
    const attendanceDb = readAttendance();
    const activitiesDb = readActivities$1();
    let attendance = attendanceDb.attendance.filter((record) => record.activityId === activityId);
    if (date) {
      attendance = attendance.filter((record) => record.date === date);
    }
    const activity = activitiesDb.activities.find((a) => a.id === activityId);
    res.json({
      attendance,
      activity: activity || null
    });
  } catch (error) {
    console.error("Error fetching attendance by activity:", error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};
const markAttendance = (req, res) => {
  try {
    const { activityId } = req.params;
    const { studentId, status, notes, markedBy } = req.body;
    const date = req.body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const attendanceDb = readAttendance();
    const existingRecord = attendanceDb.attendance.find(
      (record) => record.studentId === studentId && record.activityId === activityId && record.date === date
    );
    if (existingRecord) {
      existingRecord.status = status;
      existingRecord.notes = notes || existingRecord.notes;
      existingRecord.markedBy = markedBy;
    } else {
      const newRecord = {
        id: randomUUID(),
        studentId,
        activityId,
        date,
        status,
        markedBy,
        notes: notes || "",
        createdAt: Date.now()
      };
      attendanceDb.attendance.push(newRecord);
    }
    writeAttendance(attendanceDb);
    res.json({
      message: "Attendance marked successfully",
      attendance: existingRecord || attendanceDb.attendance[attendanceDb.attendance.length - 1]
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
};
const getAttendanceStats = (req, res) => {
  try {
    const { studentId } = req.params;
    const { activityId } = req.query;
    const attendanceDb = readAttendance();
    let records = attendanceDb.attendance.filter((record) => record.studentId === studentId);
    if (activityId) {
      records = records.filter((record) => record.activityId === activityId);
    }
    const totalDays = records.length;
    const presentDays = records.filter((record) => record.status === "present").length;
    const absentDays = records.filter((record) => record.status === "absent").length;
    const lateDays = records.filter((record) => record.status === "late").length;
    const excusedDays = records.filter((record) => record.status === "excused").length;
    const attendancePercentage = totalDays > 0 ? Math.round(presentDays / totalDays * 100) : 0;
    res.json({
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendancePercentage
    });
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    res.status(500).json({ error: "Failed to fetch attendance statistics" });
  }
};
const DATA_DIR = path.resolve(process.cwd(), "data");
const CERTIFICATES_FILE = path.join(DATA_DIR, "certificates.json");
const ACTIVITIES_FILE = path.join(DATA_DIR, "activities.json");
function readCertificates() {
  if (!fs.existsSync(CERTIFICATES_FILE)) {
    return { certificates: [] };
  }
  const raw = fs.readFileSync(CERTIFICATES_FILE, "utf8");
  return JSON.parse(raw);
}
function writeCertificates(db) {
  fs.writeFileSync(CERTIFICATES_FILE, JSON.stringify(db, null, 2));
}
function readActivities() {
  if (!fs.existsSync(ACTIVITIES_FILE)) {
    return { activities: [] };
  }
  const raw = fs.readFileSync(ACTIVITIES_FILE, "utf8");
  return JSON.parse(raw);
}
const getCertificatesByStudent = (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;
    const certificatesDb = readCertificates();
    const activitiesDb = readActivities();
    let certificates = certificatesDb.certificates.filter((cert) => cert.studentId === studentId);
    if (status) {
      certificates = certificates.filter((cert) => cert.status === status);
    }
    const certificatesWithDetails = certificates.map((cert) => {
      const activity = activitiesDb.activities.find((a) => a.id === cert.activityId);
      return {
        ...cert,
        activity: activity || null
      };
    });
    res.json({ certificates: certificatesWithDetails });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
};
const getAllCertificates = (req, res) => {
  try {
    const { status, category } = req.query;
    const certificatesDb = readCertificates();
    const activitiesDb = readActivities();
    let certificates = certificatesDb.certificates;
    if (status) {
      certificates = certificates.filter((cert) => cert.status === status);
    }
    if (category) {
      certificates = certificates.filter((cert) => cert.category === category);
    }
    const certificatesWithDetails = certificates.map((cert) => {
      const activity = activitiesDb.activities.find((a) => a.id === cert.activityId);
      return {
        ...cert,
        activity: activity || null
      };
    });
    res.json({ certificates: certificatesWithDetails });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
};
const issueCertificate = (req, res) => {
  try {
    const { studentId, activityId, grade, notes } = req.body;
    const certificatesDb = readCertificates();
    const activitiesDb = readActivities();
    const activity = activitiesDb.activities.find((a) => a.id === activityId);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    const existingCert = certificatesDb.certificates.find(
      (cert) => cert.studentId === studentId && cert.activityId === activityId
    );
    if (existingCert) {
      return res.status(409).json({ error: "Certificate already exists for this activity" });
    }
    const newCertificate = {
      id: randomUUID(),
      studentId,
      activityId,
      title: activity.title,
      description: `Successfully completed ${activity.title}`,
      issuedBy: req.body.issuedBy || "System",
      issuedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      status: "issued",
      filePath: `/certificates/${activity.title.toLowerCase().replace(/\s+/g, "_")}_${studentId}.pdf`,
      skills: activity.skills,
      category: activity.category,
      grade: grade || null,
      validUntil: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
      // 2 years from now
      createdAt: Date.now()
    };
    certificatesDb.certificates.push(newCertificate);
    writeCertificates(certificatesDb);
    res.status(201).json({ certificate: newCertificate });
  } catch (error) {
    console.error("Error issuing certificate:", error);
    res.status(500).json({ error: "Failed to issue certificate" });
  }
};
const updateCertificateStatus = (req, res) => {
  try {
    const { certificateId } = req.params;
    const { status, grade, notes } = req.body;
    const certificatesDb = readCertificates();
    const certificate = certificatesDb.certificates.find((cert) => cert.id === certificateId);
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    certificate.status = status;
    if (grade) certificate.grade = grade;
    writeCertificates(certificatesDb);
    res.json({ certificate });
  } catch (error) {
    console.error("Error updating certificate status:", error);
    res.status(500).json({ error: "Failed to update certificate status" });
  }
};
const getCertificateStats = (req, res) => {
  try {
    const certificatesDb = readCertificates();
    const totalCertificates = certificatesDb.certificates.length;
    const issuedCertificates = certificatesDb.certificates.filter((cert) => cert.status === "issued").length;
    const pendingCertificates = certificatesDb.certificates.filter((cert) => cert.status === "pending").length;
    const rejectedCertificates = certificatesDb.certificates.filter((cert) => cert.status === "rejected").length;
    const categoryStats = certificatesDb.certificates.reduce((acc, cert) => {
      acc[cert.category] = (acc[cert.category] || 0) + 1;
      return acc;
    }, {});
    const monthlyStats = certificatesDb.certificates.filter((cert) => cert.status === "issued").reduce((acc, cert) => {
      const month = new Date(cert.issuedDate).toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    res.json({
      total: totalCertificates,
      issued: issuedCertificates,
      pending: pendingCertificates,
      rejected: rejectedCertificates,
      categoryStats,
      monthlyStats
    });
  } catch (error) {
    console.error("Error fetching certificate stats:", error);
    res.status(500).json({ error: "Failed to fetch certificate statistics" });
  }
};
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.get("/api/demo", handleDemo);
  app2.post("/api/auth/register", handleRegister);
  app2.post("/api/auth/login", handleLogin);
  app2.post("/api/portfolio/generate", generatePortfolio);
  app2.post("/api/portfolio/analyze", analyzeCertificates);
  app2.get("/api/portfolio/job-roles", getJobRoles);
  app2.get("/api/activities", getActivities);
  app2.get("/api/activities/:id", getActivityById);
  app2.post("/api/activities", createActivity);
  app2.post("/api/activities/apply", applyToActivity);
  app2.get("/api/students/:studentId/applications", getStudentApplications);
  app2.put("/api/applications/:applicationId/status", updateApplicationStatus);
  app2.get("/api/students/:studentId/attendance", getAttendanceByStudent);
  app2.get("/api/activities/:activityId/attendance", getAttendanceByActivity);
  app2.post("/api/activities/:activityId/attendance", markAttendance);
  app2.get("/api/students/:studentId/attendance/stats", getAttendanceStats);
  app2.get("/api/students/:studentId/certificates", getCertificatesByStudent);
  app2.get("/api/certificates", getAllCertificates);
  app2.post("/api/certificates/issue", issueCertificate);
  app2.put("/api/certificates/:certificateId/status", updateCertificateStatus);
  app2.get("/api/certificates/stats", getCertificateStats);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
