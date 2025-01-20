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
    const TIME_BUFFER = 5; // Minimum time difference between matches for same team

    for (const league of arr) {
      const schedule: [number, [string, string]][][] = [];

      let teamsList = this.shuffle(league.teams);
      if (teamsList.length % 2 === 1) {
        teamsList.push("BYE");
      }

      const teamCount = teamsList.length;
      const mid = teamCount / 2;

      // Keep track of all scheduled matches for each team
      const teamSchedules: { [team: string]: number[] } = {};
      teamsList.forEach((team) => {
        if (team !== "BYE") {
          teamSchedules[team] = [];
        }
      });

      // Helper function to get all valid times for a pair of teams
      const getValidTimes = (
        team1: string,
        team2: string,
        excludeTime?: number,
        strictMode: boolean = true
      ): number[] => {
        return times.filter((time) => {
          if (excludeTime !== undefined && time === excludeTime) return false;

          const team1Times = teamSchedules[team1] || [];
          const team2Times = teamSchedules[team2] || [];

          if (strictMode) {
            // Strict mode: Check buffer
            return ![...team1Times, ...team2Times].some(
              (scheduledTime) => Math.abs(scheduledTime - time) < TIME_BUFFER
            );
          } else {
            // Relaxed mode: Just ensure no direct conflicts
            return ![...team1Times, ...team2Times].includes(time);
          }
        });
      };

      // Helper function to get least conflicting time
      const getLeastConflictingTime = (
        team1: string,
        team2: string,
        excludeTime?: number
      ): number => {
        const timeScores = times
          .filter((t) => t !== excludeTime)
          .map((time) => {
            const team1Times = teamSchedules[team1] || [];
            const team2Times = teamSchedules[team2] || [];
            const conflicts = [...team1Times, ...team2Times].filter(
              (scheduledTime) => Math.abs(scheduledTime - time) < TIME_BUFFER
            ).length;
            return { time, conflicts };
          });

        timeScores.sort((a, b) => a.conflicts - b.conflicts);
        return timeScores[0].time;
      };

      for (let i = 0; i < teamCount - 1; i++) {
        const round: [number, [string, string]][] = [];
        const firstHalf = teamsList.slice(0, mid);
        const secondHalf = teamsList.slice(mid).reverse();

        for (let j = 0; j < mid; j++) {
          if (firstHalf[j] !== "BYE" && secondHalf[j] !== "BYE") {
            // Try to find times with increasingly relaxed constraints
            let validTimesForFirst = getValidTimes(firstHalf[j], secondHalf[j]);

            if (validTimesForFirst.length === 0) {
              validTimesForFirst = getValidTimes(
                firstHalf[j],
                secondHalf[j],
                undefined,
                false
              );
            }

            // If still no valid times, get least conflicting time
            const firstHalfTime =
              validTimesForFirst.length > 0
                ? validTimesForFirst[
                    Math.floor(Math.random() * validTimesForFirst.length)
                  ]
                : getLeastConflictingTime(firstHalf[j], secondHalf[j]);

            // Similar process for second match
            let validTimesForSecond = getValidTimes(
              firstHalf[j],
              secondHalf[j],
              firstHalfTime
            ).filter((time) => Math.abs(time - firstHalfTime) >= TIME_BUFFER);

            if (validTimesForSecond.length === 0) {
              validTimesForSecond = getValidTimes(
                firstHalf[j],
                secondHalf[j],
                firstHalfTime,
                false
              );
            }

            const secondHalfTime =
              validTimesForSecond.length > 0
                ? validTimesForSecond[
                    Math.floor(Math.random() * validTimesForSecond.length)
                  ]
                : getLeastConflictingTime(
                    firstHalf[j],
                    secondHalf[j],
                    firstHalfTime
                  );

            // Add matches to round
            round.push([firstHalfTime, [firstHalf[j], secondHalf[j]]]);
            round.push([secondHalfTime, [secondHalf[j], firstHalf[j]]]);

            // Update team schedules
            teamSchedules[firstHalf[j]].push(firstHalfTime, secondHalfTime);
            teamSchedules[secondHalf[j]].push(firstHalfTime, secondHalfTime);
          }
        }

        // Sort matches within round by time
        schedule.push(round.sort((a, b) => a[0] - b[0]));
        teamsList.splice(1, 0, teamsList.pop()!);
      }

      globalSchedule.push({
        league: league.name,
        schedule: schedule.map((round) => round.sort((a, b) => a[0] - b[0])),
      });
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
