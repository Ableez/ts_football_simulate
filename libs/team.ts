import type { PlayerStats, Squad } from "../types/types";
import { Manager } from "./manager";
import { Player } from "./player";

export class Team {
  name: string;
  manager: Manager;
  players: { [key: string]: Player };
  squad: Squad;
  attack: number;
  midfield: number;
  defence: number;
  attackers: Player[];
  defenders: Player[];
  midfielders: Player[];
  goalkeepers: Player[];
  goals: number;

  constructor(teamName: string, playersData: PlayerStats[]) {
    this.name = teamName;
    this.manager = new Manager();
    this.players = {};
    this.squad = {
      attackers: [],
      midfielders: [],
      defenders: [],
      goalkeeper: [],
    };
    this.attack = 0;
    this.midfield = 0;
    this.defence = 0;
    this.attackers = [];
    this.defenders = [];
    this.midfielders = [];
    this.goalkeepers = [];

    this.setPlayers(playersData);
    this.setStats();
    this.setSquad();
    this.goals = 0;
  }

  setPlayers(playersData: PlayerStats[]): void {
    const teamPlayersData = playersData.filter(
      (player) => player.club === this.name
    );
    teamPlayersData.forEach((playerData) => {
      this.players[playerData.long_name] = new Player(playerData);
    });
  }

  setStats(): void {
    this.attackers = Object.values(this.players).filter((player) =>
      player.isAttacker()
    );
    this.defenders = Object.values(this.players).filter((player) =>
      player.isDefender()
    );
    this.midfielders = Object.values(this.players).filter((player) =>
      player.isMidfielder()
    );
    this.goalkeepers = Object.values(this.players).filter((player) =>
      player.isGoalkeeper()
    );

    this.attack = Math.floor(
      this.attackers.reduce((sum, player) => sum + player.overall, 0) /
        this.attackers.length
    );

    this.defence = Math.floor(
      (this.defenders.reduce((sum, player) => sum + player.overall, 0) +
        this.goalkeepers.reduce((sum, player) => sum + player.overall, 0)) /
        (this.defenders.length + this.goalkeepers.length)
    );

    this.midfield = Math.floor(
      this.midfielders.reduce((sum, player) => sum + player.overall, 0) /
        this.midfielders.length
    );
  }

  setSquad(): void {
    const { numAttackers, numMidfielders, numDefenders } =
      this.manager.formation;

    this.attackers.sort((a, b) => b.overall - a.overall);
    this.squad.attackers = this.attackers.slice(0, numAttackers);
    this.squad.attackers.forEach((player) => player.setAsStarter());

    this.midfielders.sort((a, b) => b.overall - a.overall);
    this.squad.midfielders = this.midfielders.slice(0, numMidfielders);
    this.squad.midfielders.forEach((player) => player.setAsStarter());

    this.defenders.sort((a, b) => b.overall - a.overall);
    this.squad.defenders = this.defenders.slice(0, numDefenders);
    this.squad.defenders.forEach((player) => player.setAsStarter());

    this.goalkeepers.sort((a, b) => b.overall - a.overall);
    this.squad.goalkeeper = [this.goalkeepers[0]];
    this.squad.goalkeeper[0].setAsStarter();
  }
}
