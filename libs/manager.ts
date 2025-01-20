import { formations, names } from "../configs/manager.config";
import type { Formation } from "../types/types";

export class Manager {
  name: string;
  formation: Formation;

  constructor() {
    this.name = names[Math.floor(Math.random() * names.length)];
    this.formation = {
      numAttackers:
        formations[Math.floor(Math.random() * formations.length)][2],
      numMidfielders:
        formations[Math.floor(Math.random() * formations.length)][1],
      numDefenders:
        formations[Math.floor(Math.random() * formations.length)][0],
    };
  }
}
