import { createSlice, createSelector, nanoid, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/app/store.ts"
import type { MatchData, ScoresState } from "@/app/types/matches.ts"

const initialState: ScoresState = { byTournament: {} }

const makePairKey = (teamAId: string, teamBId: string) => [teamAId, teamBId].sort().join("::")

const getOrCreateTournamentData = (state: ScoresState, tournamentId: string): MatchData => {
  return state.byTournament[tournamentId] ?? (state.byTournament[tournamentId] = { matches: {}, matchOrder: [] })
}

export const scoresSlice = createSlice({
  name: "scores",
  initialState,
  reducers: create => ({
    createMatch: create.preparedReducer(
      (tournamentId: string, homeId: string, awayId: string) => ({
        payload: { id: nanoid(), tournamentId, homeId, awayId }
      }),
      (state, action: PayloadAction<{ id: string; tournamentId: string; homeId: string; awayId: string }>) => {
        const { id: matchId, tournamentId, homeId, awayId } = action.payload

        if (homeId === awayId) {
          return
        }

        const tournamentData = getOrCreateTournamentData(state, tournamentId)
        const pairKey = makePairKey(homeId, awayId)

        const alreadyExists = tournamentData.matchOrder.some(existingMatchId => {
          const existingMatch = tournamentData.matches[existingMatchId]

          if (!existingMatch) {
            return
          }

          return makePairKey(existingMatch.homeId, existingMatch.awayId) === pairKey
        })

        if (alreadyExists) {
          return
        }

        tournamentData.matches[matchId] = {
          id: matchId,
          tournamentId,
          homeId,
          awayId
        }
        tournamentData.matchOrder.push(matchId)
      }
    ),

    setMatchScores: create.preparedReducer(
      (tournamentId: string, matchId: string, homeScore: number, awayScore: number) => ({
        payload: { tournamentId, matchId, homeScore, awayScore }
      }),
      (
        state,
        action: PayloadAction<{ tournamentId: string; matchId: string; homeScore: number; awayScore: number }>
      ) => {
        const { tournamentId, matchId, homeScore, awayScore } = action.payload
        const matchEntry = state.byTournament[tournamentId]?.matches[matchId]

        if (!matchEntry) {
          return
        }

        matchEntry.homeScore = Math.max(0, Math.trunc(homeScore))
        matchEntry.awayScore = Math.max(0, Math.trunc(awayScore))
      }
    )
  })
})

export const { createMatch, setMatchScores } = scoresSlice.actions
export default scoresSlice.reducer

const selectScoresState = (state: RootState) => state.scores
const selectByTournament = createSelector(selectScoresState, scoresState => scoresState.byTournament)

const selectTournamentId = (_: RootState, tournamentId?: string) => tournamentId
const selectTeamId = (_: RootState, __?: string, teamId?: string) => teamId

export const selectMatches = createSelector([selectByTournament, selectTournamentId], (byTournament, tournamentId) => {
  if (!tournamentId) {
    return []
  }

  const tournamentData = byTournament[tournamentId]

  if (!tournamentData) {
    return []
  }

  return tournamentData.matchOrder.map(matchId => tournamentData.matches[matchId])
})

export const selectOpponentsPlayed = createSelector(
  [selectByTournament, selectTournamentId, selectTeamId],
  (byTournament, tournamentId, teamId) => {
    const opponents = new Set<string>()

    if (!tournamentId || !teamId) {
      return opponents
    }

    const tournamentData = byTournament[tournamentId]

    if (!tournamentData) {
      return opponents
    }

    tournamentData.matchOrder.forEach(matchId => {
      const matchEntry = tournamentData.matches[matchId]

      if (!matchEntry) {
        return
      }

      if (matchEntry.homeId === teamId) {
        opponents.add(matchEntry.awayId)
      } else if (matchEntry.awayId === teamId) {
        opponents.add(matchEntry.homeId)
      }
    })

    return opponents
  }
)
