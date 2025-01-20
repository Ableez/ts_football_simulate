import { odds, shotOutcome } from "../configs/odds.config";
import type { Squad } from "../types/types";
import type { Player } from "./player";
import type { Team } from "./team";

export class Event {
  event: string;
  side: Team;
  private minute: number;
  private player?: Player;
  private sides?: { [key: string]: string };
  private reverse?: { [key: string]: Team };

  constructor(event: string, side: Team, minute: number, player?: Player) {
    this.event = event;
    this.side = side;
    this.minute = minute;
    this.player = player;
  }

  setHomeAndAwaySides(homeSide: Team, awaySide: Team): void {
    this.sides = { [homeSide.name]: "Home", [awaySide.name]: "Away" };
    this.reverse = { [homeSide.name]: awaySide, [awaySide.name]: homeSide };
  }

  setPlayerForEvents(eventsList: Event[]): Event[] {
    const positions: (keyof Squad)[] = [
      "goalkeeper",
      "defenders",
      "midfielders",
      "attackers",
    ];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const players = eventsList[0].side.squad[position];
    const player = players[Math.floor(Math.random() * players.length)];

    eventsList.forEach((e) => {
      e.player = player;
      if (e.event === "Saved") {
        e.player = e.side.squad.goalkeeper[0];
      }
    });

    return eventsList;
  }

  evaluateEvent(): Event[] {
    if (this.event === "Attempt") {
      const events: Event[] = [];
      events.push(new Event(this.event, this.side, this.minute));

      const outcomes = Object.keys(shotOutcome);
      const probabilities = outcomes.map(
        (outcome) =>
          shotOutcome[outcome as keyof typeof shotOutcome].Probability
      );
      const result = this.weightedRandomChoice(outcomes, probabilities);

      this.event = result;
      events.push(new Event(this.event, this.side, this.minute));

      if (this.event === "On target") {
        const goalProb = shotOutcome["On target"].is_goal;
        const goal = this.weightedRandomChoice(
          ["Saved", "Goal"],
          // #todo:   check this later
          //   saved, goal
          [goalProb[0], goalProb[1]]
        );

        if (goal === "Saved" && this.reverse) {
          this.side = this.reverse[this.side.name];
        }
        this.event = goal;
        events.push(new Event(this.event, this.side, this.minute));
      }

      return this.setPlayerForEvents(events);
    } else if (this.event === "Foul" && this.reverse && this.sides) {
      const events: Event[] = [];
      events.push(new Event("Foul", this.side, this.minute));
      events.push(
        new Event("Free kick won", this.reverse[this.side.name], this.minute)
      );

      const sideStr = this.sides[this.side.name];
      const foulOdds = odds[this.minute][sideStr].Events;

      const yellowProb = foulOdds["Yellow card"] / foulOdds["Foul"];
      const redProb = foulOdds["Red card"] / foulOdds["Foul"];
      const noCardProb = 1 - yellowProb - redProb;

      const card = this.weightedRandomChoice(
        ["Yellow card", "Red card", "No card"],
        [yellowProb, redProb, noCardProb]
      );

      if (card !== "No card") {
        events.push(new Event(card, this.side, this.minute));
      }

      return this.setPlayerForEvents(events);
    } else {
      return this.setPlayerForEvents([
        new Event(this.event, this.side, this.minute),
      ]);
    }
  }

  private weightedRandomChoice(choices: string[], weights: number[]): string {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * total;

    for (let i = 0; i < choices.length; i++) {
      if (random < weights[i]) {
        return choices[i];
      }
      random -= weights[i];
    }

    return choices[choices.length - 1];
  }

  showEvent(): void {
    console.log(
      `${this.minute}'`,
      this.side.name,
      this.event,
      this.player?.name
    );
  }
}
