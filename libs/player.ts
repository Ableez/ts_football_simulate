import type { PlayerStats } from "../types/types";

export class Player {
  static readonly ATTACKER = "attacker";
  static readonly MIDFIELDER = "midfielder";
  static readonly DEFENDER = "defender";
  static readonly GOALKEEPER = "goalkeeper";

  static readonly STARTER = "starter";
  static readonly SUBSTITUTE = "substitute";
  static readonly RESERVE = "reserve";

  static readonly GOALKEEPER_ATTRIBUTES = [
    "gkDiving",
    "gkHandling",
    "gkKicking",
    "gkReflexes",
    "gkSpeed",
    "gkPositioning",
  ];

  name: string;
  nationality: string;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
  keeping: number;
  teamStatus: string;
  position: string;

  constructor(playerStats: PlayerStats) {
    this.name = playerStats.short_name;
    this.nationality = playerStats.nationality;
    this.overall = playerStats.overall;
    this.pace = playerStats.pace;
    this.shooting = playerStats.shooting;
    this.passing = playerStats.passing;
    this.dribbling = playerStats.dribbling;
    this.defending = playerStats.defending;
    this.physic = playerStats.physic;
    this.keeping = 0;
    this.teamStatus = Player.RESERVE;
    this.position = playerStats.player_positions;
    this.setPlayerPosition(playerStats.player_positions);
    this.setGoalkeeperRating(playerStats);
  }

  setPlayerPosition(playerPositions: string): void {
    const mainPosition = playerPositions.split(",")[0];
    if (mainPosition.includes("B")) {
      this.position = Player.DEFENDER;
    } else if (mainPosition.includes("M")) {
      this.position = Player.MIDFIELDER;
    } else if (
      mainPosition.includes("S") ||
      mainPosition.includes("F") ||
      mainPosition.includes("W")
    ) {
      this.position = Player.ATTACKER;
    } else {
      this.position = Player.GOALKEEPER;
    }
  }

  setGoalkeeperRating(stats: PlayerStats): void {
    if (this.isGoalkeeper()) {
      let gkRating = 0;
      let validAttributes = 0;

      Player.GOALKEEPER_ATTRIBUTES.forEach((attr) => {
        const value = stats[attr as keyof PlayerStats];
        if (value !== undefined) {
          gkRating += value ? Number(value) : 0;
          validAttributes++;
        }
      });

      this.keeping =
        validAttributes > 0 ? Math.floor(gkRating / validAttributes) : 0;
    }
  }

  isAttacker(): boolean {
    return this.position === Player.ATTACKER;
  }

  isMidfielder(): boolean {
    return this.position === Player.MIDFIELDER;
  }

  isDefender(): boolean {
    return this.position === Player.DEFENDER;
  }

  isGoalkeeper(): boolean {
    return this.position === Player.GOALKEEPER;
  }

  setAsStarter(): void {
    this.teamStatus = Player.STARTER;
  }

  isStarter(): boolean {
    return this.teamStatus === Player.STARTER;
  }
}
