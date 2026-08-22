import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Pencil, Plus, Power, Trash2 } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  mode: string;
  price: number;
  duration: string | null;
  active: boolean;
};

type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  user_id: string | null;
  course_title: string;
  mode: string;
  experience_level: string;
  status: string;
  created_at: string;
};

const emptyForm = { title: "", description: "", level: "beginner", mode: "online", price: "", duration: "" };

const TrainingCenterAdmin = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [courseResult, registrationResult] = await Promise.all([
      (supabase as any).from("software_courses").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("course_registrations").select("*").order("created_at", { ascending: false }),
    ]);
    if (courseResult.error) toast({ title: "Could not load courses", description: courseResult.error.message, variant: "destructive" });
    if (registrationResult.error) toast({ title: "Could not load registrations", description: registrationResult.error.message, variant: "destructive" });
    setCourses(courseResult.data || []);
    setRegistrations(registrationResult.data || []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const saveCourse = async () => {
    if (!form.title.trim()) {
      toast({ title: "Course title required", variant: "destructive" });
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      level: form.level,
      mode: form.mode,
      price: Number(form.price) || 0,
      duration: form.duration.trim() || null,
    };
    const result = editingId
      ? await (supabase as any).from("software_courses").update(payload).eq("id", editingId)
      : await (supabase as any).from("software_courses").insert(payload);
    if (result.error) {
      toast({ title: "Could not save course", description: result.error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingId ? "Course updated" : "Course added" });
    setForm(emptyForm);
    setEditingId(null);
    void load();
  };

  const editCourse = (course: Course) => {
    setForm({
      title: course.title,
      description: course.description || "",
      level: course.level,
      mode: course.mode,
      price: String(course.price),
      duration: course.duration || "",
    });
    setEditingId(course.id);
  };

  const toggleCourse = async (course: Course) => {
    const { error } = await (supabase as any).from("software_courses").update({ active: !course.active }).eq("id", course.id);
    if (error) toast({ title: "Could not update course", description: error.message, variant: "destructive" });
    else void load();
  };

  const deleteCourse = async (id: string) => {
    if (!window.confirm("Delete this course? Existing registrations will remain.")) return;
    const { error } = await (supabase as any).from("software_courses").delete().eq("id", id);
    if (error) toast({ title: "Could not delete course", description: error.message, variant: "destructive" });
    else { toast({ title: "Course deleted" }); void load(); }
  };

  const updateRegistration = async (id: string, status: string) => {
    const { error } = await (supabase as any).from("course_registrations").update({ status }).eq("id", id);
    if (error) toast({ title: "Could not update registration", description: error.message, variant: "destructive" });
    else {
      const registration = registrations.find((item) => item.id === id);
      if (registration?.user_id && status === "approved") {
        await notify({
          userId: registration.user_id,
          title: "Training registration approved",
          body: `Your registration for ${registration.course_title} has been approved by ISOKO Training Centre.`,
          type: "success",
          link: "/software/academy",
        });
      }
      toast({ title: status === "approved" ? "Student approved and notified" : "Registration updated" });
      void load();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Training Centre Courses</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div><Label>Course title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="English Language" /></div>
            <div><Label>Department/category</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description and department" /></div>
            <div><Label>Duration</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="8 weeks" /></div>
            <div><Label>Price (RWF)</Label><Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="120000" /></div>
            <div><Label>Level</Label><Select value={form.level} onValueChange={(value) => setForm({ ...form, level: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div>
            <div><Label>Mode</Label><Select value={form.mode} onValueChange={(value) => setForm({ ...form, mode: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="online">Online</SelectItem><SelectItem value="physical">Physical</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem></SelectContent></Select></div>
          </div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What students will learn" /></div>
          <div className="flex gap-2"><Button onClick={() => void saveCourse()}><Plus className="h-4 w-4 mr-1" />{editingId ? "Update course" : "Add course"}</Button>{editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button>}</div>
          {loading ? <p className="text-sm text-muted-foreground">Loading courses…</p> : courses.length === 0 ? <p className="text-sm text-muted-foreground">No courses yet.</p> : <div className="grid gap-3 md:grid-cols-2">{courses.map((course) => <div key={course.id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-3"><div><p className="font-semibold">{course.title}</p><p className="text-sm text-muted-foreground">{course.description || "No description"}</p><p className="text-xs text-muted-foreground mt-2">{course.price.toLocaleString()} RWF · {course.duration || "No duration"} · {course.mode}</p><Badge className="mt-2" variant={course.active ? "default" : "secondary"}>{course.active ? "Active" : "Hidden"}</Badge></div><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => editCourse(course)} aria-label={`Edit ${course.title}`}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => void toggleCourse(course)} aria-label={`Toggle ${course.title}`}><Power className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => void deleteCourse(course.id)} aria-label={`Delete ${course.title}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>)}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Student Registrations ({registrations.length})</CardTitle></CardHeader>
        <CardContent>{registrations.length === 0 ? <p className="text-sm text-muted-foreground">No registrations yet.</p> : <div className="space-y-3">{registrations.map((registration) => <div key={registration.id} className="border border-border rounded-lg p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"><div><p className="font-semibold">{registration.full_name}</p><p className="text-sm text-muted-foreground">{registration.email}{registration.phone ? ` · ${registration.phone}` : ""}</p><p className="text-sm mt-1">{registration.course_title} · {registration.mode} · {registration.experience_level}</p></div><div className="flex items-center gap-2"><Badge variant={registration.status === "approved" ? "default" : "secondary"}>{registration.status}</Badge>{registration.status === "pending" && <><Button size="sm" onClick={() => void updateRegistration(registration.id, "approved")}>Approve</Button><Button size="sm" variant="outline" onClick={() => void updateRegistration(registration.id, "rejected")}>Reject</Button></>}</div></div>)}</div>}</CardContent>
      </Card>
    </div>
  );
};

export default TrainingCenterAdmin;
