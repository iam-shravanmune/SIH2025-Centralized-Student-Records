import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore, ActivityType } from "@/store/app-store";

export default function ActivityValidation() {
  const { activities, addPendingActivity, setActivityStatus } = useAppStore();
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ActivityType>("academic");

  const pending = useMemo(() => activities.filter((a) => a.status === "pending"), [activities]);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addPendingActivity({ studentId: studentId.trim(), title: title.trim(), type });
    setStudentId("");
    setTitle("");
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Validation</CardTitle>
          <CardDescription>Approve or reject student-submitted activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAdd} className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="sid">Student ID</Label>
              <Input id="sid" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g., S-001" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Activity Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Research Seminar" required />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="non-academic">Non-Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Button type="submit">Add Pending Activity</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Activities</CardTitle>
          <CardDescription>{pending.length ? `${pending.length} awaiting review` : "No pending activities"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {pending.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.studentId} • {a.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="destructive" onClick={() => setActivityStatus(a.id, "rejected")}>Reject</Button>
                  <Button onClick={() => setActivityStatus(a.id, "approved")}>Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
