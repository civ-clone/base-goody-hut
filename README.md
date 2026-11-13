# base-goody-hut

The goody-hut wiring, for a ruleset to wrap in its own `Distribution`, `Built`, `Moved`, `Discovered`,
`ActionPerformed`, `Action` and `Unit` rules with its own numbers, terrains, units and outcomes:

- `lib/placement`: `onLand`, `noHutWithin(distance, …)` and `chance(probability, rng)`, `Distribution` criteria, and
  `distributeHuts(…)`, the `Built` effect that places a hut on every square the `Distribution` rules allow.
- `lib/entering`: `onHut` and `enterHut`, for a `Moved` rule; `removeHut`, `performRandomAction(rng)` and
  `emitHutDiscovered`, for `Discovered` rules; `emitHutActionPerformed`, for an `ActionPerformed` rule.
- `lib/outcomes`: `advanceToLearn`, `onTerrain(Terrains)`, `scoresAtLeast(weights, threshold)` and
  `noCityWithin(distance, …)`, conditions of the outcomes a hut offers; `remoteFromCities(hut, unit, distance, …)`;
  `randomUnit(Units, rng, …)`, a goody-hut `Unit` effect.

The outcomes themselves are `base-goody-hut-advance`, `-city`, `-gold` and `-unit`. A library: it registers no rules.
See `civ1-goody-hut` for Civilization's huts.
