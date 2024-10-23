import { trpcServerSideCaller } from "@/lib/trpc/server";
import ChiSquareChart from "./ChiSquareChart";
import lightGGMultimach from "./light.gg-multimach.json";
import lightGGBittersweet from "./light.gg-bittersweet.json";
import WeaponRollsCard from "@/components/WeaponRollsCard";

const MultimachData = {
  weaponHash: "3211624072",
  rolls: lightGGMultimach.map((r) => ({
    leftPerk: String(r.Perk4Hash),
    rightPerk: String(r.Perk5Hash),
    count: r.Count,
  })),
};

const BittersweetData = {
  weaponHash: "2599338625",
  rolls: lightGGBittersweet.map((r) => ({
    leftPerk: String(r.Perk4Hash),
    rightPerk: String(r.Perk5Hash),
    count: r.Count,
  })),
};

export default async function Page() {
  const commonPerkRolls = await trpcServerSideCaller.commonRolls();
  return (
    <main className="space-y-8 bg-gray-900 text-white p-4 rounded-md max-w-3xl mx-auto">
      <div className="flex flex-col gap-3">
        {commonPerkRolls.map((weapon) => (
          <ChiSquareChart key={weapon.weaponHash} {...weapon} />
        ))}
      </div>
      <WeaponRollsCard {...BittersweetData} />
      <WeaponRollsCard {...MultimachData} />
    </main>
  );
}
