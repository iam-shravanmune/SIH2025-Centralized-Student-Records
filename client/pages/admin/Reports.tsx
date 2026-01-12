import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { Link } from "react-router-dom";

export default function AdminReports() {
  const { activities, certificates, attendance, classes } = useAppStore();
  const [scheme, setScheme] = useState("NAAC");
  const [type, setType] = useState("all");
  const [from, setFrom] = useState<string>(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [to, setTo] = useState<string>(new Date().toISOString().slice(0, 10));

  const metrics = useMemo(() => {
    const fromTs = Date.parse(from);
    const toTs = Date.parse(to) + 24*60*60*1000 - 1;

    const acts = activities.filter((a) => a.createdAt >= fromTs && a.createdAt <= toTs && (type === "all" || a.type === type));
    const certs = certificates.filter((c) => c.issuedAt >= fromTs && c.issuedAt <= toTs);
    const att = attendance.filter((x) => Date.parse(x.dateISO) >= fromTs && Date.parse(x.dateISO) <= toTs);

    const uniqueStudents = new Set(acts.map((a) => a.studentId));
    const participationRate = uniqueStudents.size; // demo metric: count of participating students

    const activityByDept: Record<string, number> = {};
    for (const c of classes) {
      activityByDept[c.department || "General"] ||= 0;
    }
    for (const a of acts) {
      // derive dept from courseId if matches a class id
      const cls = classes.find((c) => a.title.includes(c.name) || a.studentId);
      const key = cls?.department || "General";
      activityByDept[key] = (activityByDept[key] || 0) + 1;
    }

    return {
      scheme,
      period: `${from} to ${to}`,
      filteredType: type,
      studentParticipation: participationRate,
      certificatesIssued: certs.length,
      attendanceRecords: att.length,
      activityByDept,
    };
  }, [activities, certificates, attendance, classes, from, to, type, scheme]);

  const printData = encodeURIComponent(JSON.stringify(metrics));

  return (
    <section className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Reporting</CardTitle>
          <CardDescription>Generate {scheme} report with filters and export to PDF (print dialog).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <Label>Scheme</Label>
            <Select value={scheme} onValueChange={setScheme}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NAAC">NAAC</SelectItem>
                <SelectItem value="AICTE">AICTE</SelectItem>
                <SelectItem value="NIRF">NIRF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Activity Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="non-academic">Non-Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>From</Label>
            <input className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>To</Label>
            <input className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>Summary of computed metrics.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div>Scheme: {metrics.scheme}</div>
          <div>Period: {metrics.period}</div>
          <div>Activity filter: {metrics.filteredType}</div>
          <div>Student participation: {metrics.studentParticipation}</div>
          <div>Certificates issued: {metrics.certificatesIssued}</div>
          <div>Attendance records: {metrics.attendanceRecords}</div>
          <div className="mt-2">Department-wise activity distribution:</div>
          <div className="grid gap-1 md:grid-cols-2">
            {Object.entries(metrics.activityByDept).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-md border p-2"><span>{k}</span><span className="font-mono">{v}</span></div>
            ))}
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link to={{ pathname: "/admin/reports/print", search: `?data=${printData}` }}>Generate PDF</Link>
            </Button>
            <span className="ml-3 text-xs text-muted-foreground">Opens printable report; use browser "Save as PDF".</span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
