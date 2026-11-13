"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitHutActionPerformed = exports.emitHutDiscovered = exports.performRandomAction = exports.removeHut = exports.enterHut = exports.onHut = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const GoodyHutRegistry_1 = require("@civ-clone/core-goody-hut/GoodyHutRegistry");
/** A unit `Moved` criterion: there's a hut on the unit's square. */
const onHut = (goodyHutRegistry = GoodyHutRegistry_1.instance) => (unit) => goodyHutRegistry.getByTile(unit.tile()) !== null;
exports.onHut = onHut;
/** A unit `Moved` effect: the unit opens the hut on its square. */
const enterHut = (goodyHutRegistry = GoodyHutRegistry_1.instance) => (unit) => {
    const goodyHut = goodyHutRegistry.getByTile(unit.tile());
    goodyHut.process(unit);
};
exports.enterHut = enterHut;
/** A `Discovered` effect: the hut is gone. */
const removeHut = (goodyHutRegistry = GoodyHutRegistry_1.instance) => (goodyHut) => goodyHutRegistry.unregister(goodyHut);
exports.removeHut = removeHut;
/** A `Discovered` effect: one of the actions the hut offers the unit is performed, picked at random with one roll. */
const performRandomAction = (randomNumberGenerator) => (goodyHut, unit) => {
    const availableGoodyHutActions = goodyHut.actions(unit), randomAction = availableGoodyHutActions[Math.floor(availableGoodyHutActions.length * randomNumberGenerator())];
    goodyHut.action(randomAction);
};
exports.performRandomAction = performRandomAction;
/** A `Discovered` effect: tells the engine's listeners (`goody-hut:discovered`). */
const emitHutDiscovered = (engine = Engine_1.instance) => (goodyHut, unit) => {
    engine.emit('goody-hut:discovered', goodyHut, unit);
};
exports.emitHutDiscovered = emitHutDiscovered;
/** An `ActionPerformed` effect: tells the engine's listeners (`goody-hut:action-performed`). */
const emitHutActionPerformed = (engine = Engine_1.instance) => (goodyHut, action) => {
    engine.emit('goody-hut:action-performed', goodyHut, action);
};
exports.emitHutActionPerformed = emitHutActionPerformed;
//# sourceMappingURL=entering.js.map