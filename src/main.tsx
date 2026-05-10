import { createRoot } from "react-dom/client";
import AOS from "aos";
import "aos/dist/aos.css";
import App from "./App.tsx";
import "./index.css";

AOS.init({
  duration: 600,
  easing: "ease-out-cubic",
  once: true,
  offset: 60,
  disable: () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

createRoot(document.getElementById("root")!).render(<App />);
