import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";

export default function ClassesSchedule() {
  const { classes, schedule, studentsByClass } = useAppStore();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Assigned Classes</CardTitle>
          <CardDescription>Classes currently assigned to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            {classes.map((c) => (
              <div key={c.id} className="grid grid-cols-4 gap-2 p-3 text-sm">
                <div className="font-medium">{c.id}</div>
                <div>{c.name}</div>
                <div>{c.subject}</div>
                <div className="text-muted-foreground">{(studentsByClass[c.id] || []).length} students</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Upcoming lectures, labs, and exams.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            {schedule.map((s) => (
              <div key={s.id} className="grid grid-cols-5 gap-2 p-3 text-sm">
                <div className="font-medium">{s.day}</div>
                <div>{s.start}–{s.end}</div>
                <div className="truncate">{s.title}</div>
                <div className="text-muted-foreground">{s.classId}</div>
                <div className="text-muted-foreground">Room TBA</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
