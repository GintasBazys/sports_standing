export type TeamId = string
export type PlayerId = string

export type Team = {
  id: TeamId
  name: string
  wins: number
  draws: number
  losses: number
}

export type Player = {
  id: PlayerId
  name: string
  teamId: TeamId | null
}

export type TeamPlayerState = {
  teams: Record<TeamId, Team>
  teamOrder: TeamId[]
  players: Record<PlayerId, Player>
  playerOrder: PlayerId[]
}
