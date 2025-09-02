import { createSlice, createSelector, nanoid, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/app/store"

type MatchEntry = {
  id: string
  tournamentId: string
  homeId: string
  awayId: string
  homeScore: number | null
  awayScore: number | null
}

type TournamentData = {
  matches: Record<string, MatchEntry | undefined>
  matchOrder: string[]
}

export type ScoresState = {
  byTournament: Partial<Record<string, TournamentData>>
}

const initialState: ScoresState = { byTournament: {} }

const makePairKey = (a: string, b: string) => [a, b].sort().join("::")

const getOrCreateTournamentBucket = (state: ScoresState, tournamentId: string): TournamentData => {
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

        const bucket = getOrCreateTournamentBucket(state, tournamentId)
        const pairKey = makePairKey(homeId, awayId)

        const exists = bucket.matchOrder.some(existingId => {
          const m = bucket.matches[existingId]

          if (!m) {
            return
          }

          return makePairKey(m.homeId, m.awayId) === pairKey
        })

        if (exists) {
          return
        }

        bucket.matches[matchId] = {
          id: matchId,
          tournamentId,
          homeId,
          awayId,
          homeScore: null,
          awayScore: null
        }
        bucket.matchOrder.push(matchId)
      }
    ),

    addHomeScore: create.preparedReducer(
      (tournamentId: string, matchId: string, homeScore: number) => ({
        payload: { tournamentId, matchId, homeScore }
      }),
      (state, action: PayloadAction<{ tournamentId: string; matchId: string; homeScore: number }>) => {
        const { tournamentId, matchId, homeScore } = action.payload
        const match = state.byTournament[tournamentId]?.matches[matchId]

        if (!match) {
          return
        }

        match.homeScore = Math.max(0, Math.trunc(homeScore))
      }
    ),

    addAwayScore: create.preparedReducer(
      (tournamentId: string, matchId: string, awayScore: number) => ({
        payload: { tournamentId, matchId, awayScore }
      }),
      (state, action: PayloadAction<{ tournamentId: string; matchId: string; awayScore: number }>) => {
        const { tournamentId, matchId, awayScore } = action.payload
        const match = state.byTournament[tournamentId]?.matches[matchId]

        if (!match) {
          return
        }

        match.awayScore = Math.max(0, Math.trunc(awayScore))
      }
    )
  })
})

export const { createMatch, addHomeScore, addAwayScore } = scoresSlice.actions
export default scoresSlice.reducer

const selectScoresState = (state: RootState) => state.scores
const selectByTournament = createSelector(selectScoresState, s => s.byTournament)

const selectTournamentId = (_: RootState, tournamentId?: string) => tournamentId
const selectFirstTeamId = (_: RootState, __?: string, firstTeamId?: string) => firstTeamId
const selectSecondTeamId = (_: RootState, __?: string, ___?: string, secondTeamId?: string) => secondTeamId
const selectTeamId = (_: RootState, __?: string, teamId?: string) => teamId

export const selectMatches = createSelector([selectByTournament, selectTournamentId], (byTournament, tournamentId) => {
  if (!tournamentId) {
    return []
  }

  const bucket = byTournament[tournamentId]

  if (!bucket) {
    return []
  }

  return bucket.matchOrder.map(id => bucket.matches[id])
})

export const selectHasPlayed = createSelector(
  [selectByTournament, selectTournamentId, selectFirstTeamId, selectSecondTeamId],
  (byTournament, tournamentId, firstTeamId, secondTeamId) => {
    if (!tournamentId || !firstTeamId || !secondTeamId || firstTeamId === secondTeamId) {
      return false
    }

    const bucket = byTournament[tournamentId]

    if (!bucket) {
      return false
    }

    const key = makePairKey(firstTeamId, secondTeamId)

    return bucket.matchOrder.some(id => {
      const m = bucket.matches[id]

      if (!m) {
        return false
      }

      return makePairKey(m.homeId, m.awayId) === key
    })
  }
)

export const selectOpponentsPlayed = createSelector(
  [selectByTournament, selectTournamentId, selectTeamId],
  (byTournament, tournamentId, teamId) => {
    const opponents = new Set<string>()

    if (!tournamentId || !teamId) {
      return opponents
    }

    const bucket = byTournament[tournamentId]

    if (!bucket) {
      return opponents
    }

    bucket.matchOrder.forEach(id => {
      const m = bucket.matches[id]

      if (!m) {
        return
      }

      if (m.homeId === teamId) {
        opponents.add(m.awayId)
      } else if (m.awayId === teamId) {
        opponents.add(m.homeId)
      }
    })

    return opponents
  }
)
