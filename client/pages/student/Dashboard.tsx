import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { 
  TrendingUp, 
  Calendar, 
  FileText, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendancePercentage: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
  };
  certificates: {
    total: number;
    issued: number;
    pending: number;
  };
}

const grades = [
  { subject: "Math", score: 88 },
  { subject: "Physics", score: 76 },
  { subject: "Chem", score: 92 },
  { subject: "English", score: 84 },
  { subject: "CS", score: 95 },
];

const cgpa = Number((grades.reduce((s, g) => s + g.score, 0) / grades.length / 10).toFixed(2));

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch attendance stats
      const attendanceRes = await fetch(`/api/students/${user?.id}/attendance/stats`);
      const attendanceData = await attendanceRes.json();
      
      // Fetch applications
      const applicationsRes = await fetch(`/api/students/${user?.id}/applications`);
      const applicationsData = await applicationsRes.json();
      
      // Fetch certificates
      const certificatesRes = await fetch(`/api/students/${user?.id}/certificates`);
      const certificatesData = await certificatesRes.json();
      
      const applications = applicationsData.applications || [];
      const certificates = certificatesData.certificates || [];
      
      setStats({
        attendance: attendanceData,
        applications: {
          total: applications.length,
          pending: applications.filter((app: any) => app.status === 'pending').length,
          approved: applications.filter((app: any) => app.status === 'approved').length,
          completed: applications.filter((app: any) => app.status === 'completed').length,
        },
        certificates: {
          total: certificates.length,
          issued: certificates.filter((cert: any) => cert.status === 'issued').length,
          pending: certificates.filter((cert: any) => cert.status === 'pending').length,
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceData = stats?.attendance ? [
    { name: 'Present', value: stats.attendance.presentDays, color: '#10b981' },
    { name: 'Absent', value: stats.attendance.absentDays, color: '#ef4444' },
    { name: 'Late', value: stats.attendance.lateDays, color: '#f59e0b' },
    { name: 'Excused', value: stats.attendance.excusedDays, color: '#6b7280' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Quick snapshot of your academic progress.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.attendance.attendancePercentage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.attendance.presentDays || 0} of {stats?.attendance.totalDays || 0} days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.applications.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.applications.completed || 0} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.certificates.issued || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.certificates.pending || 0} pending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CGPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cgpa}</div>
            <p className="text-xs text-muted-foreground">Out of 10</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Academic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grades}>
                  <XAxis dataKey="subject" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {attendanceData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">JavaScript Workshop</p>
                <p className="text-xs text-muted-foreground">Completed • 2 days ago</p>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">React Bootcamp</p>
                <p className="text-xs text-muted-foreground">In Progress • 5 days left</p>
              </div>
              <Badge variant="outline">Ongoing</Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">UI/UX Design</p>
                <p className="text-xs text-muted-foreground">Starts in 3 days</p>
              </div>
              <Badge variant="secondary">Upcoming</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">JavaScript Fundamentals</span>
              </div>
              <Badge variant="default">Issued</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Leadership Training</span>
              </div>
              <Badge variant="default">Issued</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">React Development</span>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/student/portfolio">View Portfolio</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/student/certificate-analysis">Analyze Certificates</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/student/resume-builder">Build Resume</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
