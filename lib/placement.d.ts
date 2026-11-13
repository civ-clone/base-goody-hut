import { GoodyHutRegistry } from '@civ-clone/core-goody-hut/GoodyHutRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import World from '@civ-clone/core-world/World';
/** A `Distribution` criterion: the square is land. */
export declare const onLand: (tile: Tile) => boolean;
/** A `Distribution` criterion: no hut is within `distance` of the square. */
export declare const noHutWithin: (
  distance: number,
  goodyHutRegistry?: GoodyHutRegistry
) => (tile: Tile) => boolean;
/** A `Distribution` criterion: a roll below `probability`. One number is drawn each time it's asked. */
export declare const chance: (
  probability: number,
  randomNumberGenerator: () => number
) => () => boolean;
/**
 * A world `Built` effect: puts a hut on each square every `Distribution` rule allows, in the world's order. Each
 * square's rules are asked in order until one says no, so a later rule (a roll, say) is only asked for squares that
 * pass the earlier ones, and a hut placed counts for the squares after it.
 */
export declare const distributeHuts: (
  goodyHutRegistry?: GoodyHutRegistry,
  ruleRegistry?: RuleRegistry
) => (world: World) => void;
