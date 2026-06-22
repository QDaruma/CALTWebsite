import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "framer-motion";
// Self-hosted Inter (no external Google Fonts request — faster first paint + no
// visitor IP sent to Google, so the "nothing leaves your browser" claim holds).
// Latin subset only: the UI is English/Japanese (Japanese falls back to system
// fonts), so cyrillic/greek/vietnamese subsets would be dead weight.
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-800.css";
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
