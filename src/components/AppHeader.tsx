import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function AppHeader() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    queryClient.invalidateQueries();
    setLastUpdated(new Date());
    setTimeout(() => setSpinning(false), 800);
  };

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 border-b border-panel-border bg-panel flex items-center px-4 justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="font-mono font-bold text-lg tracking-tight">
          <span className="text-foreground">Q</span>
          <span className="text-muted-foreground">F</span>
        </div>
      </div>

      <div className="font-mono text-sm text-muted-foreground tracking-wider">
        NIFTY50 · <span className="text-foreground">Live Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">
          {lastUpdated.toLocaleTimeString()}
        </span>
        <button
          onClick={handleRefresh}
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          title="Refresh all data"
        >
          <RefreshCw className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
}
