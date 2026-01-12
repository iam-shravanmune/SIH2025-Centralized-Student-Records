import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentSettings() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Update your profile details and preferences.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          Coming soon. Tell me the fields you want (name, phone, avatar, etc.).
        </CardContent>
      </Card>
    </section>
  );
}
