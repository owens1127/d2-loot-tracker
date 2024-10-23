"use client";

import WeaponRollsCard from "@/components/WeaponRollsCard";
import { trpc } from "@/lib/trpc/client";

export default function Page() {
  const [commonPerkRolls] = trpc.commonRolls.useSuspenseQuery();

  return (
    <main>
      <div className="space-y-8 bg-gray-900 text-white p-4 rounded-md max-w-3xl mx-auto">
        {commonPerkRolls.map((weapon) => (
          <WeaponRollsCard key={weapon.weaponHash} {...weapon} />
        ))}
      </div>
    </main>
  );
}
