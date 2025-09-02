import { useMemo } from "react"
import { useSelector } from "react-redux"
import { selectMatches } from "@/features/score-creator/scoresSlice.ts"
import { selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import type { RootState } from "@/app/store"

export default function MatchResultsTable({ tournament }: { tournament: string }) {
  const matches = useSelector((state: RootState) => selectMatches(state, tournament))
  const standings = useSelector((state: RootState) => selectStandings(state, tournament))

  const nameById = useMemo(() => {
    const map = new Map<string, string>()

    for (const team of standings) {
      const id = team.id

      if (!id) {
        continue
      }

      map.set(id, team.name)
    }

    return map
  }, [standings])

  const definedMatches = useMemo(() => matches.filter((m): m is NonNullable<typeof m> => m != null), [matches])

  if (!tournament) {
    return null
  }

  return (
    <table>
      <caption>ScoringTable</caption>
      <thead>
        <tr>
          <th>#</th>
          <th>Home</th>
          <th>Score</th>
          <th>Away</th>
        </tr>
      </thead>
      <tbody>
        {!definedMatches.length && (
          <tr>
            <td style={{ textAlign: "center" }} colSpan={4}>
              No results found
            </td>
          </tr>
        )}
        {definedMatches.map((match, i) => {
          const hasAnyScore = match.homeScore != null || match.awayScore != null

          const homeName = match.homeId ? (nameById.get(match.homeId) ?? match.homeId) : "—"

          const awayName = match.awayId ? (nameById.get(match.awayId) ?? match.awayId) : "—"

          return (
            <tr key={match.id}>
              <td>{i + 1}</td>
              <td>{homeName}</td>
              <td>
                {match.homeScore ?? ""}
                {hasAnyScore ? " - " : ""}
                {match.awayScore ?? ""}
              </td>
              <td>{awayName}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
