export type Entry = {
  id: string
  name: string
  wins: number
  draws: number
  losses: number
  iso_code?: string
}

export type tournamentData = {
  teams: Record<string, Entry>
  teamOrder: string[]
}

export type ParticipantState = {
  byTournament: Record<string, tournamentData>
}

export type ParticipantAddPayload = {
  id: string
  name: string
  tournamentId: string
  iso_code?: string
}

export type ParticipantRecordPayload = {
  tournamentId: string
  homeId: string
  awayId: string
  homeScore: number
  awayScore: number
}
