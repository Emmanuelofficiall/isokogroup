import { useMemo, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const trainingGuidance: Record<string, { title: string; summary: string; skills: string[] }> = {
  "data analysis": {
    title: "Data Analysis",
    summary: "Data analysis helps people turn raw information into clear decisions using spreadsheets, charts, dashboards and business insights.",
    skills: ["Excel & Spreadsheets", "Power BI", "SQL Basics", "Data Visualization"],
  },
  "power bi": {
    title: "Power BI",
    summary: "Power BI is a practical tool for building dashboards and reporting results in a simple, visual way.",
    skills: ["Dashboard Design", "Data Cleaning", "Reporting", "Business Insights"],
  },
  "sql": {
    title: "SQL",
    summary: "SQL helps learners query and organize data from databases for analysis, reporting and decision-making.",
    skills: ["Queries", "Filtering", "Joins", "Database Basics"],
  },
  default: {
    title: "Training Guidance",
    summary: "Ask about a topic such as data analysis, Power BI or SQL and we will share a quick learning overview.",
    skills: ["Practical lessons", "Career-ready skills", "Hands-on projects"],
  },
};

const TrainingAIHelper = () => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(trainingGuidance.default);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = query.trim().toLowerCase();
    const matched = Object.entries(trainingGuidance).find(([key]) => {
      if (key === "default") return false;
      return normalized.includes(key) || key.includes(normalized);
    })?.[1] || trainingGuidance.default;

    setAnswer(matched);
  };

  const hint = useMemo(() => {
    if (!query.trim()) return "Try: data analysis, Power BI, or SQL";
    return query.trim();
  }, [query]);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        <Bot className="h-5 w-5" />
        <h3 className="font-semibold">Ask AI about the training</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Get a simple overview of concepts before you register for a course.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about a training topic"
          className="flex-1"
        />
        <Button type="submit" className="gap-2">
          <Sparkles className="h-4 w-4" /> Get Guidance
        </Button>
      </form>

      <div className="mt-4 rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-primary">{answer.title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{answer.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {answer.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-foreground">
              {skill}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Example: {hint}</p>
      </div>
    </div>
  );
};

export default TrainingAIHelper;
