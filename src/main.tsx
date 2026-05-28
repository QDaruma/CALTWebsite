import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WizardProvider } from "./state/store";
import { ThemeProvider } from "./theme/ThemeProvider";
import { LanguageProvider } from "./i18n";
import { TooltipProvider } from "./components/ui/Tooltip";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <WizardProvider>
            <App />
          </WizardProvider>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
