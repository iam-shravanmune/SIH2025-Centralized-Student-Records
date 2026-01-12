import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import CertificateIssuance from "@/pages/teacher/CertificateIssuance";
import AttendanceBatch from "@/pages/teacher/AttendanceBatch";
import ActivityValidation from "@/pages/teacher/ActivityValidation";
import ClassesSchedule from "@/pages/teacher/ClassesSchedule";
import SubjectAttendance from "@/pages/teacher/SubjectAttendance";
import { useAppStore } from "@/store/app-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export default function Teacher() {
  const { currentTeacher } = useAppStore();
  const navigate = useNavigate();

  return (
    <section className="container py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teacher Portal</h1>
          <p className="mt-2 text-muted-foreground">Manage certificates, attendance, classes and activity validations.</p>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{currentTeacher.name.split(" ").map((s) => s[0]).join("").slice(0,2)}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium leading-none">{currentTeacher.name}</div>
                <div className="text-xs text-muted-foreground">{currentTeacher.email}</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/teacher/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/teacher/change-password")}>Change Password</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <Tabs defaultValue="classes">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="classes">Classes & Schedule</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>

            <TabsContent value="classes" className="mt-6">
              <ClassesSchedule />
            </TabsContent>

            <TabsContent value="attendance" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <AttendanceBatch />
                <SubjectAttendance />
              </div>
            </TabsContent>

            <TabsContent value="certificates" className="mt-6">
              <CertificateIssuance />
            </TabsContent>

            <TabsContent value="validation" className="mt-6">
              <ActivityValidation />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
