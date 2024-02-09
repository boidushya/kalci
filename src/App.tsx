import { InfoCard } from "./components/InfoCard";
import { ModeToggle } from "./components/ModeToggle";

function App() {
  return (
    <main>
      <nav className="fixed flex items-center justify-between w-full px-6 py-4">
        <h1 className="text-3xl font-bold">🧮</h1>
        <ModeToggle />
      </nav>
      <div className="grid items-start justify-center h-screen pt-20">
        <InfoCard />
      </div>
    </main>
  );
}

export default App;
