import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleRegister } from "./routes/auth";
import { generatePortfolio, analyzeCertificates, getJobRoles } from "./routes/portfolio";
import { 
  getActivities, 
  getActivityById, 
  createActivity, 
  applyToActivity, 
  getStudentApplications, 
  updateApplicationStatus 
} from "./routes/activities";
import { 
  getAttendanceByStudent, 
  getAttendanceByActivity, 
  markAttendance, 
  getAttendanceStats 
} from "./routes/attendance";
import { 
  getCertificatesByStudent, 
  getAllCertificates, 
  issueCertificate, 
  updateCertificateStatus, 
  getCertificateStats 
} from "./routes/certificates";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);

  // Portfolio and Analysis routes
  app.post("/api/portfolio/generate", generatePortfolio);
  app.post("/api/portfolio/analyze", analyzeCertificates);
  app.get("/api/portfolio/job-roles", getJobRoles);

  // Activities routes
  app.get("/api/activities", getActivities);
  app.get("/api/activities/:id", getActivityById);
  app.post("/api/activities", createActivity);
  app.post("/api/activities/apply", applyToActivity);
  app.get("/api/students/:studentId/applications", getStudentApplications);
  app.put("/api/applications/:applicationId/status", updateApplicationStatus);

  // Attendance routes
  app.get("/api/students/:studentId/attendance", getAttendanceByStudent);
  app.get("/api/activities/:activityId/attendance", getAttendanceByActivity);
  app.post("/api/activities/:activityId/attendance", markAttendance);
  app.get("/api/students/:studentId/attendance/stats", getAttendanceStats);

  // Certificates routes
  app.get("/api/students/:studentId/certificates", getCertificatesByStudent);
  app.get("/api/certificates", getAllCertificates);
  app.post("/api/certificates/issue", issueCertificate);
  app.put("/api/certificates/:certificateId/status", updateCertificateStatus);
  app.get("/api/certificates/stats", getCertificateStats);

  return app;
}
