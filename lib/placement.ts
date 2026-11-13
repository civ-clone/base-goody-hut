import {
  GoodyHutRegistry,
  instance as goodyHutRegistryInstance,
} from '@civ-clone/core-goody-hut/GoodyHutRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Distribution from '@civ-clone/core-goody-hut/Rules/Distribution';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import Tile from '@civ-clone/core-world/Tile';
import World from '@civ-clone/core-world/World';

/** A `Distribution` criterion: the square is land. */
export const onLand = (tile: Tile): boolean => tile.isLand();

/** A `Distribution` criterion: no hut is within `distance` of the square. */
export const noHutWithin =
  (
    distance: number,
    goodyHutRegistry: GoodyHutRegistry = goodyHutRegistryInstance
  ): ((tile: Tile) => boolean) =>
  (tile: Tile): boolean =>
    tile
      .getSurroundingArea(distance)
      .every(
        (tile: Tile): boolean => goodyHutRegistry.getByTile(tile) === null
      );

/** A `Distribution` criterion: a roll below `probability`. One number is drawn each time it's asked. */
export const chance =
  (probability: number, randomNumberGenerator: () => number): (() => boolean) =>
  (): boolean =>
    randomNumberGenerator() < probability;

/**
 * A world `Built` effect: puts a hut on each square every `Distribution` rule allows, in the world's order. Each
 * square's rules are asked in order until one says no, so a later rule (a roll, say) is only asked for squares that
 * pass the earlier ones, and a hut placed counts for the squares after it.
 */
export const distributeHuts =
  (
    goodyHutRegistry: GoodyHutRegistry = goodyHutRegistryInstance,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ): ((world: World) => void) =>
  (world: World): void => {
    const goodyHutRules = ruleRegistry.get(Distribution);

    world.forEach((tile: Tile): void => {
      if (
        goodyHutRules.every((rule: Distribution): boolean =>
          rule.validate(tile)
        )
      ) {
        goodyHutRegistry.register(new GoodyHut(tile));
      }
    });
  };
