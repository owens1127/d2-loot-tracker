import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-grow flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="border-4 border-dashed border-zinc-700 rounded-lg p-12">
          <h1 className="text-4xl font-bold mb-4">D2 Loot Tracker</h1>
          <p className="text-xl text-zinc-400">
            Sign in to begin and navigate to{" "}
            <Link href="/inventory">/inventory</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
