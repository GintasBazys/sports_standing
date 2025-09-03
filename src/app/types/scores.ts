export type MatchEntry = {
  id: string
  tournamentId: string
  homeId: string
  awayId: string
  homeScore: number | null
  awayScore: number | null
}

export type MatchData = {
  matches: Record<string, MatchEntry | undefined>
  matchOrder: string[]
}

export type ScoresState = {
  byTournament: Partial<Record<string, MatchData>>
}
