"use client";

import { BungieSessionSuspender } from "next-bungie-auth/client";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <BungieSessionSuspender fallback={() => <></>}>
      {children}
    </BungieSessionSuspender>
  );
}
