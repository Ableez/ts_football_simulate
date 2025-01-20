import type { PlayerStats } from "./types/types";

import { LeagueSimulator } from "./simulator";
import player from "./configs/players.json";

LeagueSimulator.run(player as PlayerStats[]);
