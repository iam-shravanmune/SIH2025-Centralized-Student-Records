import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentLayout from "./pages/student/Layout";
import StudentHome from "./pages/student/Home";
import StudentDashboard from "./pages/student/Dashboard";
import TeacherLayout from "./pages/teacher/Layout";
import TeacherHome from "./pages/teacher/Home";
import CertificateIssuance from "./pages/teacher/CertificateIssuance";
import AttendanceBatch from "./pages/teacher/AttendanceBatch";
import ActivityValidation from "./pages/teacher/ActivityValidation";
import ClassesSchedule from "./pages/teacher/ClassesSchedule";
import SubjectAttendance from "./pages/teacher/SubjectAttendance";
import AdminLayout from "./pages/admin/Layout";
import AdminHome from "./pages/admin/Home";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";
import ReportsPrint from "./pages/admin/ReportsPrint";
import TeacherSettings from "./pages/teacher/Settings";
import TeacherChangePassword from "./pages/teacher/ChangePassword";
import Placeholder from "./pages/student/Placeholder";
import StudentSettings from "./pages/student/Settings";
import ChangePassword from "./pages/student/ChangePassword";
import StudentPortfolio from "./pages/student/Portfolio";
import CertificateAnalysis from "./pages/student/CertificateAnalysis";
import ResumeBuilder from "./pages/student/ResumeBuilder";
import ResumeSuggestions from "./pages/student/ResumeSuggestions";
import OCRProcessor from "./pages/student/OCRProcessor";
import EventSuggestions from "./pages/student/EventSuggestions";
import StudentActivities from "./pages/student/Activities";
import { AppStoreProvider } from "@/store/app-store";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Logo } from "@/components/Logo";

const queryClient = new QueryClient();

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size="md" />
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Docs</a>
          <a href="#" className="hover:text-foreground">Support</a>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t bg-background/50">
      <div className="container py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} GradFolio. All rights reserved.
      </div>
    </footer>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppStoreProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <SiteHeader />
              <main className="flex-1">
                <Routes>
                <Route path="/" element={<Index />} />

                <Route path="/student" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentLayout />
                  </ProtectedRoute>
                }>
                <Route index element={<StudentHome />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="academic">
                  <Route path="courses" element={<Placeholder title="Courses" description="Browse and manage your enrolled courses." />} />
                  <Route path="attendance" element={<Placeholder title="Attendance" description="Track your attendance records and history." />} />
                  <Route path="fees" element={<Placeholder title="Fees" description="View fee status, dues, and payment history." />} />
                  <Route path="performance" element={<Placeholder title="Performance" description="Analyze grades and performance metrics." />} />
                  <Route path="exam" element={<Placeholder title="Exam" description="Upcoming exams, schedules, and results." />} />
                </Route>
                <Route path="non-academic">
                  <Route path="activities" element={<StudentActivities />} />
                  <Route path="activities/session" element={<Placeholder title="Sessions" description="Academic and co-curricular sessions." />} />
                  <Route path="activities/workshop" element={<Placeholder title="Workshops" description="Hands-on workshops and events." />} />
                  <Route path="activities/internship" element={<Placeholder title="Internships" description="Internship opportunities and applications." />} />
                  <Route path="my-activities" element={<Placeholder title="My Activities" description="Applied, ongoing, and completed activities." />} />
                </Route>
                <Route path="portfolio" element={<StudentPortfolio />} />
                <Route path="certificate-analysis" element={<CertificateAnalysis />} />
                <Route path="resume-builder" element={<ResumeBuilder />} />
                <Route path="resume-suggestions" element={<ResumeSuggestions />} />
                <Route path="ocr-processor" element={<OCRProcessor />} />
                <Route path="event-suggestions" element={<EventSuggestions />} />
                <Route path="certificates" element={<Placeholder title="Certificates" description="Certificates pending and approved by faculty/admin." />} />
                <Route path="settings" element={<StudentSettings />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>

              <Route path="/teacher" element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherLayout />
                </ProtectedRoute>
              }>
                <Route index element={<TeacherHome />} />
                <Route path="classes" element={<ClassesSchedule />} />
                <Route path="attendance">
                  <Route path="batch" element={<AttendanceBatch />} />
                  <Route path="subject" element={<SubjectAttendance />} />
                </Route>
                <Route path="certificates" element={<CertificateIssuance />} />
                <Route path="validation" element={<ActivityValidation />} />
                <Route path="settings" element={<TeacherSettings />} />
                <Route path="change-password" element={<TeacherChangePassword />} />
              </Route>
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminHome />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="reports/print" element={<ReportsPrint />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <SiteFooter />
          </div>
          </BrowserRouter>
        </AppStoreProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
