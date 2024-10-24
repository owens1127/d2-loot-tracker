import { trpcServerSideCaller } from "@/lib/trpc/server";
import ChiSquareChart from "./ChiSquareChart";
import NormalDistributionChart from "./NormalDistributionChart";

export default async function Page() {
  const commonPerkRolls = await trpcServerSideCaller.commonRolls();
  return (
    <main className="space-y-8 bg-gray-900 text-white p-4 rounded-md max-w-3xl mx-auto">
      <div className="flex flex-col gap-3">
        {commonPerkRolls.map((weapon) => (
          <ChiSquareChart key={weapon.weaponHash} {...weapon} />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {commonPerkRolls.map((weapon) => (
          <NormalDistributionChart key={weapon.weaponHash} {...weapon} />
        ))}
      </div>
    </main>
  );
}
