import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Bookmark } from "lucide-react";
import { useState } from "react";

const categories = ["All", "Business", "Technology", "History", "Self-Help", "Science", "Literature"];

const allBooks = [
  { title: "The Art of Business", author: "Jean Paul M.", category: "Business", pages: 240 },
  { title: "Rwanda Rising", author: "Marie Claire N.", category: "History", pages: 310 },
  { title: "Digital Innovation", author: "Patrick K.", category: "Technology", pages: 198 },
  { title: "Leadership Essentials", author: "Grace U.", category: "Self-Help", pages: 175 },
  { title: "Data Science Fundamentals", author: "Eric T.", category: "Technology", pages: 420 },
  { title: "African Philosophy", author: "Joseph M.", category: "Literature", pages: 280 },
  { title: "Startup Blueprint", author: "Alice K.", category: "Business", pages: 155 },
  { title: "The Living Cell", author: "Dr. Sarah N.", category: "Science", pages: 350 },
];

const ELibrary = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? allBooks : allBooks.filter((b) => b.category === active);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">E-Library</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">Read & Learn Online</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Browse our collection of books and read them directly in your browser — no downloads needed.</p>
          </div>

          <div className="max-w-md mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search books by title or author..." className="pl-10" />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((book, i) => (
              <div key={i} className="group rounded-xl border border-border bg-card p-5 hover-lift">
                <div className="relative aspect-[3/4] rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 overflow-hidden">
                  <BookOpen className="h-10 w-10 text-primary/40 group-hover:scale-110 transition-transform" />
                  <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-muted-foreground hover:text-primary transition-colors">
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-primary font-medium">{book.category}</span>
                <h3 className="font-semibold text-sm mt-1">{book.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">by {book.author}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">{book.pages} pages</span>
                  <Button size="sm" variant="outline">Read Now</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ELibrary;
