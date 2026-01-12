import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Users, 
  Award, 
  BookOpen, 
  Calendar, 
  Activity,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalActivities: number;
  totalCertificates: number;
  totalAttendance: number;
  certificatesByMonth: Array<{ month: string; count: number }>;
  activitiesByCategory: Array<{ category: string; count: number }>;
  attendanceStats: {
    totalDays: number;
    presentDays: number;
    attendancePercentage: number;
  };
  userStats: {
    students: number;
    teachers: number;
    admins: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch certificates stats
      const certificatesRes = await fetch('/api/certificates/stats');
      const certificatesData = await certificatesRes.json();
      
      // Fetch activities
      const activitiesRes = await fetch('/api/activities');
      const activitiesData = await activitiesRes.json();
      
      // Mock additional data for comprehensive analytics
      const mockData: AnalyticsData = {
        totalUsers: 150,
        totalActivities: activitiesData.activities?.length || 0,
        totalCertificates: certificatesData.total || 0,
        totalAttendance: 1250,
        certificatesByMonth: [
          { month: '2024-01', count: 12 },
          { month: '2024-02', count: 18 },
          { month: '2024-03', count: 15 },
          { month: '2024-04', count: 22 },
          { month: '2024-05', count: 28 },
          { month: '2024-06', count: 25 },
        ],
        activitiesByCategory: [
          { category: 'Technical', count: 8 },
          { category: 'Academic', count: 12 },
          { category: 'Professional', count: 6 },
          { category: 'Leadership', count: 4 },
          { category: 'Creative', count: 3 },
        ],
        attendanceStats: {
          totalDays: 1250,
          presentDays: 1150,
          attendancePercentage: 92
        },
        userStats: {
          students: 120,
          teachers: 25,
          admins: 5
        },
        recentActivity: [
          { id: '1', type: 'certificate', description: 'Certificate issued for JavaScript Workshop', timestamp: '2 hours ago' },
          { id: '2', type: 'activity', description: 'New workshop: React Development Bootcamp', timestamp: '4 hours ago' },
          { id: '3', type: 'attendance', description: 'Attendance marked for 25 students', timestamp: '6 hours ago' },
          { id: '4', type: 'user', description: 'New student registered: John Doe', timestamp: '1 day ago' },
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No data available</h3>
        <p className="text-muted-foreground">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-muted-foreground">Comprehensive overview of system metrics and trends</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.attendanceStats.attendancePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.attendanceStats.presentDays} of {analyticsData.attendanceStats.totalDays} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Certificates Issued Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ count: { label: "Certificates", color: "hsl(var(--primary))" } }}
              className="h-64 w-full"
            >
              <BarChart data={analyticsData.certificatesByMonth}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} />
                <Bar dataKey="count" fill="var(--color-count)" radius={6} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Activities by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.activitiesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {analyticsData.activitiesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {analyticsData.activitiesByCategory.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm">{item.category}: {item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Students</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{analyticsData.userStats.students}</div>
                  <div className="text-xs text-muted-foreground">80% of total</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Teachers</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{analyticsData.userStats.teachers}</div>
                  <div className="text-xs text-muted-foreground">17% of total</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm">Admins</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{analyticsData.userStats.admins}</div>
                  <div className="text-xs text-muted-foreground">3% of total</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>System Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">{analyticsData.attendanceStats.attendancePercentage}%</div>
              <div className="text-sm text-muted-foreground">Average Attendance Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{analyticsData.totalActivities}</div>
              <div className="text-sm text-muted-foreground">Active Activities</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{analyticsData.totalCertificates}</div>
              <div className="text-sm text-muted-foreground">Certificates Issued</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}