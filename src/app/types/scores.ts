export type MatchEntry = {
  id: string
  tournamentId: string
  homeId: string
  awayId: string
  homeScore?: number
  awayScore?: number
}

export type MatchData = {
  matches: Record<string, MatchEntry | undefined>
  matchOrder: string[]
}

export type ScoresState = {
  byTournament: Record<string, MatchData>
}
