import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Lock, School, User2, Users, Bell, FileText, ClipboardList, CheckCircle2, XCircle, Upload, BarChart3, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Logo } from "@/components/Logo";
import type { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse } from "@shared/api";

const roles = [
  { id: "student", label: "Student", icon: School },
  { id: "teacher", label: "Teacher", icon: User2 },
  { id: "admin", label: "Admin", icon: Lock },
] as const;

type Role = (typeof roles)[number]["id"];

function LoginForm({ role }: { role: Role }) {
  const [submitting, setSubmitting] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const identifier = String(form.get("identifier") || "").trim();
    const password = String(form.get("password") || "").trim();
    const name = String(form.get("name") || "").trim();
    setSubmitting(true);
    setError(null);
    try {
      if (isRegister) {
        const body: RegisterRequest = { identifier, password, name, role };
        const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = (await res.json()) as RegisterResponse & { error?: string };
        if (!res.ok) throw new Error(data.error || "Registration failed");
        login(data.user);
        navigate(role === "student" ? "/student" : role === "teacher" ? "/teacher" : "/admin", { replace: true });
        return;
      } else {
        const body: LoginRequest = { identifier, password };
        const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = (await res.json()) as LoginResponse & { error?: string };
        if (!res.ok) throw new Error(data.error || "Login failed");
        login(data.user);
        const r = data.user.role;
        navigate(r === "student" ? "/student" : r === "teacher" ? "/teacher" : "/admin", { replace: true });
        return;
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }


  const primaryLabel = role === "student" ? "Student ID or Email" : "Email";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`${role}-id`}>{primaryLabel}</Label>
        <Input id={`${role}-id`} name="identifier" placeholder={primaryLabel} required autoComplete="username" />
      </div>
      {isRegister && (
        <div className="grid gap-2">
          <Label htmlFor={`${role}-name`}>Full Name</Label>
          <Input id={`${role}-name`} name="name" placeholder="Your full name" required />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor={`${role}-password`}>Password</Label>
        <Input id={`${role}-password`} name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
      </div>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2 select-none">
          <input type="checkbox" name="remember" className="h-4 w-4 rounded border-input" />
          <span className="text-muted-foreground">Remember me</span>
        </label>
        <button type="button" className="text-primary hover:underline" onClick={() => setIsRegister((v) => !v)}>
          {isRegister ? "Have an account? Sign in" : `New ${role}? Register`}
        </button>
      </div>
      <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90" disabled={submitting}>
        {submitting ? (isRegister ? "Registering…" : "Signing in…") : isRegister ? `Register as ${role}` : `Sign in as ${role}`}
      </Button>
    </form>
  );
}

export default function Index() {
  const [role, setRole] = useState<Role>("student");

  return (
    <section className="relative">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-16 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 blur-3xl" />
      </div>

      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center mb-6">
            <Logo size="lg" />
          </div>
          <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" /> Secure Access Portal
          </p>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight md:text-5xl">
            Welcome to GradFolio
          </h1>
          <p className="mt-3 text-balance text-muted-foreground md:text-lg">
            Choose your role below to access the right login. Students, teachers, and admins each have dedicated sign in.
          </p>
        </div>

        <Card className="mx-auto mt-8 max-w-3xl border-0 bg-gradient-to-br from-background to-background shadow-xl ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="text-lg">Select your role</CardTitle>
            <CardDescription>Switching roles updates the login form instantly.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(v) => setRole(v as Role)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1">
                {roles.map(({ id, label, icon: Icon }) => (
                  <TabsTrigger key={id} value={id} className="group">
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground group-data-[state=active]:text-foreground" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {roles.map(({ id, label }) => (
                <TabsContent key={id} value={id} className="mt-6">
                  <div className={cn("grid gap-6 md:grid-cols-2")}> 
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                      <h3 className="text-base font-semibold">{label} login</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Enter your credentials to continue.
                      </p>
                      <div className="mt-6">
                        <LoginForm role={id as Role} />
                      </div>
                    </div>
                    <div className="hidden md:block rounded-lg border bg-muted/30 p-6">
                      <h4 className="font-medium">Tips</h4>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li>• Use your official credentials provided by the institution.</li>
                        <li>• Keep your password secure and do not share it.</li>
                        <li>• Contact support if you have trouble signing in.</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="mx-auto mt-8 max-w-3xl text-center text-xs text-muted-foreground">
          By signing in you agree to our terms and privacy policy. © {new Date().getFullYear()} GradFolio.
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">Key Features & Functionality</h2>
          <p className="mt-2 text-center text-muted-foreground">Student, Teacher, and Admin portals tailored for HEIs.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><School className="h-5 w-5" /> Student Portal</CardTitle>
                <CardDescription>Academic and non-academic records with a dynamic portfolio.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 text-primary" /> Academic Records: Course, fees, attendance, exam</li>
                  <li className="flex items-start gap-2"><ClipboardList className="mt-0.5 h-4 w-4 text-primary" /> Non-Academic: Seminars, events, workshops, internships</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> Portfolio: Auto-generated with certificates/achievements</li>
                  <li className="flex items-start gap-2"><Bell className="mt-0.5 h-4 w-4 text-primary" /> Notifications: Real-time alerts for certificates/attendance</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User2 className="h-5 w-5" /> Teacher Portal</CardTitle>
                <CardDescription>Manage certificates, attendance, and validations.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><Upload className="mt-0.5 h-4 w-4 text-primary" /> Certificate Issuance: Upload PDFs linked to activities</li>
                  <li className="flex items-start gap-2"><ClipboardList className="mt-0.5 h-4 w-4 text-primary" /> Attendance: Batch marking with participation metrics</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> Activity Validation: Approve student submissions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Admin Portal</CardTitle>
                <CardDescription>Compliance-ready reports and system oversight.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 text-primary" /> Audit Reporting (NAAC/AICTE/NIRF): Auto-generate PDFs</li>
                  <li className="flex items-start gap-2"><PieChart className="mt-0.5 h-4 w-4 text-primary" /> Custom Reports: Date-range and activity-type filters</li>
                  <li className="flex items-start gap-2"><Users className="mt-0.5 h-4 w-4 text-primary" /> User Management: Add/remove users, assign roles</li>
                  <li className="flex items-start gap-2"><BarChart3 className="mt-0.5 h-4 w-4 text-primary" /> System Analytics: Certificates/month and key metrics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
