import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  GoodyHutRegistry,
  instance as goodyHutRegistryInstance,
} from '@civ-clone/core-goody-hut/GoodyHutRegistry';
import Action from '@civ-clone/core-goody-hut/Action';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import Unit from '@civ-clone/core-unit/Unit';

/** A unit `Moved` criterion: there's a hut on the unit's square. */
export const onHut =
  (
    goodyHutRegistry: GoodyHutRegistry = goodyHutRegistryInstance
  ): ((unit: Unit) => boolean) =>
  (unit: Unit): boolean =>
    goodyHutRegistry.getByTile(unit.tile()) !== null;

/** A unit `Moved` effect: the unit opens the hut on its square. */
export const enterHut =
  (
    goodyHutRegistry: GoodyHutRegistry = goodyHutRegistryInstance
  ): ((unit: Unit) => void) =>
  (unit: Unit): void => {
    const goodyHut = goodyHutRegistry.getByTile(unit.tile());

    (goodyHut as GoodyHut).process(unit);
  };

/** A `Discovered` effect: the hut is gone. */
export const removeHut =
  (
    goodyHutRegistry: GoodyHutRegistry = goodyHutRegistryInstance
  ): ((goodyHut: GoodyHut) => void) =>
  (goodyHut: GoodyHut): void =>
    goodyHutRegistry.unregister(goodyHut);

/** A `Discovered` effect: one of the actions the hut offers the unit is performed, picked at random with one roll. */
export const performRandomAction =
  (
    randomNumberGenerator: () => number
  ): ((goodyHut: GoodyHut, unit: Unit) => void) =>
  (goodyHut: GoodyHut, unit: Unit): void => {
    const availableGoodyHutActions = goodyHut.actions(unit),
      randomAction =
        availableGoodyHutActions[
          Math.floor(availableGoodyHutActions.length * randomNumberGenerator())
        ];

    goodyHut.action(randomAction);
  };

/** A `Discovered` effect: tells the engine's listeners (`goody-hut:discovered`). */
export const emitHutDiscovered =
  (
    engine: Engine = engineInstance
  ): ((goodyHut: GoodyHut, unit: Unit) => void) =>
  (goodyHut: GoodyHut, unit: Unit): void => {
    engine.emit('goody-hut:discovered', goodyHut, unit);
  };

/** An `ActionPerformed` effect: tells the engine's listeners (`goody-hut:action-performed`). */
export const emitHutActionPerformed =
  (
    engine: Engine = engineInstance
  ): ((goodyHut: GoodyHut, action: Action) => void) =>
  (goodyHut: GoodyHut, action: Action): void => {
    engine.emit('goody-hut:action-performed', goodyHut, action);
  };
