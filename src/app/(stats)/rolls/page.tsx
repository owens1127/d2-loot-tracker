import WeaponRollsCard from "@/app/(stats)/rolls/WeaponRollsCard";
import { trpcServerSideCaller } from "@/lib/trpc/server";

export default async function Page() {
  const commonPerkRolls = await trpcServerSideCaller.commonRolls();

  return (
    <main>
      <div className="flex flex-wrap align-top gap-8 text-white p-4 rounded-md mx-auto">
        {commonPerkRolls.map((weapon) => (
          <WeaponRollsCard key={weapon.weaponHash} {...weapon} />
        ))}
      </div>
    </main>
  );
}
