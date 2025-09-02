import { createSlice, nanoid, type PayloadAction, createSelector } from "@reduxjs/toolkit"
import type { ParticipantState, Entry } from "@/app/types/participant.ts"
import type { RootState } from "@/app/store"

const initialState: ParticipantState = {
  byTournament: {}
}

export const participantsSlice = createSlice({
  name: "participant",
  initialState,
  reducers: create => ({
    addTeamOrPlayer: create.preparedReducer(
      (name: string, tournamentId: string) => {
        const trimmed = name.trim()

        return { payload: { id: nanoid(), name: trimmed, tournamentId } }
      },
      (state, action: PayloadAction<{ id: string; name: string; tournamentId: string }>) => {
        const { id, name, tournamentId } = action.payload
        const tournamentData =
          state.byTournament[tournamentId] ?? (state.byTournament[tournamentId] = { teams: {}, teamOrder: [] })

        const exists = tournamentData.teamOrder.some(tid => {
          const entry = tournamentData.teams[tid]

          return entry?.name.toLowerCase() === name.toLowerCase()
        })

        if (exists) {
          return
        }

        tournamentData.teams[id] = { id, name, wins: 0, draws: 0, losses: 0 }
        tournamentData.teamOrder.push(id)
      }
    ),
    recordResult: create.preparedReducer(
      (tournamentId: string, homeId: string, awayId: string, homeScore: number, awayScore: number) => ({
        payload: {
          tournamentId,
          homeId,
          awayId,
          homeScore: Math.max(0, Math.trunc(homeScore)),
          awayScore: Math.max(0, Math.trunc(awayScore))
        }
      }),
      (
        state,
        action: PayloadAction<{
          tournamentId: string
          homeId: string
          awayId: string
          homeScore: number
          awayScore: number
        }>
      ) => {
        const { tournamentId, homeId, awayId, homeScore, awayScore } = action.payload

        const tournamentData = state.byTournament[tournamentId]

        if (!tournamentData) {
          return
        }

        const home = tournamentData.teams[homeId]
        const away = tournamentData.teams[awayId]

        if (homeId === awayId || !home || !away) {
          return
        }

        if (homeScore > awayScore) {
          home.wins += 1
          away.losses += 1
        } else if (homeScore < awayScore) {
          away.wins += 1
          home.losses += 1
        } else {
          home.draws += 1
          away.draws += 1
        }
      }
    )
  })
})

const selectSelf = (state: RootState) => state.participant
const selectByTournament = createSelector(selectSelf, s => s.byTournament)
const selectTournamentArg = (_: RootState, tournamentId?: string) => tournamentId

type tournamentData = { teams: Record<string, Entry>; teamOrder: string[] }

const computeStandings = (data: tournamentData) => {
  const rows = data.teamOrder
    .map(id => data.teams[id])
    .filter(e => e != undefined)
    .map(entry => {
      const wins = entry.wins
      const draws = entry.draws
      const losses = entry.losses
      const name = entry.name

      const played = wins + draws + losses
      const points = wins * 3 + draws

      return { ...entry, wins, draws, losses, name, played, points }
    })

  rows.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points
    }

    if (b.wins !== a.wins) {
      return b.wins - a.wins
    }

    return a.name.localeCompare(b.name)
  })

  return rows
}

export const selectStandings = createSelector(
  [selectByTournament, selectTournamentArg],
  (byTournament, tournamentId) => {
    if (!tournamentId) {
      return []
    }

    const data = byTournament[tournamentId]

    if (!data) {
      return []
    }

    return computeStandings(data)
  }
)

export const { addTeamOrPlayer, recordResult } = participantsSlice.actions
export default participantsSlice.reducer
