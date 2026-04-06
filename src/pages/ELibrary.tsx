import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bookmark } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

import artOfBusiness from "@/assets/books/art-of-business.jpg";
import rwandaRising from "@/assets/books/rwanda-rising.jpg";
import digitalInnovation from "@/assets/books/digital-innovation.jpg";
import leadershipEssentials from "@/assets/books/leadership-essentials.jpg";
import dataScience from "@/assets/books/data-science.jpg";
import africanPhilosophy from "@/assets/books/african-philosophy.jpg";
import startupBlueprint from "@/assets/books/startup-blueprint.jpg";
import livingCell from "@/assets/books/living-cell.jpg";

const categories = ["All", "Business", "Technology", "History", "Self-Help", "Science", "Literature"];

const allBooks = [
  { title: "The Art of Business", author: "Jean Paul M.", category: "Business", pages: 240, image: artOfBusiness },
  { title: "Rwanda Rising", author: "Marie Claire N.", category: "History", pages: 310, image: rwandaRising },
  { title: "Digital Innovation", author: "Patrick K.", category: "Technology", pages: 198, image: digitalInnovation },
  { title: "Leadership Essentials", author: "Grace U.", category: "Self-Help", pages: 175, image: leadershipEssentials },
  { title: "Data Science Fundamentals", author: "Eric T.", category: "Technology", pages: 420, image: dataScience },
  { title: "African Philosophy", author: "Joseph M.", category: "Literature", pages: 280, image: africanPhilosophy },
  { title: "Startup Blueprint", author: "Alice K.", category: "Business", pages: 155, image: startupBlueprint },
  { title: "The Living Cell", author: "Dr. Sarah N.", category: "Science", pages: 350, image: livingCell },
];

const ELibrary = () => {
  const [active, setActive] = useState("All");
  const { t } = useI18n();
  const filtered = active === "All" ? allBooks : allBooks.filter((b) => b.category === active);

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
            <Input placeholder={t("elibrary.search")} className="pl-10" />
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
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4">
                  <img src={book.image} alt={book.title} loading="lazy" width={512} height={680} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-muted-foreground hover:text-primary transition-colors">
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-primary font-medium">{book.category}</span>
                <h3 className="font-semibold text-sm mt-1">{book.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">by {book.author}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">{book.pages} {t("elibrary.pages")}</span>
                  <Button size="sm" variant="outline">{t("elibrary.readNow")}</Button>
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
