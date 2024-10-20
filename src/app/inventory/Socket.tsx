import { useInventoryItemDefinitions } from "@/lib/bungie/useInventoryItemDefinitions";
import { DestinyItemPlugBase } from "bungie-net-core/models";

export const Socket = (props: { plugs: DestinyItemPlugBase[] }) => {
  const { data: inventoryItemDefinitions } = useInventoryItemDefinitions();

  return (
    <div>
      {props.plugs
        .map((plug) => inventoryItemDefinitions[plug.plugItemHash])
        .filter((p) => (p.itemCategoryHashes?.length ?? 0) > 1)
        .map((plug) => (
          <div key={plug.hash}>{plug.displayProperties.name}</div>
        ))}
    </div>
  );
};
