import { Engine } from '@civ-clone/core-engine/Engine';
import { GoodyHutRegistry } from '@civ-clone/core-goody-hut/GoodyHutRegistry';
import Action from '@civ-clone/core-goody-hut/Action';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import Unit from '@civ-clone/core-unit/Unit';
/** A unit `Moved` criterion: there's a hut on the unit's square. */
export declare const onHut: (
  goodyHutRegistry?: GoodyHutRegistry
) => (unit: Unit) => boolean;
/** A unit `Moved` effect: the unit opens the hut on its square. */
export declare const enterHut: (
  goodyHutRegistry?: GoodyHutRegistry
) => (unit: Unit) => void;
/** A `Discovered` effect: the hut is gone. */
export declare const removeHut: (
  goodyHutRegistry?: GoodyHutRegistry
) => (goodyHut: GoodyHut) => void;
/** A `Discovered` effect: one of the actions the hut offers the unit is performed, picked at random with one roll. */
export declare const performRandomAction: (
  randomNumberGenerator: () => number
) => (goodyHut: GoodyHut, unit: Unit) => void;
/** A `Discovered` effect: tells the engine's listeners (`goody-hut:discovered`). */
export declare const emitHutDiscovered: (
  engine?: Engine
) => (goodyHut: GoodyHut, unit: Unit) => void;
/** An `ActionPerformed` effect: tells the engine's listeners (`goody-hut:action-performed`). */
export declare const emitHutActionPerformed: (
  engine?: Engine
) => (goodyHut: GoodyHut, action: Action) => void;
