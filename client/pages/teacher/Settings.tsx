import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

export default function TeacherSettings() {
  const { currentTeacher } = useAppStore();
  return (
    <section className="container py-12">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-muted-foreground">Manage your profile information.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Basic information</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:max-w-xl">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={currentTeacher.name} readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={currentTeacher.email} readOnly />
            </div>
            <div>
              <Button type="button" disabled>Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
