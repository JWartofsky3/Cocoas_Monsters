import { world, EntityComponentTypes } from "@minecraft/server";
import { throwBy } from "mob/throwBy";
import { rollWebAttack } from "mob/shootWeb";
import { ogreLaugh } from "mob/ogreLaugh";
import { useAmethystStaff } from "item/amethyst_staff";
import { useEchoStaff } from "item/echo_staff";
import { usePhasedEnderPearl } from "item/phased_ender_pearl";
import { enderRandomTeleport } from "mob/enderTeleport";
import { handleEndSpawn } from "mob/endSpawns";
import { rollCastFire } from "mob/castFire";
import { rollBecomeBat, vampireHeal, vampireHurt } from "mob/vampire";
import { rollBecomeSummoner } from "mob/become_summoner";
import { angerEndermen } from "mob/angerEndermen";
import { bombDamage } from "item/bomb_damage";
import { useFireStaff } from "item/fire_staff";
import { rollFreeze } from "mob/freeze";
import { IceDagger } from "item/ice_dagger";
import { VenomShank } from "item/venom_shank";
import { Illumina } from "item/illumina";
import { CustomSword } from "item/custom_tools";
import { runEarthquake } from "mob/earthquake";
import { rollOgreRoar } from "mob/ogreRoar";
import { rollLeap } from "mob/yetiLeap";
export const DEFAULT_TICK = 20;
world.beforeEvents.worldInitialize.subscribe(function (data) {
    data.itemComponentRegistry.registerCustomComponent("minere:ice_dagger", IceDagger);
    data.itemComponentRegistry.registerCustomComponent("minere:venom_shank", VenomShank);
    data.itemComponentRegistry.registerCustomComponent("minere:illumina", Illumina);
    data.itemComponentRegistry.registerCustomComponent("minere:custom_sword", CustomSword);
});
world.beforeEvents.entityRemove.subscribe(function (data) {
    angerEndermen(data);
});
world.beforeEvents.itemUse.subscribe((data) => {
    useAmethystStaff(data);
    useEchoStaff(data);
    useFireStaff(data);
});
world.afterEvents.itemUse.subscribe((data) => {
    usePhasedEnderPearl(data);
});
world.afterEvents.entityDie.subscribe(function (data) {
    ogreLaugh(data?.damageSource?.damagingEntity);
});
world.afterEvents.entitySpawn.subscribe(function (data) {
    if (data?.entity == null) {
        return;
    }
    runEarthquake(data.entity);
    if (data.entity.typeId == "minere:bomb") {
        world.playSound("random.fuse", data.entity.location);
    }
    if (data.entity.typeId == "minere:demon") {
        rollBecomeSummoner(data.entity, 0.2);
    }
    handleEndSpawn(data.entity);
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
    if (attacker?.typeId === "minere:bomb") {
        bombDamage(data?.hurtEntity, data?.damage, data?.damageSource);
    }
    // throwing
    if (attacker?.typeId === "minere:yeti" ||
        attacker?.typeId === "minere:walker") {
        throwBy(attacker, target, 5, 10);
    }
    // yeti leap
    if (attacker?.typeId === "minere:yeti") {
        rollLeap(attacker, target, 3, 24, 1, 1, 20, 6, 0.4, 0.2);
    }
    if (target?.typeId === "minere:yeti") {
        rollLeap(target, attacker, 3, 24, 1, 1, 20, 6, 0.4, 0.2);
    }
    // web spider shooting webs
    if (attacker?.typeId === "minere:web_spider" &&
        target?.typeId === "minecraft:player") {
        rollWebAttack(attacker, target, 0.6);
    }
    if (target?.typeId === "minere:web_spider" &&
        attacker?.typeId === "minecraft:player") {
        rollWebAttack(target, attacker, 0.4);
    }
    // demon shooting fire
    if (attacker?.typeId === "minere:demon") {
        rollCastFire(attacker, target, 0.25, 100);
    }
    if (target?.typeId === "minere:demon") {
        if (projectile) {
            rollCastFire(target, attacker, 0.33, 100);
            rollBecomeSummoner(target, 0.33);
        }
        else {
            rollCastFire(target, attacker, 0.25, 100);
            rollBecomeSummoner(target, 0.2);
        }
    }
    // ogre roar
    if (attacker?.typeId === "minere:ogre") {
        rollOgreRoar(attacker, target, 0.25, target?.typeId === "minecraft:player");
    }
    if (target?.typeId === "minere:ogre") {
        rollOgreRoar(target, attacker, 0.25, attacker?.typeId === "minecraft:player");
    }
    // freeze freezing
    if (attacker?.typeId === "minere:freeze") {
        rollFreeze(target, attacker);
    }
    // ender phantom teleport target
    if (attacker?.typeId === "minere:ender_phantom") {
        enderRandomTeleport(target, 7, 0.35, 0);
    }
    // ender phantom teleport self
    if (target?.typeId === "minere:ender_phantom") {
        enderRandomTeleport(target, 40, 0.35, 4);
    }
    if (attacker?.typeId === "minere:vampire") {
        vampireHeal(attacker, target);
    }
    if (target?.typeId === "minere:vampire" || target.typeId == "minere:ghost") {
        vampireHurt(target, attacker);
        if ((!!projectile || !!attacker) && target?.typeId === "minere:vampire") {
            rollBecomeBat(target, 0.2, 0.5);
        }
    }
});
