import { DestinyItemSocketEntryDefinition } from "bungie-net-core/models";
import { useInventoryItemDefinitions } from "./useInventoryItemDefinitions";
import { usePlugSetDefinitions } from "./usePlugSetDefinitions";

enum SocketType {
  Barrel = 1656112293,
  Magazine = 4246926293,
  LeftPerk = 1215804697,
  RightPerk = 1215804696,
}

export const useSocketsForWeapon = (weaponHash: number | string) => {
  const { data: plugSetDefinitions } = usePlugSetDefinitions();
  const { data: inventoryItems } = useInventoryItemDefinitions();

  const sockets =
    inventoryItems?.[weaponHash].sockets?.socketEntries.filter(
      (e) =>
        !!e.randomizedPlugSetHash &&
        (e.socketTypeHash === SocketType.LeftPerk ||
          e.socketTypeHash === SocketType.RightPerk)
    ) ?? [];

  const getPerks = (socektType: SocketType) =>
    sockets
      .filter((socket) => socket.socketTypeHash === socektType)
      .flatMap(
        (socket: DestinyItemSocketEntryDefinition) =>
          plugSetDefinitions?.[socket.randomizedPlugSetHash!].reusablePlugItems
            ?.filter((item) => item.currentlyCanRoll)
            .map((item) => item.plugItemHash) ?? []
      );

  return [getPerks(SocketType.LeftPerk), getPerks(SocketType.RightPerk)];
};
