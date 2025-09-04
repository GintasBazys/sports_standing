import { useMemo, useRef, useState, type FormEvent, type RefObject, type ChangeEvent, type ReactElement } from "react"
import { createMatch, setMatchScores, selectOpponentsPlayed } from "@/features/score-creator/scoresSlice.ts"
import { recordResult, selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import NumberInput from "@/app/components/inputs/NumberInput.tsx"
import PrimaryButton from "@/app/components/buttons/PrimaryButton.tsx"
import { useAppDispatch, useAppSelector } from "@/app/stateHooks.ts"
import type { TournamentProps } from "@/app/types/tournament.ts"
import type { RootState } from "@/app/store"
import { MAX_ENTRY_LIMIT, MAX_SCORE, MIN_SCORE } from "@/app/constants/tournaments.ts"

export default function ScoreCreator({ tournamentId, settings }: TournamentProps) {
  const isPlayerMode = settings?.showAddPlayer === true

  const dispatch = useAppDispatch()

  function selectParticipantsForTournament(state: RootState) {
    return selectStandings(state, tournamentId)
  }

  const participants = useAppSelector(selectParticipantsForTournament)

  const [homeParticipantId, setHomeParticipantId] = useState("")
  const [awayParticipantId, setAwayParticipantId] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const homeScoreRef = useRef<HTMLInputElement | null>(null)
  const awayScoreRef = useRef<HTMLInputElement | null>(null)

  const [homeParticipantWon, setHomeParticipantWon] = useState(false)
  const [awayParticipantWon, setAwayParticipantWon] = useState(false)

  const participantOptions = useMemo<{ id: string; name: string }[]>(() => {
    const options = []

    for (const participant of participants) {
      if (participant.played + 1 === participants.length) {
        continue
      }

      options.push({ id: participant.id, name: participant.name })
    }

    return options
  }, [participants])

  const canEnterScores = homeParticipantId !== "" && awayParticipantId !== "" && homeParticipantId !== awayParticipantId

  function selectOpponentsForHome(state: RootState): Set<string> {
    return selectOpponentsPlayed(state, tournamentId, homeParticipantId)
  }

  const opponentsPlayedByHome = useAppSelector(selectOpponentsForHome)

  const unavailableAwayIds = useMemo(() => {
    if (!homeParticipantId) {
      return new Set<string>()
    }

    const ids = new Set<string>(opponentsPlayedByHome)

    ids.add(homeParticipantId)

    return ids
  }, [homeParticipantId, opponentsPlayedByHome])

  const filteredAwayOptions = useMemo(() => {
    if (!homeParticipantId) {
      return []
    }

    return participantOptions.filter(option => !unavailableAwayIds.has(option.id))
  }, [homeParticipantId, participantOptions, unavailableAwayIds])

  function clampScoreFromRef(inputRef: RefObject<HTMLInputElement | null>, maxScore = MAX_SCORE): number {
    const rawValue = Number(inputRef.current?.value)
    const truncated = Math.trunc(rawValue)

    return Math.max(0, Math.min(maxScore, truncated))
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()

    if (!canEnterScores) {
      setErrorMessage("Pick two different teams")

      return
    }

    const homeScore = clampScoreFromRef(homeScoreRef, MAX_SCORE)
    const awayScore = clampScoreFromRef(awayScoreRef, MAX_SCORE)

    let standingsHome = homeScore
    let standingsAway = awayScore

    if (isPlayerMode) {
      if (homeParticipantWon === awayParticipantWon) {
        setErrorMessage("Select exactly one winner")

        return
      }

      standingsHome = homeParticipantWon ? 1 : 0
      standingsAway = awayParticipantWon ? 1 : 0
    }

    const createAction = createMatch(tournamentId, homeParticipantId, awayParticipantId)

    dispatch(createAction)
    const matchId = createAction.payload.id

    dispatch(setMatchScores(tournamentId, matchId, homeScore, awayScore))
    dispatch(recordResult(tournamentId, homeParticipantId, awayParticipantId, standingsHome, standingsAway))

    setHomeParticipantId("")
    setAwayParticipantId("")
    if (homeScoreRef.current) {
      homeScoreRef.current.value = "0"
    }

    if (awayScoreRef.current) {
      awayScoreRef.current.value = "0"
    }

    setHomeParticipantWon(false)
    setAwayParticipantWon(false)
    setErrorMessage(null)
  }

  function handleHomeSelectChange(event: ChangeEvent<HTMLSelectElement>): void {
    setHomeParticipantId(event.target.value)
    setErrorMessage(null)
  }

  function handleAwaySelectChange(event: ChangeEvent<HTMLSelectElement>): void {
    setAwayParticipantId(event.target.value)
    setErrorMessage(null)
  }

  function handleHomeWonChange(event: ChangeEvent<HTMLInputElement>): void {
    const isChecked = event.target.checked

    setHomeParticipantWon(isChecked)
    if (isChecked) {
      setAwayParticipantWon(false)
    }

    setErrorMessage(null)
  }

  function handleAwayWonChange(event: ChangeEvent<HTMLInputElement>): void {
    const isChecked = event.target.checked

    setAwayParticipantWon(isChecked)
    if (isChecked) {
      setHomeParticipantWon(false)
    }

    setErrorMessage(null)
  }

  function getParticipantNameById(options: { id: string; name: string }[], id: string, fallback: string): string {
    for (const option of options) {
      if (option.id === id) {
        return option.name
      }
    }

    return fallback
  }

  function renderParticipantOption(option: { id: string; name: string }): ReactElement {
    return (
      <option key={option.id} value={option.id}>
        {option.name}
      </option>
    )
  }

  const homeParticipantName = getParticipantNameById(participantOptions, homeParticipantId, "Home")
  const awayParticipantName = getParticipantNameById(participantOptions, awayParticipantId, "Away")
  const maxEntries = participants.length >= MAX_ENTRY_LIMIT

  return (
    <div className="card__element">
      <h2>Add Result</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor={`homeOptions-${tournamentId}`}>Home</label>
        <div className="select-wrapper">
          <select
            id={`homeOptions-${tournamentId}`}
            value={homeParticipantId}
            onChange={handleHomeSelectChange}
            disabled={participantOptions.length === 0}
          >
            <option value="" disabled>
              Select team
            </option>
            {participantOptions.map(renderParticipantOption)}
          </select>
          <svg className="arrow" viewBox="0 0 16 16">
            <path
              d="M2 5l6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <label htmlFor={`awayOptions-${tournamentId}`}>Away</label>
        <div className="select-wrapper">
          <select
            id={`awayOptions-${tournamentId}`}
            value={awayParticipantId}
            onChange={handleAwaySelectChange}
            disabled={!homeParticipantId}
          >
            <option value="" disabled>
              Select team
            </option>
            {filteredAwayOptions.map(renderParticipantOption)}
            {filteredAwayOptions.length === 0 && (
              <option value="" disabled>
                No opponents available
              </option>
            )}
          </select>
          <svg className="arrow" viewBox="0 0 16 16">
            <path
              d="M2 5l6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {canEnterScores && (
          <>
            {isPlayerMode ? (
              <div className="row">
                <label>
                  <input type="checkbox" checked={homeParticipantWon} onChange={handleHomeWonChange} />
                  <span>{homeParticipantName} won</span>
                </label>
                <label>
                  <input type="checkbox" checked={awayParticipantWon} onChange={handleAwayWonChange} />
                  <span>{awayParticipantName} won</span>
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
            {errorMessage && <p className="error">{errorMessage}</p>}
            <PrimaryButton className="btn--full-width" type="submit" disabled={maxEntries}>
              Save Result
            </PrimaryButton>
            {maxEntries && <p className="error margin-0">Max entry limit reached - {MAX_ENTRY_LIMIT}</p>}
          </>
        )}
      </form>
    </div>
  )
}
