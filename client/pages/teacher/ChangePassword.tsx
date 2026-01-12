import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TeacherChangePassword() {
  return (
    <section className="container py-12">
      <h1 className="text-2xl font-bold tracking-tight">Change Password</h1>
      <p className="mt-1 text-muted-foreground">Update your account password.</p>

      <Card className="mt-6 md:max-w-xl">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Enter your current and new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new">New Password</Label>
              <Input id="new" type="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input id="confirm" type="password" required />
            </div>
            <div>
              <Button type="submit" disabled>Update Password</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
