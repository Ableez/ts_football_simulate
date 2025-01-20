import type { PlayerStats } from "./types/types";

import { LeagueSimulator } from "./simulator";
import player from "./configs/players.json";

const lg = new LeagueSimulator();

lg.run();
