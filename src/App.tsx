import { Sparkles } from "lucide-react";
import { InfoCard } from "./components/InfoCard";
import { ModeToggle } from "./components/ModeToggle";
import { ParseDataDialog } from "./components/ParseDataDialog";
import { Button } from "./components/ui/button";
import { useParseDialogStore, useTriggerRefresh } from "./stores/StateStore";
import { ResetDialog } from "./components/ResetDialog";

function App() {
  const { setOpen } = useParseDialogStore();
  const { refresh } = useTriggerRefresh();
  return (
    <main>
      <nav className="fixed flex items-center justify-between w-full px-6 py-4">
        <h1 className="text-3xl font-bold">🧮</h1>
        <div className="flex items-center gap-2">
          <ResetDialog />
          <div className="relative inline-flex group">
            <div className="absolute transition-all duration-500 inset-full bg-gradient-to-tr from-sky-600/30 via-pink-600/30 to-orange-600/30 rounded blur-lg group-hover:-inset-px" />

            <Button
              variant="outline"
              onClick={() => setOpen(true)}
              className="pl-3 relative"
            >
              <Sparkles size={14} className="inline-block mr-2 align-middle" />
              Parse Data
            </Button>
          </div>
          <ModeToggle />
        </div>
      </nav>
      <div className="grid items-start justify-center h-screen pt-20">
        {!refresh && <InfoCard />}
      </div>
      <ParseDataDialog />
    </main>
  );
}

export default App;
