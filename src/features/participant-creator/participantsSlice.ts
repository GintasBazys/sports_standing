import { createSelector, createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit"
import type {
  ParticipantAddPayload,
  ParticipantRecordPayload,
  ParticipantState,
  tournamentData
} from "@/app/types/participant.ts"
import type { RootState } from "@/app/store.ts"

const initialState: ParticipantState = {
  byTournament: {}
}

export const participantsSlice = createSlice({
  name: "participant",
  initialState,
  reducers: create => ({
    addParticipant: create.preparedReducer(
      (name: string, tournamentId: string, iso_code?: string) => {
        return { payload: { id: nanoid(), name, tournamentId, iso_code } }
      },
      (state, action: PayloadAction<ParticipantAddPayload>) => {
        const { id, name, tournamentId, iso_code } = action.payload
        const tournamentData =
          state.byTournament[tournamentId] ?? (state.byTournament[tournamentId] = { teams: {}, teamOrder: [] })

        const exists = tournamentData.teamOrder.some(tid => {
          const entry = tournamentData.teams[tid]

          return entry?.name === name
        })

        if (exists) {
          return
        }

        tournamentData.teams[id] = { id, name, wins: 0, draws: 0, losses: 0, iso_code }
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
      (state, action: PayloadAction<ParticipantRecordPayload>) => {
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

export const { addParticipant, recordResult } = participantsSlice.actions
export default participantsSlice.reducer
