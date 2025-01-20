// types.ts
export interface PlayerStats {
  //   shortName: string;
  //   nationality: string;
  //   overall: number;
  //   pace: number;
  //   shooting: number;
  //   passing: number;
  //   dribbling: number;
  //   defending: number;
  //   physic: number;
  //   playerPositions: string;
  //   gkDiving?: number;
  //   gkHandling?: number;
  //   gkKicking?: number;
  //   gkReflexes?: number;
  //   gkSpeed?: number;
  //   gkPositioning?: number;
  //   club: string;
  //   longName: string;

  short_name: string;
  long_name: string;
  age: number;
  dob: string;
  height_cm: number;
  weight_kg: number;
  nationality: string;
  club: string;
  overall: number;
  value_eur: number;
  player_positions: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
  gk_diving: null | number;
  gk_handling: null | number;
  gk_kicking: null | number;
  gk_reflexes: null | number;
  gk_speed: null | number;
  gk_positioning: null | number;
}

export interface TeamStats {
  [key: string]: {
    Goal: number;
    Attempt: number;
    [key: string]: number;
  };
}

export interface LeagueTableRow {
  Club: string;
  "Matches Played": number;
  Wins: number;
  Draws: number;
  Losses: number;
  Points: number;
  GF: number;
  GA: number;
  GD: number;
}

export interface Formation {
  numAttackers: number;
  numMidfielders: number;
  numDefenders: number;
}

export interface Squad {
  attackers: Player[];
  midfielders: Player[];
  defenders: Player[];
  goalkeeper: Player[];
}
