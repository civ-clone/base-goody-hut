import {
  advanceToLearn,
  noCityWithin,
  onTerrain,
  randomUnit,
  remoteFromCities,
  scoresAtLeast,
} from '../lib/outcomes';
import { chance, distributeHuts, noHutWithin, onLand } from '../lib/placement';
import {
  emitHutActionPerformed,
  emitHutDiscovered,
  enterHut,
  onHut,
  performRandomAction,
  removeHut,
} from '../lib/entering';
import ActionPerformed from '@civ-clone/core-goody-hut/Rules/ActionPerformed';
import ActionRule from '@civ-clone/core-goody-hut/Rules/Action';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Discovered from '@civ-clone/core-goody-hut/Rules/Discovered';
import Distribution from '@civ-clone/core-goody-hut/Rules/Distribution';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import GoodyHutAction from '@civ-clone/core-goody-hut/Action';
import GoodyHutRegistry from '@civ-clone/core-goody-hut/GoodyHutRegistry';
import Player from '@civ-clone/core-player/Player';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import Yield from '@civ-clone/core-yield/Yield';
import { expect } from 'chai';

class Meadow extends Terrain {}
class Marsh extends Terrain {}
class Scout extends Unit {}
class Rider extends Unit {}
class Grain extends Yield {}

const sequence = (...values: number[]) => {
  const drawn: number[] = [];

  return {
    drawn,
    rng: (): number => {
      const value = values.shift();

      if (value === undefined) {
        throw new Error('drew too many numbers');
      }

      drawn.push(value);

      return value;
    },
  };
};

describe('placement', (): void => {
  it('places a hut wherever every Distribution rule allows, asking them in order, and counts each hut placed', (): void => {
    const goodyHutRegistry = new GoodyHutRegistry(),
      ruleRegistry = new RuleRegistry(),
      { drawn, rng } = sequence(0.1, 0.3, 0.1),
      tiles: Tile[] = [],
      radii: number[] = [],
      tile = (land: boolean, near: () => Tile[] = () => []): Tile =>
        ({
          isLand: () => land,
          getSurroundingArea: (radius: number) => {
            radii.push(radius);

            return near();
          },
        } as unknown as Tile);

    tiles.push(
      tile(true),
      tile(false),
      tile(true),
      tile(true, () => [tiles[0]]),
      tile(true)
    );

    ruleRegistry.register(
      new Distribution(new Criterion(onLand)),
      new Distribution(new Criterion(noHutWithin(2, goodyHutRegistry))),
      new Distribution(new Criterion(chance(0.2, rng)))
    );

    distributeHuts(
      goodyHutRegistry,
      ruleRegistry
    )({
      forEach: (callback: (tile: Tile) => void) => tiles.forEach(callback),
    } as unknown as World);

    expect(goodyHutRegistry.entries().map((hut) => hut.tile())).to.deep.equal([
      tiles[0],
      tiles[4],
    ]);
    expect(drawn).to.deep.equal([0.1, 0.3, 0.1]);
    expect(radii).to.deep.equal([2, 2, 2, 2]);
  });

  it('rolls below the probability, one number each time', (): void => {
    const { drawn, rng } = sequence(0.04999, 0.05, 0.9),
      roll = chance(0.05, rng);

    expect([roll(), roll(), roll()]).to.deep.equal([true, false, false]);
    expect(drawn).to.have.length(3);
  });
});

describe('entering a hut', (): void => {
  it('opens the hut on the unit’s square, and only there', (): void => {
    const goodyHutRegistry = new GoodyHutRegistry(),
      ruleRegistry = new RuleRegistry(),
      square = {} as Tile,
      hut = new GoodyHut(square, ruleRegistry),
      unitOn = (tile: Tile) => ({ tile: () => tile } as unknown as Unit),
      opened: Unit[] = [],
      explorer = unitOn(square);

    goodyHutRegistry.register(hut);
    ruleRegistry.register(
      new Discovered(
        new Effect((goodyHut: GoodyHut, unit: Unit): void => {
          expect(goodyHut).to.equal(hut);
          opened.push(unit);
        })
      )
    );

    expect(onHut(goodyHutRegistry)(unitOn({} as Tile))).false;
    expect(onHut(goodyHutRegistry)(explorer)).true;

    enterHut(goodyHutRegistry)(explorer);

    expect(opened).to.deep.equal([explorer]);
  });

  it('removes the hut, performs one of its actions picked with one roll, and tells the listeners', (): void => {
    const goodyHutRegistry = new GoodyHutRegistry(),
      ruleRegistry = new RuleRegistry(),
      engine = new Engine(),
      explorer = {} as Unit,
      hut = new GoodyHut({} as Tile, ruleRegistry),
      events: string[] = [];

    class Named extends GoodyHutAction {
      private _name: string;

      constructor(name: string) {
        super(hut, explorer);

        this._name = name;
      }

      perform(): void {
        events.push(this._name);
      }
    }

    goodyHutRegistry.register(hut);
    engine.on('goody-hut:discovered', (goodyHut, unit) =>
      events.push(`discovered ${goodyHut === hut} ${unit === explorer}`)
    );
    engine.on('goody-hut:action-performed', (goodyHut, action) =>
      events.push(`performed ${goodyHut === hut} ${action instanceof Named}`)
    );

    ruleRegistry.register(
      new Discovered(new Effect(removeHut(goodyHutRegistry))),
      new Discovered(new Effect(performRandomAction(sequence(0.5).rng))),
      new Discovered(new Effect(emitHutDiscovered(engine))),
      new ActionPerformed(new Effect(emitHutActionPerformed(engine))),
      new ActionRule(new Effect(() => new Named('a'))),
      new ActionRule(new Effect(() => new Named('b'))),
      new ActionRule(new Effect(() => new Named('c'))),
      new ActionRule(new Effect(() => new Named('d')))
    );
    hut.process(explorer);

    expect(goodyHutRegistry.entries()).to.deep.equal([]);
    // floor(4 * 0.5) = 2: the third action.
    expect(events).to.deep.equal([
      'performed true true',
      'c',
      'discovered true true',
    ]);
  });
});

describe('outcomes', (): void => {
  const hutOn = (
    terrain: Terrain,
    score: number = 0,
    near: Tile[] = []
  ): {
    areas: (number | undefined)[];
    hut: GoodyHut;
    scored: unknown[][];
  } => {
    const areas: (number | undefined)[] = [],
      scored: unknown[][] = [],
      tile = {
        terrain: () => terrain,
        getSurroundingArea: (radius?: number) => {
          areas.push(radius);

          return Object.assign([...near], {
            score: (...args: unknown[]) => {
              scored.push(args);

              return score;
            },
          });
        },
      } as unknown as Tile;

    return { areas, hut: { tile: () => tile } as unknown as GoodyHut, scored };
  };

  it('offers an advance only while one that is not repeatable can be learned', (): void => {
    const player = new Player(new RuleRegistry()),
      unit = { player: () => player } as unknown as Unit;
    let available: { repeatable?: boolean }[] = [];

    const registry = {
        getByPlayer: (asked: Player) => {
          expect(asked).to.equal(player);

          return { available: () => available };
        },
      } as unknown as PlayerResearchRegistry,
      can = (): boolean =>
        advanceToLearn(registry)(hutOn(new Meadow()).hut, unit);

    expect(can()).false;

    available = [{ repeatable: true }];

    expect(can()).false;

    available = [{ repeatable: true }, {}];

    expect(can()).true;
  });

  it('checks the terrain, the score of the default area and the cities nearby', (): void => {
    const weights: [typeof Yield, number][] = [[Grain, 2]],
      good = hutOn(new Meadow(), 10, [{} as Tile]),
      cityRegistry = {
        getByTile: (tile: Tile) => (tile === near ? {} : null),
      } as unknown as CityRegistry,
      near = {} as Tile;

    expect(onTerrain([Marsh, Meadow])(good.hut)).true;
    expect(onTerrain([Marsh])(good.hut)).false;
    expect(scoresAtLeast(weights, 10)(good.hut, {} as Unit)).true;
    expect(scoresAtLeast(weights, 11)(good.hut, {} as Unit)).false;
    expect(good.scored).to.deep.equal([
      [null, weights],
      [null, weights],
    ]);
    expect(noCityWithin(3, cityRegistry)(good.hut)).true;
    expect(good.areas).to.deep.equal([undefined, undefined, 3]);
    expect(noCityWithin(3, cityRegistry)(hutOn(new Meadow(), 0, [near]).hut))
      .false;
  });

  it('is remote from cities once the player has one and no standing city is within the distance', (): void => {
    const hutTile = {} as Tile,
      hut = { tile: () => hutTile } as unknown as GoodyHut,
      player = new Player(new RuleRegistry()),
      unit = { player: () => player } as unknown as Unit,
      remote = (distances: number[], own: number): boolean =>
        remoteFromCities(hut, unit, 4, {
          entries: () =>
            distances.map((distance) => ({
              destroyed: () => distance < 0,
              tile: () => ({
                distanceFrom: (tile: Tile) => {
                  expect(tile).to.equal(hutTile);

                  return Math.abs(distance);
                },
              }),
            })),
          getByPlayer: () => new Array(own).fill({}),
        } as unknown as CityRegistry);

    expect(remote([4, 7], 1)).true;
    expect(remote([3, 7], 1)).false;
    expect(remote([-3, 7], 1)).true;
    expect(remote([7], 0)).false;
    expect(remote([], 2)).true;
  });

  it('gives one of the units at random, for the player, on the square, with no city', (): void => {
    const ruleRegistry = new RuleRegistry(),
      player = new Player(ruleRegistry),
      square = {} as Tile,
      explorer = {
        player: () => player,
        tile: () => square,
      } as unknown as Unit,
      { drawn, rng } = sequence(0.49, 0.5),
      give = randomUnit([Scout, Rider], rng, ruleRegistry),
      first = give({} as GoodyHut, explorer),
      second = give({} as GoodyHut, explorer);

    expect(first).to.be.instanceOf(Scout);
    expect(second).to.be.instanceOf(Rider);
    expect(first.player()).to.equal(player);
    expect(first.tile()).to.equal(square);
    expect(first.city()).to.equal(null);
    expect(drawn).to.deep.equal([0.49, 0.5]);
  });
});
