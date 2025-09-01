import { createSlice, nanoid } from "@reduxjs/toolkit"
import type { TeamPlayerState } from "@/app/types/team.ts"

const initialState: TeamPlayerState = {
  teams: {},
  teamOrder: [],
  players: {},
  playerOrder: []
}

export const teamPlayerSlice = createSlice({
  name: "teamPlayer",
  initialState,
  reducers: create => ({
    addTeamOrPlayer: create.preparedReducer(
      (name: string) => {
        const trimmed = name.trim()
        return {
          payload: { id: nanoid(), name: trimmed }
        }
      },
      (state, action) => {
        const { id, name } = action.payload
        const exists = state.teamOrder.some(tid => state.teams[tid].name.toLowerCase() === name.toLowerCase())
        if (exists) {
          return
        }
        state.teams[id] = { id, name, wins: 0, draws: 0, losses: 0 }
        state.teamOrder.push(id)
      }
    )
  }),
  selectors: {
    selectStandings: stata =>
      stata.teamOrder
        .map(id => {
          const team = stata.teams[id]
          const played = team.wins + team.draws + team.losses
          const points = team.wins * 3 + team.draws
          return { ...team, played, points }
        })
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          if (b.wins !== a.wins) return b.wins - a.wins
          return a.name.localeCompare(b.name)
        })
  }
})

export const { addTeamOrPlayer } = teamPlayerSlice.actions

export const { selectStandings } = teamPlayerSlice.selectors
