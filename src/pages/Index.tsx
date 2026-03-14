import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar, Section } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { ChartSection } from "@/components/ChartSection";
import { IndicatorsSection } from "@/components/IndicatorsSection";
import { OptionsSection } from "@/components/OptionsSection";
import { StatsSection } from "@/components/StatsSection";

const sections: Record<Section, React.ComponentType> = {
  chart: ChartSection,
  indicators: IndicatorsSection,
  options: OptionsSection,
  stats: StatsSection,
};

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>("chart");
  const ActiveComponent = sections[activeSection];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar active={activeSection} onChange={setActiveSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Index;
