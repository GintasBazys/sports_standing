import { useSelector } from "react-redux"
import { selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import type { RootState } from "@/app/store"

export default function StandingsTable({ tournament }: { tournament: string }) {
  const standings = useSelector((state: RootState) => selectStandings(state, tournament))

  return (
    <>
      <h3>Standings</h3>
      <div className="scrollable-x">
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(team => (
              <tr key={team.id}>
                <td>{team.name}</td>
                <td>{team.played}</td>
                <td>{team.wins}</td>
                <td>{team.draws}</td>
                <td>{team.losses}</td>
                <td>{team.points}</td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr>
                <td style={{ textAlign: "center" }} colSpan={6}>
                  No teams available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
