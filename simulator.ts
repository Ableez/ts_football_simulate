import { League } from "./libs/league";
import type { PlayerStats } from "./types/types";

export class LeagueSimulator {
  static readonly WELCOME_MESSAGE = `
    Please enter the league you would like to simulate:
    `;

  static readonly LEAGUES_MESSAGE = `
        1 - La Liga Santander
        2 - Premier League
        3 - Bundesliga
        4 - Seria A
        5 - Ligue 1
    `;

  static getLeagueInput(): Promise<number> {
    return new Promise((resolve, reject) => {
      const input = prompt(LeagueSimulator.LEAGUES_MESSAGE);
      const num = parseInt(input || "");

      if (num && [1, 2, 3, 4, 5].includes(num)) {
        resolve(num);
      } else {
        console.log("Please enter a valid input!");
        LeagueSimulator.getLeagueInput().then(resolve).catch(reject);
      }
    });
  }

  static async run(playersData: PlayerStats[]): Promise<void> {
    console.log(LeagueSimulator.WELCOME_MESSAGE);
    // const leagueNo = await LeagueSimulator.getLeagueInput();
    const league = new League(2, playersData);
    league.simulateLeague();
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
// }
