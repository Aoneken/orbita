import { ThemeProvider } from "@/contexts";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="orbita-theme">
      <App />
    </ThemeProvider>
  </StrictMode>
);
