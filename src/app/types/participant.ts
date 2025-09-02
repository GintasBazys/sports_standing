export type Entry = {
  id: string
  name: string
  wins: number
  draws: number
  losses: number
}

export type tournamentData = {
  teams: Record<string, Entry>
  teamOrder: string[]
}

export type ParticipantState = {
  byTournament: Partial<Record<string, tournamentData>>
}
