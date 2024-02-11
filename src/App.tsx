import { InfoCard } from "./components/InfoCard";
import { ModeToggle } from "./components/ModeToggle";
import { ParseDataDialog } from "./components/ParseDataInput";
import { useTriggerRefresh } from "./stores/StateStore";
import { ResetDialog } from "./components/ResetDialog";
import Image from "next/image";

function App() {
  const { refresh } = useTriggerRefresh();
  return (
    <main>
      <nav className="fixed flex items-center justify-between w-full px-6 py-4">
        <h1 className="text-3xl font-bold relative flex-shrink-0">
          <div className="w-12 h-12 bg-yellow-200/10 -left-[6px] -top-[6px] absolute rounded-full blur-lg" />
          <Image
            src="/android-chrome-192x192.png"
            alt="Kamino Logo"
            width={36}
            height={36}
            priority
            loading="eager"
            className="relative"
          />
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative inline-flex group">
            <div className="absolute transition-all duration-500 inset-full bg-gradient-to-tr from-sky-600/30 via-pink-600/30 to-orange-600/30 rounded blur-lg group-hover:-inset-px" />
            <ParseDataDialog />
          </div>
          <ResetDialog />
          <ModeToggle />
        </div>
      </nav>
      <div className="grid items-start justify-center h-screen pt-[68px]">
        {!refresh && <InfoCard />}
      </div>
    </main>
  );
}

export default App;
