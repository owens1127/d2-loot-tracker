import "./globals.css";
import { BungieSessionProvider } from "next-bungie-auth/client";
import { getServerSession } from "./api/auth";
import { TRPCProvider } from "@/lib/trpc/client";
import { HydrateClient, trpc } from "@/lib/trpc/server";
import { Header } from "@/components/Header";
import { BungieClientProvider } from "@/lib/bungie/client";

export const metadata = {
  title: "D2 Loot Tracker",
  description: "Created by Newo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = getServerSession();

  void trpc.activeHashes.prefetch();

  return (
    <html lang="en">
      <body className="antialiased">
        <BungieSessionProvider
          sessionPath="/api/auth/session"
          deauthorizePath="/api/auth/deauthorize"
          initialSession={session}
        >
          <BungieClientProvider>
            <TRPCProvider>
              <HydrateClient>
                <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col">
                  <Header />
                  {children}
                </div>
              </HydrateClient>
            </TRPCProvider>
          </BungieClientProvider>
        </BungieSessionProvider>
      </body>
    </html>
  );
}
