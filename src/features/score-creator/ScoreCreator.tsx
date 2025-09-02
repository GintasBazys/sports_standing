import { useMemo, useState, type FormEvent } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  createMatch,
  addHomeScore,
  addAwayScore,
  selectHasPlayed,
  selectOpponentsPlayed
} from "@/features/score-creator/scoresSlice.ts"
import { recordResult, selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import type { RootState } from "@/app/store"

export default function ScoreCreator({ tournament }: { tournament: string }) {
  const dispatch = useDispatch()
  const teams = useSelector((state: RootState) => selectStandings(state, tournament))

  const [homeId, setHomeId] = useState("")
  const [awayId, setAwayId] = useState("")
  const [homeScore, setHomeScore] = useState("0")
  const [awayScore, setAwayScore] = useState("0")
  const [error, setError] = useState<string | null>(null)

  const options = useMemo(() => teams.map(t => ({ id: t.id, name: t.name })), [teams])
  const readyForScores = homeId && awayId && homeId !== awayId

  const alreadyPlayed = useSelector((state: RootState) => selectHasPlayed(state, tournament, homeId, awayId))

  const opponentsPlayedByHome = useSelector((state: RootState) => selectOpponentsPlayed(state, tournament, homeId))

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!readyForScores) {
      setError("Pick two different teams")

      return
    }

    if (alreadyPlayed) {
      setError("These teams have already played each other.")

      return
    }

    const h = Math.max(0, Math.trunc(Number(homeScore)))
    const a = Math.max(0, Math.trunc(Number(awayScore)))

    const create = createMatch(tournament, homeId, awayId)

    dispatch(create)
    const matchId = create.payload.id

    dispatch(addHomeScore(tournament, matchId, h))
    dispatch(addAwayScore(tournament, matchId, a))
    dispatch(recordResult(tournament, homeId, awayId, h, a))

    setHomeId("")
    setAwayId("")
    setHomeScore("0")
    setAwayScore("0")
    setError(null)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Add Result</h2>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="w-20">Home</label>
          <select
            value={homeId}
            onChange={e => {
              setHomeId(e.target.value)
              setError(null)
            }}
            disabled={options.length === 0}
            className="min-w-48 border rounded-lg p-2"
          >
            <option value="" disabled>
              Select team
            </option>
            {options.map(o => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>

          <span className="opacity-70">vs</span>

          <label className="w-20">Away</label>
          <select
            value={awayId}
            onChange={e => {
              setAwayId(e.target.value)
              setError(null)
            }}
            className="min-w-48 border rounded-lg p-2"
            disabled={!homeId}
          >
            <option value="" disabled>
              Select team
            </option>
            {options.map(o => (
              <option
                key={o.id}
                value={o.id}
                disabled={o.id === homeId || (!!homeId && opponentsPlayedByHome.has(o.id))}
              >
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {readyForScores && (
          <div className="flex gap-3 items-center">
            <input
              type="number"
              min={0}
              step={1}
              value={homeScore}
              onChange={e => {
                setHomeScore(e.target.value)
              }}
              className="w-16 text-center border rounded-lg p-2"
              aria-label="Home score"
            />
            <span>:</span>
            <input
              type="number"
              min={0}
              step={1}
              value={awayScore}
              onChange={e => {
                setAwayScore(e.target.value)
              }}
              className="w-16 text-center border rounded-lg p-2"
              aria-label="Away score"
            />

            <button
              type="submit"
              className="ml-3 border rounded-lg px-3 py-2 hover:bg-gray-50"
              disabled={alreadyPlayed}
              title={alreadyPlayed ? "These teams have already played." : undefined}
            >
              Save Result
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="text-red-600 text-sm">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
