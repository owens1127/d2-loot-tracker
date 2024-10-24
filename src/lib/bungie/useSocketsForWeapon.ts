import { DestinyItemSocketEntryDefinition } from "bungie-net-core/models";
import { useInventoryItemDefinitionsSuspended } from "./useInventoryItemDefinitions";
import { usePlugSetDefinitions } from "./usePlugSetDefinitions";

enum SocketType {
  Barrel = 1656112293,
  Magazine = 4246926293,
  LeftPerk = 1215804697,
  RightPerk = 1215804696,
}

export const useSocketsForWeapon = (weaponHash: number | string) => {
  const { data: plugSetDefinitions } = usePlugSetDefinitions();
  const { data: inventoryItems } = useInventoryItemDefinitionsSuspended();

  const sockets =
    inventoryItems[weaponHash].sockets?.socketEntries.filter(
      (e) =>
        !!e.randomizedPlugSetHash &&
        (e.socketTypeHash === SocketType.LeftPerk ||
          e.socketTypeHash === SocketType.RightPerk)
    ) ?? [];

  const mapper = (socket: DestinyItemSocketEntryDefinition) =>
    plugSetDefinitions?.[socket.randomizedPlugSetHash!].reusablePlugItems
      ?.map((item, idx) => ({
        currentlyCanRoll: item.currentlyCanRoll,
        perkItemHash: item.plugItemHash,
        socketIndex: idx,
      }))
      .filter(
        (
          item
        ): item is {
          currentlyCanRoll: true;
          perkItemHash: number;
          socketIndex: number;
        } => item.currentlyCanRoll
      ) ?? [];

  const leftPerks =
    sockets
      .filter((socket) => socket.socketTypeHash === SocketType.LeftPerk)
      .flatMap(mapper) ?? [];

  const rightPerks =
    sockets
      .filter((socket) => socket.socketTypeHash === SocketType.RightPerk)
      .flatMap(mapper) ?? [];

  return [leftPerks, rightPerks];
};
