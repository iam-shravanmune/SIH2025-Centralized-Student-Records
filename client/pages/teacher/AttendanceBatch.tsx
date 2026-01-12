import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, Users, CheckCircle2, XCircle, AlertCircle, Save, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
}

interface Activity {
  id: string;
  title: string;
  instructor: string;
  startDate: string;
  endDate: string;
  location: string;
}

export default function AttendanceBatch() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      fetchStudentsForActivity();
    }
  }, [selectedActivity]);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    }
  };

  const fetchStudentsForActivity = async () => {
    if (!selectedActivity) return;
    
    try {
      setLoading(true);
      // In a real app, you'd fetch students enrolled in this activity
      // For now, we'll use mock data
      const mockStudents: Student[] = [
        { id: "1", name: "John Doe", rollNumber: "2024001", email: "john@example.com" },
        { id: "2", name: "Jane Smith", rollNumber: "2024002", email: "jane@example.com" },
        { id: "3", name: "Mike Johnson", rollNumber: "2024003", email: "mike@example.com" },
        { id: "4", name: "Sarah Wilson", rollNumber: "2024004", email: "sarah@example.com" },
        { id: "5", name: "David Brown", rollNumber: "2024005", email: "david@example.com" },
      ];
      setStudents(mockStudents);
      
      // Initialize attendance records
      const initialRecords: Record<string, AttendanceRecord> = {};
      mockStudents.forEach(student => {
        initialRecords[student.id] = {
          studentId: student.id,
          status: 'present',
          notes: ''
        };
      });
      setAttendanceRecords(initialRecords);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceRecord = (studentId: string, field: keyof AttendanceRecord, value: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const submitAttendance = async () => {
    if (!selectedActivity || !user) return;
    
    try {
      setSubmitting(true);
      
      const attendanceData = Object.values(attendanceRecords).map(record => ({
        studentId: record.studentId,
        activityId: selectedActivity,
        date: selectedDate,
        status: record.status,
        notes: record.notes,
        markedBy: user.id
      }));

      const response = await fetch(`/api/activities/${selectedActivity}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Attendance marked successfully",
        });
        // Reset form
        setAttendanceRecords({});
        setSelectedActivity("");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to mark attendance",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      present: "text-green-600",
      absent: "text-red-600",
      late: "text-yellow-600",
      excused: "text-blue-600"
    };
    return colors[status as keyof typeof colors] || "text-gray-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'excused': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const selectedActivityData = activities.find(activity => activity.id === selectedActivity);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Batch Attendance</h1>
        <p className="text-muted-foreground">Mark attendance for students in activities</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedActivity} onValueChange={setSelectedActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Choose activity" />
              </SelectTrigger>
              <SelectContent>
                {activities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedActivityData ? (
              <div className="space-y-2 text-sm">
                <p><strong>Instructor:</strong> {selectedActivityData.instructor}</p>
                <p><strong>Location:</strong> {selectedActivityData.location}</p>
                <p><strong>Duration:</strong> {new Date(selectedActivityData.startDate).toLocaleDateString()} - {new Date(selectedActivityData.endDate).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Select an activity to view details</p>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedActivity && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>
              Mark attendance for {students.length} students on {new Date(selectedDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.rollNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Select 
                          value={attendanceRecords[student.id]?.status || 'present'} 
                          onValueChange={(value) => updateAttendanceRecord(student.id, 'status', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Present
                              </div>
                            </SelectItem>
                            <SelectItem value="absent">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500" />
                                Absent
                              </div>
                            </SelectItem>
                            <SelectItem value="late">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                                Late
                              </div>
                            </SelectItem>
                            <SelectItem value="excused">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-blue-500" />
                                Excused
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          placeholder="Optional notes" 
                          className="w-48"
                          value={attendanceRecords[student.id]?.notes || ''}
                          onChange={(e) => updateAttendanceRecord(student.id, 'notes', e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {selectedActivity && students.length > 0 && (
        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={submitAttendance}
            disabled={submitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {submitting ? "Saving..." : "Save Attendance"}
          </Button>
          <Button 
            onClick={submitAttendance}
            disabled={submitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Submitting..." : "Submit Attendance"}
          </Button>
        </div>
      )}

      {!selectedActivity && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select an activity to mark attendance for students.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}