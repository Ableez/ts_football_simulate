import { times } from "./configs/fixtures.config";
import { leagues } from "./configs/league.configs";
import { flattenArray, unflattenArray } from "./utils/array-manim";

export class LeagueSimulator {
  private schedule: {
    league: string;
    schedule: [number, [string, string]][][];
  }[];

  constructor() {
    this.schedule = this.createBalancedRoundRobin();
  }

  private shuffle = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  sortByTime(
    scheduleParam?: {
      league: string;
      schedule: [number, [string, string]][][];
    }[],
    order?: "desc" | "asc"
  ): {
    league: string;
    schedule: [number, [string, string]][][];
  }[] {
    const arr = [];
    const activeArr = scheduleParam ?? this.schedule;

    for (const league of activeArr) {
      const flat = flattenArray(league.schedule);
      const sorted = unflattenArray(
        flat.toSorted((a, b) => (order === "desc" ? b[0] - a[0] : a[0] - b[0])),
        league.schedule.length
      );

      arr.push({ league: league.league, schedule: sorted });
    }

    return arr;
  }

  private createBalancedRoundRobin(): {
    league: string;
    schedule: [number, [string, string]][][];
  }[] {
    let arr = [];
    for (const lg of Object.keys(leagues)) {
      arr.push(leagues[lg as keyof typeof leagues]);
    }

    const globalSchedule = [];

    for (const league of arr) {
      const schedule: [number, [string, string]][][] = [];

      let teamsList = this.shuffle(league.teams);
      if (teamsList.length % 2 === 1) {
        teamsList.push("BYE");
      }

      const teamCount = teamsList.length;
      const mid = teamCount / 2;

      for (let i = 0; i < teamCount - 1; i++) {
        const round: [number, [string, string]][] = [];
        const firstHalf = teamsList.slice(0, mid);
        const secondHalf = teamsList.slice(mid).reverse();

        for (let j = 0; j < mid; j++) {
          if (firstHalf[j] !== "BYE" && secondHalf[j] !== "BYE") {
            const firstHalfTime =
              times[Math.floor(Math.random() * times.length)];

            const secondHalfTime = times.filter((t) => t !== firstHalfTime)[
              Math.floor(Math.random() * (times.length - 1))
            ];

            round.push([firstHalfTime, [firstHalf[j], secondHalf[j]]]);
            if (
              `${secondHalfTime}_${secondHalf[j]}` !==
              `${firstHalfTime}_${firstHalf[j]}`
            ) {
              round.push([secondHalfTime, [secondHalf[j], firstHalf[j]]]);
            } else {
              console.log("--------------------------------");
              console.log("--------------------------------");
              console.log(
                "CAUGHT A COPYCAT!!!",
                `${secondHalfTime}_${secondHalf[j]}`,
                `${firstHalfTime}_${firstHalf[j]}`
              );
              console.log("--------------------------------");
              console.log("--------------------------------");

              const lastChanceTime = times.filter(
                (t) => t !== firstHalfTime && secondHalfTime
              )[Math.floor(Math.random() * (times.length - 2))];

              round.push([lastChanceTime, [secondHalf[j], firstHalf[j]]]);
            }
          }
        }

        schedule.push(this.shuffle(round).toSorted((a, b) => b[0] - a[0]));
        teamsList.splice(1, 0, teamsList.pop()!);
      }

      const flatten = this.shuffle(flattenArray(schedule));
      let unflatten = unflattenArray(flatten, schedule[0].length);

      const sorted = unflatten.map((__schedule) => {
        return __schedule.toSorted((a, b) => a[0] - b[0]);
      });

      globalSchedule.push({ league: league.name, schedule: sorted });
    }

    return globalSchedule;
  }

  run() {
    // console.log("GLOBAL SCHEDULE: ", this.createBalancedRoundRobin());
    Bun.write("./schedule.json", `\n${JSON.stringify(this.schedule)}`);
  }
}

// TODO: implement a global season simulator

// has: leagues, schedule
// schedule array of matches from all leagues combined, but mathes will still be gotten from isolated leagues
// then joined together in global schedule keeper which will be shuffled

// import { leagues } from "./configs/league.configs";

// export class FootballSeasonSimulator {
//   private leagues: typeof leagues;
//   private schedule: string[][];

//   constructor() {
//     this.schedule = [];
//     this.leagues = leagues;
//   }
// } }
// }
