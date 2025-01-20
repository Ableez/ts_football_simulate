import type { TeamStats } from "../types/types";
import type { Team } from "./team";

import { odds } from "../configs/odds.config";
import { Event } from "./event";

export class Match {
  static readonly reverse: { [key: string]: string } = {
    Home: "Away",
    Away: "Home",
  };
  static readonly eventKeys: string[] = Object.keys(odds[0].Home.Events);
  static readonly foulKeys: string[] = [
    "Free kick won",
    "Yellow card",
    "Second yellow card",
    "Red card",
  ];

  private odds: typeof odds;
  private homeStats: { [key: string]: number };
  private awayStats: { [key: string]: number };
  private homeSide: Team;
  private awaySide: Team;
  private sides: { [key: string]: string };
  private reverse: { [key: string]: Team };
  private matchEvents: Event[];
  private stats: TeamStats;

  constructor(homeSide: Team, awaySide: Team) {
    this.odds = JSON.parse(JSON.stringify(odds));
    this.homeSide = homeSide;
    this.awaySide = awaySide;

    const eventTypes = [
      ...Match.eventKeys,
      "On target",
      "Saved",
      "Off target",
      "Blocked",
      "Hit the bar",
      "Goal",
    ];
    this.homeStats = Object.fromEntries(eventTypes.map((type) => [type, 0]));
    this.awayStats = Object.fromEntries(eventTypes.map((type) => [type, 0]));

    this.sides = {
      [homeSide.name]: "Home",
      [awaySide.name]: "Away",
    };

    this.reverse = {
      [homeSide.name]: awaySide,
      [awaySide.name]: homeSide,
    };

    this.matchEvents = [];
    this.stats = {
      [homeSide.name]: { ...this.homeStats },
      [awaySide.name]: { ...this.awayStats },
    };

    this.setOdds();
    this.setEvents(homeSide, awaySide);
  }

  private setOdds(): void {
    const hdf =
      (Math.pow(this.homeSide.defence, 2) * this.homeSide.midfield) /
      (Math.pow(this.awaySide.attack, 2) * this.awaySide.midfield);

    const adf =
      (Math.pow(this.awaySide.defence, 2) * this.awaySide.midfield) /
      (Math.pow(this.homeSide.attack, 2) * this.homeSide.midfield);

    for (let minute = 0; minute < 100; minute++) {
      this.odds[minute].Home.Events.Attempt /= Math.pow(adf, 2.33);
      this.odds[minute].Away.Events.Attempt /= Math.pow(hdf, 2.33);
    }
  }

  private addEvent(event: Event): void {
    const evaluatedEvents = event.evaluateEvent();
    for (const e of evaluatedEvents) {
      if (e.event === "Substitution") {
        const side = e.side.name;
        if (this.stats[side]["Substitution"] < 3) {
          this.trackEvent(e);
        }
      } else {
        this.trackEvent(e);
      }
      e.showEvent();
      this.matchEvents.push(e);
    }
  }

  private setEvents(homeSide: Team, awaySide: Team): void {
    for (let minute = 0; minute < 100; minute++) {
      for (let i = 0; i < 135; i++) {
        if (Math.random() < this.odds[minute].Event) {
          const probabilities = [
            this.odds[minute].Home.Probability,
            this.odds[minute].Away.Probability,
          ];

          const side =
            Math.random() <
            probabilities[0] / (probabilities[0] + probabilities[1])
              ? this.homeSide
              : this.awaySide;

          const eventProbabilities: number[] = Object.values(
            this.odds[minute][this.sides[side.name]].Events
          );
          let random =
            Math.random() * eventProbabilities.reduce((a, b) => a + b);
          let eventIndex = 0;

          for (let j = 0; j < eventProbabilities.length; j++) {
            random -= eventProbabilities[j];
            if (random <= 0) {
              eventIndex = j;
              break;
            }
          }

          const event = Match.eventKeys[eventIndex];
          if (!Match.foulKeys.includes(event)) {
            const e = new Event(event, side, minute);
            e.setHomeAndAwaySides(homeSide, awaySide);
            this.addEvent(e);
          }
        }
      }
    }
  }

  private trackEvent(event: Event): void {
    const stats =
      event.side === this.homeSide ? this.homeStats : this.awayStats;
    stats[event.event]++;

    this.stats = {
      [this.homeSide.name as keyof TeamStats]: { ...this.homeStats },
      [this.awaySide.name as keyof TeamStats]: { ...this.awayStats },
    };
  }

  evaluateMatchResult(): [string, Team, Team] {
    const homeGoals = this.stats[this.homeSide.name].Goal;
    const awayGoals = this.stats[this.awaySide.name].Goal;

    if (homeGoals === awayGoals) {
      return ["Draw", this.homeSide, this.awaySide];
    }
    return homeGoals > awayGoals
      ? ["Win", this.homeSide, this.awaySide]
      : ["Win", this.awaySide, this.homeSide];
  }

  showMatchResult(): void {
    const homeGoals = this.stats[this.homeSide.name].Goal;
    const awayGoals = this.stats[this.awaySide.name].Goal;

    if (homeGoals > awayGoals) {
      console.log(`${this.homeSide.name} won the match`);
    } else if (awayGoals > homeGoals) {
      console.log(`${this.awaySide.name} won the match`);
    } else {
      console.log(
        `The match between ${this.homeSide.name} and ${this.awaySide.name} was a Draw`
      );
    }
    console.log(`Score ${homeGoals} - ${awayGoals}`);
  }
}
