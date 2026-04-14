import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import siteIcon from "./data/profile.png";

function applySiteIcon(href: string) {
  const ensure = (rel: "icon" | "apple-touch-icon") => {
    const selector = rel === "icon" ? 'link[rel="icon"]' : 'link[rel="apple-touch-icon"]';
    let el = document.querySelector<HTMLLinkElement>(selector);
    if (!el) {
      el = document.createElement("link");
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.type = "image/png";
    el.href = href;
  };
  ensure("icon");
  ensure("apple-touch-icon");
}

applySiteIcon(siteIcon);

createRoot(document.getElementById("root")!).render(<App />);
