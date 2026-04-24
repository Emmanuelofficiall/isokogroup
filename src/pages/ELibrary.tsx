import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bookmark, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import artOfBusiness from "@/assets/books/art-of-business.jpg";
import rwandaRising from "@/assets/books/rwanda-rising.jpg";
import digitalInnovation from "@/assets/books/digital-innovation.jpg";
import leadershipEssentials from "@/assets/books/leadership-essentials.jpg";
import dataScience from "@/assets/books/data-science.jpg";
import africanPhilosophy from "@/assets/books/african-philosophy.jpg";
import startupBlueprint from "@/assets/books/startup-blueprint.jpg";
import livingCell from "@/assets/books/living-cell.jpg";

const categories = ["All", "Business", "Technology", "History", "Self-Help", "Science", "Literature"];

const defaultBooks = [
  { title: "The Art of Business", author: "Jean Paul M.", category: "Business", pages: 240, image: artOfBusiness },
  { title: "Rwanda Rising", author: "Marie Claire N.", category: "History", pages: 310, image: rwandaRising },
  { title: "Digital Innovation", author: "Patrick K.", category: "Technology", pages: 198, image: digitalInnovation },
  { title: "Leadership Essentials", author: "Grace U.", category: "Self-Help", pages: 175, image: leadershipEssentials },
  { title: "Data Science Fundamentals", author: "Eric T.", category: "Technology", pages: 420, image: dataScience },
  { title: "African Philosophy", author: "Joseph M.", category: "Literature", pages: 280, image: africanPhilosophy },
  { title: "Startup Blueprint", author: "Alice K.", category: "Business", pages: 155, image: startupBlueprint },
  { title: "The Living Cell", author: "Dr. Sarah N.", category: "Science", pages: 350, image: livingCell },
];

const READER_PAGES = [
  "Welcome to the ISOKO GROUP E-Library reader. Enjoy a smooth, distraction-free reading experience.",
  "Chapter 1 — Introduction. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.",
  "Chapter 2 — Foundations. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.",
  "Chapter 3 — Conclusion. Thank you for reading on ISOKO GROUP E-Library. Your reading progress is saved automatically while you read.",
];

const ELibrary = () => {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [dbBooks, setDbBooks] = useState<any[]>([]);
  const [readingBook, setReadingBook] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageKey, setPageKey] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase.from("books").select("*");
      if (data) setDbBooks(data);
    };
    fetchBooks();
  }, []);

  const allBooks = [
    ...defaultBooks.map(b => ({ ...b, id: b.title })),
    ...dbBooks.map(b => ({ title: b.title, author: b.author, category: b.category, pages: b.pages, image: b.cover_url, id: b.id })),
  ];

  const filtered = allBooks
    .filter(b => active === "All" || b.category === active)
    .filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));

  // Fade-in book cards on scroll
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".book-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.animationDelay = `${(i % 8) * 60}ms`;
            el.classList.add("in-view");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [filtered.length]);

  const handleRead = (title: string) => {
    setReadingBook(title);
    setPageIndex(0);
    setPageKey((k) => k + 1);
    toast({ title: `Opening: ${title}`, description: "Book reader opened. Enjoy reading!" });
  };

  const turnPage = (dir: 1 | -1) => {
    setPageIndex((p) => {
      const next = Math.min(Math.max(p + dir, 0), READER_PAGES.length - 1);
      if (next !== p) setPageKey((k) => k + 1);
      return next;
    });
  };

  const progress = Math.round(((pageIndex + 1) / READER_PAGES.length) * 100);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t("nav.elibrary")}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{t("elibrary.title")}</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("elibrary.subtitle")}</p>
          </div>

          <div className="max-w-md mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("elibrary.search")} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActive(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${active === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Reading modal with page-turn animation */}
          {readingBook && (
            <div className="mb-8 rounded-xl border border-border bg-card p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 min-w-0">
                  <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="truncate">Reading: {readingBook}</span>
                </h2>
                <Button variant="outline" size="sm" onClick={() => setReadingBook(null)}>Close</Button>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Page {pageIndex + 1} of {READER_PAGES.length}</span>
                  <span>{progress}% complete</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Page content with page-turn animation */}
              <div
                key={pageKey}
                className="animate-page-turn min-h-[180px] rounded-lg bg-muted/30 border border-border p-6 text-sm md:text-base leading-relaxed text-foreground"
              >
                {READER_PAGES[pageIndex]}
              </div>

              {/* Reader controls */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => turnPage(-1)}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  size="sm"
                  className="gap-1 hover-glow"
                  onClick={() => turnPage(1)}
                  disabled={pageIndex === READER_PAGES.length - 1}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((book, i) => (
              <div key={book.id || i} className="book-card group rounded-xl border border-border bg-card p-5 hover-lift">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-muted">
                  {book.image ? (
                    <img src={book.image} alt={book.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-muted-foreground hover:text-primary transition-colors">
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-primary font-medium">{book.category}</span>
                <h3 className="font-semibold text-sm mt-1">{book.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">by {book.author}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">{book.pages} {t("elibrary.pages")}</span>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => handleRead(book.title)}>
                    <BookOpen className="h-3 w-3" /> {t("elibrary.readNow")}
                  </Button>
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
