export type MatchEntry = {
  id: string
  tournamentId: string
  homeId: string
  awayId: string
  homeScore?: number
  awayScore?: number
}

export type MatchData = {
  matches: Record<string, MatchEntry | null>
  matchOrder: string[]
}

export type ScoresState = {
  byTournament: Record<string, MatchData>
}

export type MatchAddPayload = {
  id: string
  tournamentId: string
  homeId: string
  awayId: string
}

export type MatchScorePayload = {
  tournamentId: string
  matchId: string
  homeScore: number
  awayScore: number
}
