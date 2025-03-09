import { world, EntityComponentTypes } from "@minecraft/server";
import { skeletonStrafe } from "mob/skeleton_strafe";
import { enderRandomTeleport } from "mob/enderTeleport";

export const DEFAULT_TICK = 20;

world.afterEvents.entitySpawn.subscribe(function (data) {
  if (data?.entity == null) {
    return;
  }
  if (data.entity.typeId == "minecraft:arrow") {
    skeletonStrafe(data.entity, 0.5);
  }
});

world.afterEvents.entityHurt.subscribe(function (data) {
  if (data?.hurtEntity === null) {
    return;
  }
  if (data?.damageSource === null) {
    return;
  }
  if (!data.hurtEntity.hasComponent(EntityComponentTypes.Health)) {
    return;
  }

  const projectile = data.damageSource?.damagingProjectile;
  const attacker = data.damageSource?.damagingEntity;
  const target = data.hurtEntity;
  const dimension = world.getDimension(target.dimension.id);
  if (!dimension) {
    return;
  }

  // creaking damage
  if (attacker?.typeId === "minecraft:creaking") {
    if (Math.random() < 0.5) {
      target.addEffect("wither", 60);
    }
  }

  // enderman teleport target
  if (attacker?.typeId === "minecraft:enderman") {
    enderRandomTeleport(target, 5, 0.25, 0);
  }

  // ender dragon teleport target
  if (attacker?.typeId === "minecraft:ender_dragon" && !projectile) {
    enderRandomTeleport(target, 7, 0.5, 0);
  }
});
