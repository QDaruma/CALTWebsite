import { AnimatePresence, motion } from "framer-motion";
import { useWizard } from "./state/store";
import { TopBar } from "./components/layout/TopBar";
import { BuilderShell } from "./components/layout/BuilderShell";
import { StepWelcome } from "./components/steps/StepWelcome";
import { StepTasks } from "./components/steps/StepTasks";
import { StepSettings } from "./components/steps/StepSettings";
import { StepReview } from "./components/steps/StepReview";

const BUILDER: Record<number, () => JSX.Element> = {
  1: StepTasks,
  2: StepSettings,
  3: StepReview,
};

const variants = {
  initial: { opacity: 1, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};
const transition = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };

export default function App() {
  const { step } = useWizard();
  const Step = BUILDER[step] ?? StepTasks;

  return (
    <div className="app-bg min-h-full">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <TopBar />
      <main id="main">
        {step === 0 ? (
          <AnimatePresence mode="wait">
            <motion.div key="landing" variants={variants} initial="initial" animate="animate" exit="exit" transition={transition}>
              <StepWelcome />
            </motion.div>
          </AnimatePresence>
        ) : (
          <BuilderShell>
            <motion.div key={step} variants={variants} initial="initial" animate="animate" transition={transition}>
              <Step />
            </motion.div>
          </BuilderShell>
        )}
      </main>
    </div>
  );
}
