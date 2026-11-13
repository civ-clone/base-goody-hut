import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import { IYieldMap } from '@civ-clone/core-world/Tile';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Unit from '@civ-clone/core-unit/Unit';
/** The conditions of the outcomes a hut offers, for its `Action` rules, and the unit a hut can give. */
/** There's an advance the unit's player could learn, other than a repeatable one. */
export declare const advanceToLearn: (
  playerResearchRegistry?: PlayerResearchRegistry
) => (goodyHut: GoodyHut, unit: Unit) => boolean;
/** The hut's square is one of `Terrains`. */
export declare const onTerrain: (
  Terrains: (typeof Terrain)[]
) => (goodyHut: GoodyHut) => boolean;
/** The squares around the hut (the default surrounding area) score at least `threshold`, weighted by `weights`. */
export declare const scoresAtLeast: (
  weights: IYieldMap[],
  threshold: number
) => (goodyHut: GoodyHut, unit: Unit) => boolean;
/** The city registry has no city on any square within `distance` of the hut. */
export declare const noCityWithin: (
  distance: number,
  cityRegistry?: CityRegistry
) => (goodyHut: GoodyHut) => boolean;
/**
 * Whether the unit's player has a city and no standing city of anyone's is within `distance` of the hut: far from
 * any settlement, but not before the player has one.
 */
export declare const remoteFromCities: (
  goodyHut: GoodyHut,
  unit: Unit,
  distance: number,
  cityRegistry: Pick<CityRegistry, 'entries' | 'getByPlayer'>
) => boolean;
/** The unit the hut gives: one of `Units` at random (one roll), for the player, on the unit's square, with no city. */
export declare const randomUnit: (
  Units: (typeof Unit)[],
  randomNumberGenerator: () => number,
  ruleRegistry?: RuleRegistry
) => (goodyHut: GoodyHut, unit: Unit) => Unit;
