import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "framer-motion";
// Self-hosted Inter (no external Google Fonts request — faster first paint + no
// visitor IP sent to Google, so the "nothing leaves your browser" claim holds).
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { WizardProvider } from "./state/store";
import { ThemeProvider } from "./theme/ThemeProvider";
import { LanguageProvider } from "./i18n";
import { TooltipProvider } from "./components/ui/Tooltip";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <WizardProvider>
                <App />
              </WizardProvider>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </MotionConfig>
    </ErrorBoundary>
  </React.StrictMode>,
);
