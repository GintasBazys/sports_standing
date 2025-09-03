import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from "react"
import { useSelector } from "react-redux"
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
import { useAppDispatch, useAppSelector } from "@/app/stateHooks.ts"
import type { TournamentProps } from "@/app/types/tournament.ts"
import { MAX_SCORE, MIN_SCORE } from "@/app/constants/tournaments.ts"

export default function ScoreCreator({ tournamentId, settings }: TournamentProps) {
  const showPlayer = settings?.showAddPlayer === true

  const dispatch = useAppDispatch()
  const teams = useAppSelector(state => selectStandings(state, tournamentId))

  const [homeId, setHomeId] = useState("")
  const [awayId, setAwayId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const homeScoreRef = useRef<HTMLInputElement | null>(null)
  const awayScoreRef = useRef<HTMLInputElement | null>(null)

  const [homeWon, setHomeWon] = useState(false)
  const [awayWon, setAwayWon] = useState(false)

  const options = useMemo<{ id: string; name: string }[]>(() => teams.map(t => ({ id: t.id, name: t.name })), [teams])
  const readyForScores = !!homeId && !!awayId && homeId !== awayId

  const alreadyPlayed = useSelector<RootState, boolean>(state => selectHasPlayed(state, tournamentId, homeId, awayId))

  const opponentsPlayedByHome = useSelector<RootState, Set<string>>(state =>
    selectOpponentsPlayed(state, tournamentId, homeId)
  )

  const unavailableAwayIds = useMemo<Set<string>>(() => {
    if (!homeId) {
      return new Set<string>()
    }

    const opponents = new Set<string>(opponentsPlayedByHome)

    opponents.add(homeId)

    return opponents
  }, [homeId, opponentsPlayedByHome])

  const awayOptions = useMemo(() => {
    if (!homeId) {
      return []
    }

    return options.filter(o => !unavailableAwayIds.has(o.id))
  }, [homeId, options, unavailableAwayIds])

  useEffect(() => {
    if (awayId && unavailableAwayIds.has(awayId)) {
      setAwayId("")
    }
  }, [awayId, unavailableAwayIds])

  useEffect(() => {
    setHomeWon(false)
    setAwayWon(false)
  }, [homeId, awayId])

  function readClampedScore(ref: RefObject<HTMLInputElement | null>, max = MAX_SCORE): number {
    const raw = Number(ref.current?.value)
    const number = Math.trunc(raw)

    if (Number.isNaN(number)) {
      return 0
    }

    return Math.max(0, Math.min(max, number))
  }

  function onSubmit(e: FormEvent): void {
    e.preventDefault()

    if (!readyForScores) {
      setError("Pick two different teams")

      return
    }

    if (alreadyPlayed) {
      setError("These teams have already played each other")

      return
    }

    const home = readClampedScore(homeScoreRef, MAX_SCORE)
    const away = readClampedScore(awayScoreRef, MAX_SCORE)

    let standingsH = home
    let standingsA = away

    if (showPlayer) {
      if (homeWon === awayWon) {
        setError("Select exactly one winner")

        return
      }

      standingsH = homeWon ? 1 : 0
      standingsA = awayWon ? 1 : 0
    }

    const create = createMatch(tournamentId, homeId, awayId)

    dispatch(create)
    const matchId = create.payload.id

    dispatch(addHomeScore(tournamentId, matchId, home))
    dispatch(addAwayScore(tournamentId, matchId, away))

    dispatch(recordResult(tournamentId, homeId, awayId, standingsH, standingsA))

    setHomeId("")
    setAwayId("")
    if (homeScoreRef.current) {
      homeScoreRef.current.value = "0"
    }

    if (awayScoreRef.current) {
      awayScoreRef.current.value = "0"
    }

    setHomeWon(false)
    setAwayWon(false)
    setError(null)
  }

  const homeName = options.find(option => option.id === homeId)?.name ?? "Home"
  const awayName = options.find(option => option.id === awayId)?.name ?? "Away"

  return (
    <div className="card__element">
      <h2>Add Result</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor={`homeOptions-${tournamentId}`}>Home</label>
          <select
            id={`homeOptions-${tournamentId}`}
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

          <label htmlFor={`awayOptions-${tournamentId}`}>Away</label>
          <select
            value={awayId}
            id={`awayOptions-${tournamentId}`}
            onChange={e => {
              setAwayId(e.target.value)
              setError(null)
            }}
            disabled={!homeId}
          >
            <option value="" disabled>
              Select team
            </option>
            {homeId &&
              awayOptions.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            {homeId && awayOptions.length === 0 && (
              <option value="" disabled>
                No opponents available
              </option>
            )}
          </select>
        </div>
        {readyForScores && (
          <>
            {showPlayer ? (
              <div className="row">
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={homeWon}
                    onChange={e => {
                      const checked = e.target.checked

                      setHomeWon(checked)
                      if (checked) {
                        setAwayWon(false)
                      }

                      setError(null)
                    }}
                  />
                  <span>{homeName} won</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={awayWon}
                    onChange={e => {
                      const checked = e.target.checked

                      setAwayWon(checked)
                      if (checked) {
                        setHomeWon(false)
                      }

                      setError(null)
                    }}
                  />
                  <span>{awayName} won</span>
                </label>
              </div>
            ) : (
              <div className="row">
                <NumberInput
                  id={`homeScore-${tournamentId}`}
                  ref={homeScoreRef}
                  min={MIN_SCORE}
                  max={MAX_SCORE}
                  step={1}
                  defaultValue="0"
                />
                <span>&nbsp;:&nbsp;</span>
                <NumberInput
                  id={`awayScore-${tournamentId}`}
                  ref={awayScoreRef}
                  min={MIN_SCORE}
                  max={MAX_SCORE}
                  step={1}
                  defaultValue="0"
                />
              </div>
            )}
            <PrimaryButton
              className="btn--full-width"
              type="submit"
              disabled={alreadyPlayed || (showPlayer && homeWon === awayWon)}
            >
              Save Result
            </PrimaryButton>
          </>
        )}
        {error && (
          <p role="alert" style={{ color: "crimson", marginTop: "8px" }}>
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
