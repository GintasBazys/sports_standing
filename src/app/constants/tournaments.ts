import { Layout } from "@/app/enumerators/layout.ts"
import type { LayoutSettings, TournamentSettings } from "@/app/types/tournament.ts"

export const TOURNAMENTS: TournamentSettings[] = [
  { title: "Premier League", id: "premier-league", layout: Layout.CLEAN },
  { title: "EuroBasket", id: "eurobasket", layout: Layout.ENERGETIC },
  { title: "Wimbledon", id: "wimbledon", layout: Layout.TABLE }
]
export const LAYOUT_SETTINGS: LayoutSettings[] = [
  {
    name: Layout.CLEAN,
    showAddTeam: true,
    showAddPlayer: false,
    showStandings: true,
    showMatchResults: false,
    showButtons: false,
    showFlags: false,
    showIcons: false,
    showPlayed: true,
    showWins: true,
    showDraws: true,
    showLosses: true,
    showPoints: true
  },
  {
    name: Layout.ENERGETIC,
    showAddTeam: true,
    showAddPlayer: false,
    showStandings: true,
    showMatchResults: true,
    showButtons: true,
    showFlags: true,
    showIcons: false,
    showPlayed: true,
    showWins: true,
    showDraws: true,
    showLosses: true,
    showPoints: true
  },
  {
    name: Layout.TABLE,
    showAddTeam: false,
    showAddPlayer: true,
    showStandings: true,
    showMatchResults: false,
    showButtons: true,
    showFlags: false,
    showIcons: true,
    showPlayed: true,
    showWins: true,
    showDraws: false,
    showLosses: true,
    showPoints: true
  }
]

export const MAX_SCORE = 99
export const MIN_SCORE = 0
export const MAX_NAME_LENGTH = 250
