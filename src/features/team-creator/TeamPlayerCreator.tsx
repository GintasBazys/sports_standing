import { type FormEvent, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addTeamOrPlayer, selectStandings } from "@/features/team-creator/teamPlayerSlice.ts"

export default function TeamPlayerCreator() {
  const dispatch = useDispatch()
  const standings = useSelector(selectStandings)
  const [teamName, setTeamName] = useState("")

  const onAddTeam = (e: FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) {
      return
    }
    dispatch(addTeamOrPlayer(teamName))
    setTeamName("")
  }

  return (
    <div>
      <h2>Create Team</h2>
      <form onSubmit={onAddTeam}>
        <input
          value={teamName}
          onChange={e => {
            setTeamName(e.target.value)
          }}
          placeholder="Team name"
        />
        <button type="submit">Add Team</button>
      </form>

      <div>
        <h3>Table</h3>
        <div>
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
                  <td colSpan={7}>No teams available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
