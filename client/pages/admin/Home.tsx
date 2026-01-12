import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminHome() {
  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Access audit reports, analytics, and user management.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Audit Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">NAAC/AICTE/NIRF reports with filters and PDF export.</p>
            <Button asChild>
              <Link to="/admin/reports">Open reports</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Key metrics and trends (certificates/month).</p>
            <Button variant="secondary" asChild>
              <Link to="/admin/analytics">View analytics</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Add/remove users and assign roles.</p>
            <Button variant="outline" asChild>
              <Link to="/admin/users">Manage users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
