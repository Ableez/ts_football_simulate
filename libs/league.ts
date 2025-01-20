import type { LeagueTableRow, PlayerStats } from "../types/types";
import type { Player } from "./player";

import { leagues } from "../configs/league.configs";
import { countries } from "../configs/league.configs";
import { Match } from "./match";
import { Team } from "./team";
import { flattenArray, unflattenArray } from "../utils/array-manim";

export class League {
  static readonly LEAGUE_TABLE_ATTRIBUTES: string[] = [
    "Club",
    "Matches Played",
    "Wins",
    "Draws",
    "Losses",
    "Points",
    "GF",
    "GA",
    "GD",
  ];

  private week: number;
  private name: string;
  private players: { [key: string]: Player };
  private teams: { [key: string]: Team };
  private teamNames: string[];
  private schedule: [string, string][][];
  private standings: LeagueTableRow[];
  private playersData: PlayerStats[];

  constructor(option: number, playersData: PlayerStats[]) {
    this.week = 0;
    this.name = leagues[countries[option]].name;
    this.players = {};
    this.teams = {};
    this.teamNames = leagues[countries[option]].teams;
    this.playersData = playersData;

    this.setTeams();
    this.setPlayers();
    this.schedule = this.createBalancedRoundRobin(this.teamNames);
    this.standings = this.initLeagueTable();
  }

  private setTeams(): void {
    this.teamNames.forEach((name) => {
      this.teams[name] = new Team(name, this.playersData);
    });
  }

  private setPlayers(): void {
    Object.values(this.teams).forEach((team) => {
      this.players = { ...this.players, ...team.players };
    });
  }

  private shuffle = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  private createBalancedRoundRobin(teams: string[]): [string, string][][] {
    const schedule: [string, string][][] = [];
    let teamsList = this.shuffle(teams);

    if (teamsList.length % 2 === 1) {
      teamsList.push("BYE");
    }

    const teamCount = teamsList.length;
    const mid = teamCount / 2;

    for (let i = 0; i < teamCount - 1; i++) {
      const round: [string, string][] = [];
      const firstHalf = teamsList.slice(0, mid);
      const secondHalf = teamsList.slice(mid).reverse();

      for (let j = 0; j < mid; j++) {
        if (firstHalf[j] !== "BYE" && secondHalf[j] !== "BYE") {
          round.push([firstHalf[j], secondHalf[j]]);
          round.push([secondHalf[j], firstHalf[j]]);
        }
      }

      schedule.push(this.shuffle(round));
      teamsList.splice(1, 0, teamsList.pop()!);
    }

    const flatten = this.shuffle(flattenArray(schedule));
    const unflatten = unflattenArray(flatten, schedule[0].length);

    return unflatten;
  }

  private initLeagueTable(): LeagueTableRow[] {
    return this.teamNames.map((team) => ({
      Club: team,
      "Matches Played": 0,
      Wins: 0,
      Draws: 0,
      Losses: 0,
      Points: 0,
      GF: 0,
      GA: 0,
      GD: 0,
    }));
  }

  showLeagueTable(): void {
    console.table(this.standings);
  }

  private updateLeagueTable(match: Match): void {
    const [result, winner, loser] = match.evaluateMatchResult();
    const winnerGoals = this.teams[winner.name].goals;
    const loserGoals = this.teams[loser.name].goals;
    const goalDifference = winnerGoals - loserGoals;

    if (result === "Draw") {
      [winner, loser].forEach((team) => {
        const row = this.standings.find((r) => r.Club === team.name)!;
        row["Matches Played"]++;
        row.Draws++;
        row.Points++;
        row.GF += winnerGoals;
        row.GA += loserGoals;
      });
    } else {
      const winnerRow = this.standings.find((r) => r.Club === winner.name)!;
      winnerRow["Matches Played"]++;
      winnerRow.Wins++;
      winnerRow.Points += 3;
      winnerRow.GF += winnerGoals;
      winnerRow.GA += loserGoals;
      winnerRow.GD += goalDifference;

      const loserRow = this.standings.find((r) => r.Club === loser.name)!;
      loserRow["Matches Played"]++;
      loserRow.Losses++;
      loserRow.GF += loserGoals;
      loserRow.GA += winnerGoals;
      loserRow.GD -= goalDifference;
    }

    this.standings.sort((a, b) => {
      if (a.Points !== b.Points) return b.Points - a.Points;
      if (b.GD !== a.GD) return b.GD - a.GD;
      return b.GF - a.GF;
    });
  }

  private simulateMatch(homeTeamName: string, awayTeamName: string): void {
    const homeTeam = this.teams[homeTeamName];
    const awayTeam = this.teams[awayTeamName];
    const match = new Match(homeTeam, awayTeam);
    match.showMatchResult();
    this.updateLeagueTable(match);
  }

  simulateWeek(): void {
    this.schedule[this.week].forEach(([home, away]) => {
      this.simulateMatch(home, away);
    });

    this.week++;
  }

  simulateLeague(): void {
    // while (this.week < this.schedule.length) {

    console.log("WEEK'S SCHEDULE: ", this.schedule);
    // this.simulateWeek();
    // this.showLeagueTable();
    // }
  }
}
