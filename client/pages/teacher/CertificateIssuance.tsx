import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  Award, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Search,
  Filter,
  Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  title: string;
  instructor: string;
  startDate: string;
  endDate: string;
  status: string;
  currentParticipants: number;
  maxParticipants: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
}

interface Certificate {
  id: string;
  studentId: string;
  activityId: string;
  title: string;
  status: 'pending' | 'issued' | 'rejected';
  issuedDate: string;
  grade: string | null;
  student?: Student;
  activity?: Activity;
}

export default function CertificateIssuance() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [certificateTitle, setCertificateTitle] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchActivities();
    fetchStudents();
    fetchCertificates();
  }, []);

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

  const fetchStudents = async () => {
    try {
      // In a real app, you'd fetch from the users API
      const mockStudents: Student[] = [
        { id: "60e40305-2761-498e-bea1-3f73f5121879", name: "Parth Patil", email: "abc@gmail.com", rollNumber: "2024001" },
        { id: "bd7bae8d-d9fa-426d-828b-7323ab893f0b", name: "Yashika Gandhi", email: "123@gmail.com", rollNumber: "2024002" },
      ];
      setStudents(mockStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates');
      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const issueCertificate = async () => {
    if (!selectedActivity || !selectedStudent || !user) return;
    
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          activityId: selectedActivity,
          grade: grade || null,
          issuedBy: user.name
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Certificate issued successfully",
        });
        fetchCertificates();
        // Reset form
        setSelectedActivity("");
        setSelectedStudent("");
        setCertificateTitle("");
        setGrade("");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to issue certificate",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to issue certificate",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateCertificateStatus = async (certificateId: string, status: string) => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Certificate status updated",
        });
        fetchCertificates();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update certificate status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      issued: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'issued': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.activity?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || cert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedActivityData = activities.find(activity => activity.id === selectedActivity);
  const selectedStudentData = students.find(student => student.id === selectedStudent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certificate Issuance</h1>
        <p className="text-muted-foreground">Issue and manage certificates for student activities</p>
      </div>

      <Tabs defaultValue="issue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="issue">Issue Certificate</TabsTrigger>
          <TabsTrigger value="manage">Manage Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="issue" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Issue New Certificate
                </CardTitle>
                <CardDescription>Select student and activity to issue a certificate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Activity</Label>
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
                  {selectedActivityData && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <p><strong>Instructor:</strong> {selectedActivityData.instructor}</p>
                      <p><strong>Duration:</strong> {new Date(selectedActivityData.startDate).toLocaleDateString()} - {new Date(selectedActivityData.endDate).toLocaleDateString()}</p>
                      <p><strong>Participants:</strong> {selectedActivityData.currentParticipants}/{selectedActivityData.maxParticipants}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Select Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.rollNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedStudentData && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <p><strong>Name:</strong> {selectedStudentData.name}</p>
                      <p><strong>Roll Number:</strong> {selectedStudentData.rollNumber}</p>
                      <p><strong>Email:</strong> {selectedStudentData.email}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Grade (Optional)</Label>
                  <Input 
                    placeholder="e.g., A+, A, B+, etc."
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={issueCertificate}
                  disabled={!selectedActivity || !selectedStudent || submitting}
                  className="w-full"
                >
                  <Award className="h-4 w-4 mr-2" />
                  {submitting ? "Issuing..." : "Issue Certificate"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Certificate Preview
                </CardTitle>
                <CardDescription>Preview of the certificate to be issued</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedActivity && selectedStudent ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {selectedActivityData?.title || "Activity Title"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        This is to certify that
                      </p>
                      <p className="text-xl font-bold mb-4">
                        {selectedStudentData?.name || "Student Name"}
                      </p>
                      <p className="text-muted-foreground mb-4">
                        has successfully completed the above mentioned activity
                      </p>
                      {grade && (
                        <p className="text-lg font-semibold mb-4">
                          Grade: {grade}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Issued on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an activity and student to preview certificate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Certificates</CardTitle>
              <CardDescription>Manage and track certificate status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((certificate) => (
                    <TableRow key={certificate.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{certificate.student?.name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{certificate.student?.rollNumber || ""}</div>
                        </div>
                      </TableCell>
                      <TableCell>{certificate.activity?.title || "Unknown Activity"}</TableCell>
                      <TableCell>{certificate.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(certificate.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(certificate.status)}
                            {certificate.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>{certificate.grade || "-"}</TableCell>
                      <TableCell>{new Date(certificate.issuedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {certificate.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCertificateStatus(certificate.id, 'issued')}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCertificateStatus(certificate.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {certificate.status === 'issued' && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}