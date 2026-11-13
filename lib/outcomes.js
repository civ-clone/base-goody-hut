"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomUnit = exports.remoteFromCities = exports.noCityWithin = exports.scoresAtLeast = exports.onTerrain = exports.advanceToLearn = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
/** The conditions of the outcomes a hut offers, for its `Action` rules, and the unit a hut can give. */
/** There's an advance the unit's player could learn, other than a repeatable one. */
const advanceToLearn = (playerResearchRegistry = PlayerResearchRegistry_1.instance) => (goodyHut, unit) => playerResearchRegistry
    .getByPlayer(unit.player())
    .available()
    .some((AvailableAdvance) => !AvailableAdvance.repeatable);
exports.advanceToLearn = advanceToLearn;
/** The hut's square is one of `Terrains`. */
const onTerrain = (Terrains) => (goodyHut) => Terrains.some((TerrainType) => goodyHut.tile().terrain() instanceof TerrainType);
exports.onTerrain = onTerrain;
/** The squares around the hut (the default surrounding area) score at least `threshold`, weighted by `weights`. */
const scoresAtLeast = (weights, threshold) => (goodyHut, unit) => goodyHut.tile().getSurroundingArea().score(null, weights) >= threshold;
exports.scoresAtLeast = scoresAtLeast;
/** The city registry has no city on any square within `distance` of the hut. */
const noCityWithin = (distance, cityRegistry = CityRegistry_1.instance) => (goodyHut) => goodyHut
    .tile()
    .getSurroundingArea(distance)
    .every((tile) => cityRegistry.getByTile(tile) === null);
exports.noCityWithin = noCityWithin;
/**
 * Whether the unit's player has a city and no standing city of anyone's is within `distance` of the hut: far from
 * any settlement, but not before the player has one.
 */
const remoteFromCities = (goodyHut, unit, distance, cityRegistry) => cityRegistry.getByPlayer(unit.player()).length > 0 &&
    cityRegistry
        .entries()
        .every((city) => city.destroyed() ||
        city.tile().distanceFrom(goodyHut.tile()) >= distance);
exports.remoteFromCities = remoteFromCities;
/** The unit the hut gives: one of `Units` at random (one roll), for the player, on the unit's square, with no city. */
const randomUnit = (Units, randomNumberGenerator, ruleRegistry = RuleRegistry_1.instance) => (goodyHut, unit) => {
    const RandomUnit = Units[Math.floor(Units.length * randomNumberGenerator())];
    return new RandomUnit(null, unit.player(), unit.tile(), ruleRegistry);
};
exports.randomUnit = randomUnit;
//# sourceMappingURL=outcomes.js.map