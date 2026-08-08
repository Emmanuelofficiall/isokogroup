import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BookOpen, BrainCircuit, Camera, GraduationCap, ArrowRight, Languages, MonitorPlay, MessageSquareQuote } from "lucide-react";

const departments = [
  {
    title: "Language Department",
    icon: Languages,
    items: ["English", "French", "German (Deutsch)", "Chinese (Mandarin)"],
  },
  {
    title: "ICT & Data Analysis",
    icon: MonitorPlay,
    items: ["Computer Basics", "Microsoft Office", "Internet & Email", "Data Analysis", "Excel & Spreadsheets", "Power BI", "SQL Basics"],
  },
  {
    title: "Multimedia Department",
    icon: Camera,
    items: ["Graphic Design", "Video Editing", "Photography", "Videography", "Motion Graphics", "Audio Production"],
  },
  {
    title: "Business Department",
    icon: BrainCircuit,
    items: ["Entrepreneurship", "Digital Marketing", "Customer Care", "Sales", "Project Management"],
  },
];

const featuredCourses = [
  { title: "English", instructor: "Ms. Alice Uwase", duration: "8 weeks", fee: "RWF 45,000", seats: 18 },
  { title: "Graphic Design", instructor: "Mr. Eric Niyonkuru", duration: "10 weeks", fee: "RWF 70,000", seats: 12 },
  { title: "Data Analysis", instructor: "Mr. Daniel Mugisha", duration: "12 weeks", fee: "RWF 95,000", seats: 10 },
];

const Software = () => {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container text-center max-w-4xl mx-auto space-y-6">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Isoko Training Center</span>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
            Empowering People Through Professional Skills Training
          </h1>
          <p className="text-lg text-muted-foreground">
            Practical, career-focused training designed to prepare learners for employment, entrepreneurship and lifelong learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/software/booking">
              <Button size="lg" className="gap-2">View Current Intakes <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link to="/software/booking">
              <Button size="lg" variant="outline" className="gap-2"><GraduationCap className="h-4 w-4" /> Apply Now</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Departments</h2>
            <p className="text-muted-foreground mt-2">A broad learning ecosystem built for the future of work.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((department) => {
              const Icon = department.icon;
              return (
                <div key={department.title} className="rounded-xl border border-border bg-card p-6 hover-lift">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{department.title}</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {department.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/software/booking"
                    state={{ department: department.title }}
                    className="mt-6 inline-flex"
                  >
                    <Button size="sm" className="gap-2">Apply in this department <ArrowRight className="h-3 w-3" /></Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Current Intake</h2>
            <p className="text-muted-foreground mt-2">Registration is open for the latest cohort across key training tracks.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredCourses.map((course) => (
              <div key={course.title} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
                  <MessageSquareQuote className="h-4 w-4" />
                  Registration Open
                </div>
                <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">Instructor: {course.instructor}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Duration: {course.duration}</li>
                  <li>Tuition Fee: {course.fee}</li>
                  <li>Remaining Seats: {course.seats}</li>
                </ul>
                <Link to="/software/booking" state={{ department: course.title }} className="mt-5 inline-flex">
                  <Button size="sm" className="gap-2">Apply Now <ArrowRight className="h-3 w-3" /></Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Software;
