"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributeHuts = exports.chance = exports.noHutWithin = exports.onLand = void 0;
const GoodyHutRegistry_1 = require("@civ-clone/core-goody-hut/GoodyHutRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Distribution_1 = require("@civ-clone/core-goody-hut/Rules/Distribution");
const GoodyHut_1 = require("@civ-clone/core-goody-hut/GoodyHut");
/** A `Distribution` criterion: the square is land. */
const onLand = (tile) => tile.isLand();
exports.onLand = onLand;
/** A `Distribution` criterion: no hut is within `distance` of the square. */
const noHutWithin = (distance, goodyHutRegistry = GoodyHutRegistry_1.instance) => (tile) => tile
    .getSurroundingArea(distance)
    .every((tile) => goodyHutRegistry.getByTile(tile) === null);
exports.noHutWithin = noHutWithin;
/** A `Distribution` criterion: a roll below `probability`. One number is drawn each time it's asked. */
const chance = (probability, randomNumberGenerator) => () => randomNumberGenerator() < probability;
exports.chance = chance;
/**
 * A world `Built` effect: puts a hut on each square every `Distribution` rule allows, in the world's order. Each
 * square's rules are asked in order until one says no, so a later rule (a roll, say) is only asked for squares that
 * pass the earlier ones, and a hut placed counts for the squares after it.
 */
const distributeHuts = (goodyHutRegistry = GoodyHutRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => (world) => {
    const goodyHutRules = ruleRegistry.get(Distribution_1.default);
    world.forEach((tile) => {
        if (goodyHutRules.every((rule) => rule.validate(tile))) {
            goodyHutRegistry.register(new GoodyHut_1.default(tile));
        }
    });
};
exports.distributeHuts = distributeHuts;
//# sourceMappingURL=placement.js.map