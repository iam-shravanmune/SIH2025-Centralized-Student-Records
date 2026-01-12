import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";

export default function SubjectAttendance() {
  const { classes, studentsByClass, addAttendanceBatch } = useAppStore();
  const [classId, setClassId] = useState<string>(classes[0]?.id ?? "");
  const [dateISO, setDateISO] = useState(() => new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState<Record<string, "present" | "absent" | "late">>({});

  const students = useMemo(() => (classId ? studentsByClass[classId] || [] : []), [classId, studentsByClass]);

  const setStatus = (sid: string, status: "present" | "absent" | "late") =>
    setStatuses((prev) => ({ ...prev, [sid]: status }));

  const onSave = () => {
    const byStatus: Record<string, string[]> = { present: [], absent: [], late: [] } as any;
    for (const sid of students) {
      const st = statuses[sid] ?? "present";
      byStatus[st].push(sid);
    }
    if (byStatus.present.length) addAttendanceBatch({ courseId: classId, dateISO, defaultStatus: "present", studentIds: byStatus.present });
    if (byStatus.absent.length) addAttendanceBatch({ courseId: classId, dateISO, defaultStatus: "absent", studentIds: byStatus.absent });
    if (byStatus.late.length) addAttendanceBatch({ courseId: classId, dateISO, defaultStatus: "late", studentIds: byStatus.late });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject-wise Attendance</CardTitle>
        <CardDescription>Select a class and mark each student's status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.id} • {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <input className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-4 gap-2 border-b bg-muted/40 p-2 text-xs font-medium">
              <div>Student ID</div>
              <div>Present</div>
              <div>Absent</div>
              <div>Late</div>
            </div>
            {students.map((sid) => (
              <div key={sid} className="grid grid-cols-4 items-center gap-2 p-2 text-sm">
                <div className="font-medium">{sid}</div>
                <div><input type="radio" name={`st-${sid}`} onChange={() => setStatus(sid, "present")} checked={(statuses[sid] ?? "present") === "present"} /></div>
                <div><input type="radio" name={`st-${sid}`} onChange={() => setStatus(sid, "absent")} checked={statuses[sid] === "absent"} /></div>
                <div><input type="radio" name={`st-${sid}`} onChange={() => setStatus(sid, "late")} checked={statuses[sid] === "late"} /></div>
              </div>
            ))}
          </div>

          <div>
            <Button onClick={onSave} disabled={!classId || !students.length}>Save Attendance</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
