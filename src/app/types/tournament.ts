import type { Layout } from "@/app/enumerators/layout.ts"

export type LayoutSettings = {
  name: Layout
  showAddTeam: boolean
  showAddPlayer: boolean
  showStandings: boolean
  showMatchResults: boolean
  showButtons: boolean
  showFlags: boolean
  showIcons: boolean
  showPlayed: boolean
  showWins: boolean
  showDraws: boolean
  showLosses: boolean
  showPoints: boolean
}

export type TournamentSettings = {
  title: string
  tournament: string
  layout: Layout
}

export type TournamentProps = { tournament: string; settings: LayoutSettings | undefined }
