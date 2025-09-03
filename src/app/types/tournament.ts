import type { Layout } from "@/app/enumerators/layout.ts"
import type { ComponentProps } from "react"

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
  id: string
  layout: Layout
}

export type TournamentProps = {
  tournamentId: string
  settings: LayoutSettings | undefined
}

export type ButtonProps = ComponentProps<"button">

export type TournamentItem = {
  title: string
  layout: Layout
  tournamentId: string
}
