import { useMemo, useRef, useState, type FormEvent, type RefObject, type ChangeEvent, type ReactElement } from "react"
import { createMatch, setMatchScores, selectOpponentsPlayed } from "@/features/match-creator/matchesSlice.ts"
import { recordResult, selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import NumberInput from "@/app/components/inputs/NumberInput.tsx"
import PrimaryButton from "@/app/components/buttons/PrimaryButton.tsx"
import { useAppDispatch, useAppSelector } from "@/app/stateHooks.ts"
import type { TournamentProps } from "@/app/types/tournament.ts"
import type { RootState } from "@/app/store.ts"
import { MAX_ENTRY_LIMIT, MAX_SCORE, MIN_SCORE } from "@/app/constants/tournaments.ts"
import { ParticipantTypes } from "@/app/enumerators/participant.ts"
import translations from "@/app/translations/en.json"

export default function MatchesCreator({ tournamentId, settings }: TournamentProps) {
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

  const filteredHomeOptions = useMemo(() => {
    if (!awayParticipantId) {
      return participantOptions
    }

    return participantOptions.filter(option => option.id !== awayParticipantId)
  }, [participantOptions, awayParticipantId])

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

  function removeNumberFractionalPart(inputRef: RefObject<HTMLInputElement | null>, maxScore = MAX_SCORE): number {
    const rawValue = Number(inputRef.current?.value)
    const truncated = Math.trunc(rawValue)

    return Math.max(0, Math.min(maxScore, truncated))
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()

    if (!canEnterScores) {
      setErrorMessage(translations.scores.errors.pickDifferent[translationKey])

      return
    }

    const homeScore = removeNumberFractionalPart(homeScoreRef, MAX_SCORE)
    const awayScore = removeNumberFractionalPart(awayScoreRef, MAX_SCORE)

    let standingsHome = homeScore
    let standingsAway = awayScore

    if (isPlayersOnly) {
      if (homeParticipantWon === awayParticipantWon) {
        setErrorMessage(translations.scores.errors.winnerRequired)

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

  const isPlayersOnly = settings.showAddPlayer && !settings.showAddTeam
  const translationKey: ParticipantTypes = isPlayersOnly ? ParticipantTypes.PLAYER : ParticipantTypes.TEAM

  return (
    <div className="card__element">
      <h2>{translations.scores.addTitle}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor={`homeOptions-${tournamentId}`}>{translations.scores.labels.home[translationKey]}</label>
        <div className="select-wrapper">
          <select
            id={`homeOptions-${tournamentId}`}
            value={homeParticipantId}
            onChange={handleHomeSelectChange}
            disabled={filteredHomeOptions.length === 0}
          >
            <option value="" disabled>
              {translations.scores.selectPlaceholder[translationKey]}
            </option>
            {filteredHomeOptions.map(renderParticipantOption)}
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
        <label htmlFor={`awayOptions-${tournamentId}`}>{translations.scores.labels.away[translationKey]}</label>
        <div className="select-wrapper">
          <select
            id={`awayOptions-${tournamentId}`}
            value={awayParticipantId}
            onChange={handleAwaySelectChange}
            disabled={!homeParticipantId}
          >
            <option value="" disabled>
              {translations.scores.selectPlaceholder[translationKey]}
            </option>
            {filteredAwayOptions.map(renderParticipantOption)}
            {filteredAwayOptions.length === 0 && (
              <option value="" disabled>
                {translations.scores.noOpponents}
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
            {isPlayersOnly ? (
              <>
                <h3 className="text-center margin-0">{translations.scores.winner}</h3>
                <div className="checkbox-row">
                  <label>
                    <input type="checkbox" checked={homeParticipantWon} onChange={handleHomeWonChange} />
                    <span>{homeParticipantName}</span>
                  </label>
                  <label>
                    <input type="checkbox" checked={awayParticipantWon} onChange={handleAwayWonChange} />
                    <span>{awayParticipantName}</span>
                  </label>
                </div>
              </>
            ) : (
              <div className="checkbox-row">
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
              {translations.scores.saveBtn}
            </PrimaryButton>
            {maxEntries && (
              <p className="error margin-0">
                {translations.general.entry_limit} - {MAX_ENTRY_LIMIT}
              </p>
            )}
          </>
        )}
      </form>
    </div>
  )
}
