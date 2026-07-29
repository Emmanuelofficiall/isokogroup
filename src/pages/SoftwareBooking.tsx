import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronRight, Clock, Globe, MapPin, Users, Award, Monitor, Pencil, Video, Layers } from "lucide-react";

const categories = [
  "All Categories",
  "Languages",
  "ICT & Digital Skills",
  "Multimedia & Creative",
  "Business & Management",
  "Professional Development",
  "Vocational Skills",
];

const scheduleOptions = ["Morning", "Afternoon", "Evening", "Weekend"];
const modeOptions = ["Physical Classes", "Online Classes", "Hybrid"];

const courses = [
  {
    id: "english",
    category: "Languages",
    title: "English Language",
    instructor: "Jane Uwase",
    level: "Beginner (A1) – Advanced (C1)",
    duration: "3 Months",
    schedule: "Evening (Mon–Wed–Fri)",
    mode: "Hybrid",
    seats: "23/30",
    fee: "RWF 120,000",
    icon: Globe,
  },
  {
    id: "french",
    category: "Languages",
    title: "French Language",
    instructor: "Jean Claude",
    level: "Beginner (A1) – Advanced (C1)",
    duration: "3 Months",
    schedule: "Weekend (Sat & Sun)",
    mode: "Hybrid",
    seats: "18/25",
    fee: "RWF 120,000",
    icon: Globe,
  },
  {
    id: "chinese",
    category: "Languages",
    title: "Chinese (Mandarin)",
    instructor: "Li Wei",
    level: "HSK 1 – HSK 5",
    duration: "4 Months",
    schedule: "Morning (Tue–Thu–Sat)",
    mode: "Hybrid",
    seats: "12/20",
    fee: "RWF 150,000",
    icon: Globe,
  },
  {
    id: "german",
    category: "Languages",
    title: "German (Deutsch)",
    instructor: "Anna Müller",
    level: "A1 – C1",
    duration: "4 Months",
    schedule: "Weekend (Sat & Sun)",
    mode: "Hybrid",
    seats: "15/20",
    fee: "RWF 150,000",
    icon: Globe,
  },
  {
    id: "computer-basics",
    category: "ICT & Digital Skills",
    title: "Computer Basics",
    instructor: "Patrick N.",
    level: "Beginner",
    duration: "2 Months",
    schedule: "Evening (Mon–Wed–Fri)",
    mode: "Physical Classes",
    seats: "20/30",
    fee: "RWF 80,000",
    icon: Monitor,
  },
  {
    id: "graphic-design",
    category: "Multimedia & Creative",
    title: "Graphic Design",
    instructor: "Eric Mugisha",
    level: "Beginner – Intermediate",
    duration: "3 Months",
    schedule: "Weekend (Sat & Sun)",
    mode: "Hybrid",
    seats: "14/20",
    fee: "RWF 120,000",
    icon: Pencil,
  },
  {
    id: "entrepreneurship",
    category: "Business & Management",
    title: "Entrepreneurship",
    instructor: "Diane K.",
    level: "Beginner – Intermediate",
    duration: "2 Months",
    schedule: "Evening (Tue–Thu)",
    mode: "Hybrid",
    seats: "18/25",
    fee: "RWF 90,000",
    icon: Award,
  },
  {
    id: "public-speaking",
    category: "Professional Development",
    title: "Public Speaking",
    instructor: "Claude R.",
    level: "Beginner",
    duration: "1 Month",
    schedule: "Weekend (Sat)",
    mode: "Physical Classes",
    seats: "25/30",
    fee: "RWF 60,000",
    icon: Users,
  },
];

const categoryIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  Languages: Globe,
  "ICT & Digital Skills": Monitor,
  "Multimedia & Creative": Pencil,
  "Business & Management": Award,
  "Professional Development": Users,
  "Vocational Skills": Layers,
};

const SoftwareBooking = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [selectedMode, setSelectedMode] = useState("");

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const categoryMatch = selectedCategory === "All Categories" || course.category === selectedCategory;
        const scheduleMatch = !selectedSchedule || course.schedule.includes(selectedSchedule);
        const modeMatch = !selectedMode || course.mode === selectedMode;
        return categoryMatch && scheduleMatch && modeMatch;
      }),
    [selectedCategory, selectedSchedule, selectedMode]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">TRAINING CENTER</span>
              <h1 className="mt-4 text-4xl md:text-5xl font-display font-bold">Current Intakes</h1>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                Explore our ongoing intakes. Choose a course that matches your goals and register before seats run out.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-primary font-semibold">September 2026 Intake</p>
                  <p className="mt-2 font-semibold text-foreground">Registration is Open</p>
                  <p className="mt-1 text-sm text-muted-foreground">Registration closes on 30 Sept 2026.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Filter Courses</h2>
                  <span className="text-sm text-muted-foreground">{filteredCourses.length} shown</span>
                </div>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">Category</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className={`flex items-center gap-3 w-full rounded-2xl px-3 py-2 text-left text-sm ${
                            selectedCategory === category ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <span>{category}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">Schedule</h3>
                    <div className="space-y-2">
                      {scheduleOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSelectedSchedule(selectedSchedule === option ? "" : option)}
                          className={`flex items-center gap-2 w-full rounded-2xl px-3 py-2 text-sm ${
                            selectedSchedule === option ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <span>{option}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">Mode</h3>
                    <div className="space-y-2">
                      {modeOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSelectedMode(selectedMode === option ? "" : option)}
                          className={`flex items-center gap-2 w-full rounded-2xl px-3 py-2 text-sm ${
                            selectedMode === option ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <span>{option}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-4">Intake Summary</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Intake Period</p>
                      <p>01 Sept – 30 Sept 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Classes Start</p>
                      <p>05 October 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Intake Duration</p>
                      <p>3 – 4 Months</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Total Courses</p>
                      <p>8 Courses Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <main className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Showing {filteredCourses.length} courses</p>
                  <h2 className="text-2xl font-semibold">Available courses this intake</h2>
                </div>
                <div className="rounded-2xl border border-border bg-card p-3 text-sm text-muted-foreground">
                  Sort by: <span className="font-semibold text-foreground">Course Name (A–Z)</span>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {filteredCourses.map((course) => {
                  const Icon = course.icon || categoryIcon[course.category];
                  return (
                    <div key={course.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold uppercase text-primary">
                          {course.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">Instructor: {course.instructor}</p>
                      <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground mb-5">
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{course.duration}</div>
                        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{course.schedule}</div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 mb-5 text-sm">
                        <div className="rounded-2xl bg-muted p-3">
                          <p className="font-semibold text-foreground">Mode</p>
                          <p>{course.mode}</p>
                        </div>
                        <div className="rounded-2xl bg-muted p-3">
                          <p className="font-semibold text-foreground">Seats Left</p>
                          <p>{course.seats}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tuition fee</p>
                          <p className="text-lg font-semibold">{course.fee}</p>
                        </div>
                          <Link
                            to="/software/academy"
                            state={{ course }}
                            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                          >
                            View Details & Apply <ChevronRight className="ml-2 h-4 w-4" />
                          </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SoftwareBooking;
