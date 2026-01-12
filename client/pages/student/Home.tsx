import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, FileBadge2, FileText, BarChart3, Gauge, GraduationCap, LineChart, NotebookPen, Table2, TicketCheck, Target, Upload, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudentHome() {
  const { user } = useAuth();

  const quickActions = [
    { title: "Dashboard", description: "View your academic overview", icon: Gauge, href: "/student/dashboard" },
    { title: "Courses", description: "Browse enrolled courses", icon: BookOpen, href: "/student/academic/courses" },
    { title: "Attendance", description: "Check attendance records", icon: Table2, href: "/student/academic/attendance" },
    { title: "Performance", description: "View grades and analytics", icon: LineChart, href: "/student/academic/performance" },
    { title: "Activities", description: "Explore opportunities", icon: CheckCircle2, href: "/student/non-academic/activities" },
    { title: "My Activities", description: "Track your applications", icon: TicketCheck, href: "/student/non-academic/my-activities" },
    { title: "Portfolio", description: "Manage your portfolio", icon: FileBadge2, href: "/student/portfolio" },
    { title: "Certificate Analysis", description: "AI-powered career insights", icon: BarChart3, href: "/student/certificate-analysis" },
    { title: "Resume Builder", description: "Build your resume with AI", icon: FileText, href: "/student/resume-builder" },
    { title: "Resume Suggestions", description: "Which certificates to include", icon: Target, href: "/student/resume-suggestions" },
    { title: "OCR Processor", description: "Extract text from certificates", icon: Upload, href: "/student/ocr-processor" },
    { title: "Event Suggestions", description: "Find workshops & internships", icon: Calendar, href: "/student/event-suggestions" },
    { title: "Certificates", description: "View certificates", icon: GraduationCap, href: "/student/certificates" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "Student"}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your academic journey.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">+2 from last semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Table2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">8 completed, 4 ongoing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <FileBadge2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 pending approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most used features</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <action.icon className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest academic updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Certificate approved</p>
                <p className="text-xs text-muted-foreground">Data Structures Workshop - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New activity available</p>
                <p className="text-xs text-muted-foreground">Machine Learning Seminar - 1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Attendance marked</p>
                <p className="text-xs text-muted-foreground">Algorithms Class - 2 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}