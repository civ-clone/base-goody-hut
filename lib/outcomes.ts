import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import { IYieldMap } from '@civ-clone/core-world/Tile';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Unit from '@civ-clone/core-unit/Unit';

/** The conditions of the outcomes a hut offers, for its `Action` rules, and the unit a hut can give. */

/** There's an advance the unit's player could learn, other than a repeatable one. */
export const advanceToLearn =
  (
    playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
  ): ((goodyHut: GoodyHut, unit: Unit) => boolean) =>
  (goodyHut: GoodyHut, unit: Unit): boolean =>
    playerResearchRegistry
      .getByPlayer(unit.player())
      .available()
      .some((AvailableAdvance): boolean => !AvailableAdvance.repeatable);

/** The hut's square is one of `Terrains`. */
export const onTerrain =
  (Terrains: (typeof Terrain)[]): ((goodyHut: GoodyHut) => boolean) =>
  (goodyHut: GoodyHut): boolean =>
    Terrains.some(
      (TerrainType: typeof Terrain) =>
        goodyHut.tile().terrain() instanceof TerrainType
    );

/** The squares around the hut (the default surrounding area) score at least `threshold`, weighted by `weights`. */
export const scoresAtLeast =
  (
    weights: IYieldMap[],
    threshold: number
  ): ((goodyHut: GoodyHut, unit: Unit) => boolean) =>
  (goodyHut: GoodyHut, unit: Unit): boolean =>
    goodyHut.tile().getSurroundingArea().score(null, weights) >= threshold;

/** The city registry has no city on any square within `distance` of the hut. */
export const noCityWithin =
  (
    distance: number,
    cityRegistry: CityRegistry = cityRegistryInstance
  ): ((goodyHut: GoodyHut) => boolean) =>
  (goodyHut: GoodyHut): boolean =>
    goodyHut
      .tile()
      .getSurroundingArea(distance)
      .every((tile) => cityRegistry.getByTile(tile) === null);

/**
 * Whether the unit's player has a city and no standing city of anyone's is within `distance` of the hut: far from
 * any settlement, but not before the player has one.
 */
export const remoteFromCities = (
  goodyHut: GoodyHut,
  unit: Unit,
  distance: number,
  cityRegistry: Pick<CityRegistry, 'entries' | 'getByPlayer'>
): boolean =>
  cityRegistry.getByPlayer(unit.player()).length > 0 &&
  cityRegistry
    .entries()
    .every(
      (city): boolean =>
        city.destroyed() ||
        city.tile().distanceFrom(goodyHut.tile()) >= distance
    );

/** The unit the hut gives: one of `Units` at random (one roll), for the player, on the unit's square, with no city. */
export const randomUnit =
  (
    Units: (typeof Unit)[],
    randomNumberGenerator: () => number,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ): ((goodyHut: GoodyHut, unit: Unit) => Unit) =>
  (goodyHut: GoodyHut, unit: Unit): Unit => {
    const RandomUnit =
      Units[Math.floor(Units.length * randomNumberGenerator())];

    return new RandomUnit(null, unit.player(), unit.tile(), ruleRegistry);
  };
