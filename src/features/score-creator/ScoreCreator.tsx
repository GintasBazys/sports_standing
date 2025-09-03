import { useMemo, useRef, useState, type FormEvent, type RefObject } from "react"
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
import NumberInput from "@/app/components/inputs/NumberInput.tsx"
import PrimaryButton from "@/app/components/buttons/PrimaryButton.tsx"

export default function ScoreCreator({ tournament }: { tournament: string }) {
  const dispatch = useDispatch()
  const teams = useSelector((state: RootState) => selectStandings(state, tournament))

  const [homeId, setHomeId] = useState("")
  const [awayId, setAwayId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const homeScoreRef = useRef<HTMLInputElement | null>(null)
  const awayScoreRef = useRef<HTMLInputElement | null>(null)

  const options = useMemo<{ id: string; name: string }[]>(() => teams.map(t => ({ id: t.id, name: t.name })), [teams])
  const readyForScores = homeId && awayId && homeId !== awayId

  const alreadyPlayed = useSelector<RootState, boolean>(state => selectHasPlayed(state, tournament, homeId, awayId))

  const opponentsPlayedByHome = useSelector<RootState, Set<string>>(state =>
    selectOpponentsPlayed(state, tournament, homeId)
  )

  function readClampedScore(ref: RefObject<HTMLInputElement | null>, max = 99): number {
    const raw = Number(ref.current?.value)
    const n = Math.trunc(raw)

    if (Number.isNaN(n)) {
      return 0
    }

    return Math.max(0, Math.min(max, n))
  }

  function onSubmit(e: FormEvent): void {
    e.preventDefault()

    if (!readyForScores) {
      setError("Pick two different teams")

      return
    }

    if (alreadyPlayed) {
      setError("These teams have already played each other.")

      return
    }

    const h = readClampedScore(homeScoreRef, 99)
    const a = readClampedScore(awayScoreRef, 99)

    const create = createMatch(tournament, homeId, awayId)

    dispatch(create)
    const matchId = create.payload.id

    dispatch(addHomeScore(tournament, matchId, h))
    dispatch(addAwayScore(tournament, matchId, a))
    dispatch(recordResult(tournament, homeId, awayId, h, a))

    setHomeId("")
    setAwayId("")
    if (homeScoreRef.current) {
      homeScoreRef.current.value = "0"
    }

    if (awayScoreRef.current) {
      awayScoreRef.current.value = "0"
    }

    setError(null)
  }

  return (
    <div className="card__element">
      <h2>Add Result</h2>

      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor={`homeOptions-${tournament}`}>Home</label>
          <select
            id={`homeOptions-${tournament}`}
            value={homeId}
            onChange={e => {
              setHomeId(e.target.value)
              setError(null)
            }}
            disabled={options.length === 0}
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
          <label htmlFor={`awayOptions-${tournament}`}>Away</label>
          <select
            value={awayId}
            id={`awayOptions-${tournament}`}
            onChange={e => {
              setAwayId(e.target.value)
              setError(null)
            }}
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
          <>
            <div className="row">
              <NumberInput
                id={`homeScore-${tournament}`}
                ref={homeScoreRef}
                min={0}
                max={99}
                step={1}
                defaultValue="0"
                aria-label="Home score"
              />
              <span>&nbsp;:&nbsp;</span>
              <NumberInput
                id={`awayScore-${tournament}`}
                ref={awayScoreRef}
                min={0}
                max={99}
                step={1}
                defaultValue="0"
                aria-label="Away score"
              />
            </div>
            <PrimaryButton
              className="btn--full-width"
              type="submit"
              disabled={alreadyPlayed}
              title={alreadyPlayed ? "These teams have already played." : undefined}
            >
              Save Result
            </PrimaryButton>
          </>
        )}
        {error && (
          <p role="alert" style={{ color: "crimson", marginTop: 8 }}>
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
