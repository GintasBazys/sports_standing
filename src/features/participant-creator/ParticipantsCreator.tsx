import { type FormEvent, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addParticipant, selectStandings } from "@/features/participant-creator/participantsSlice"
import type { RootState } from "@/app/store"
import type { TournamentProps } from "@/app/types/tournament"
import { ParticipantTypes } from "@/app/enumerators/participant"
import translations from "@/app/translations/en.json"
import TextInput from "@/app/components/inputs/TextInput"
import PrimaryButton from "@/app/components/buttons/PrimaryButton"
import { MAX_ENTRY_LIMIT, MAX_NAME_LENGTH } from "@/app/constants/tournaments"

export default function ParticipantsCreator({ tournamentId, settings }: TournamentProps) {
  const dispatch = useDispatch()
  const standings = useSelector<RootState, ReturnType<typeof selectStandings>>(state =>
    selectStandings(state, tournamentId)
  )
  const inputRef = useRef<HTMLInputElement | null>(null)
  const isoRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  const translationKey = settings?.showAddPlayer ? ParticipantTypes.PLAYER : ParticipantTypes.TEAM

  function handleAddParticipant(e: FormEvent): void {
    e.preventDefault()
    const nameEl = inputRef.current
    const isoEl = isoRef.current

    if (!nameEl) {
      return
    }

    const value = nameEl.value

    if (!value) {
      setError(translations.participants.errors.empty[translationKey])

      return
    }

    const exists = standings.some(t => t.name === value)

    if (exists) {
      setError(translations.participants.errors.duplicate[translationKey])

      return
    }

    let iso_code: string | undefined

    if (settings?.showFlags && isoEl) {
      const raw = isoEl.value

      if (raw.length > 0 && !/^[A-Za-z]{2}$/.test(raw)) {
        setError("Please enter a valid 2-letter ISO 3166-1 code (e.g., US, GB, LT).")

        return
      }

      iso_code = raw ? raw.toUpperCase() : undefined
    }

    dispatch(addParticipant(value, tournamentId, iso_code))
    nameEl.value = ""
    if (isoEl) {
      isoEl.value = ""
    }

    setError(null)
  }

  const maxEntries = standings.length >= MAX_ENTRY_LIMIT

  return (
    <div className="card__element">
      <h2>{translations.participants.title[translationKey]}</h2>
      <form onSubmit={handleAddParticipant}>
        <div className="input-wrapper">
          <TextInput
            id={`participant-${tournamentId}`}
            ref={inputRef}
            placeholder={translations.participants.placeholder[translationKey]}
            maxLength={MAX_NAME_LENGTH}
          />

          {settings?.showFlags && (
            <TextInput
              id={`participant-iso-${tournamentId}`}
              ref={isoRef}
              placeholder="ISO country code (optional)"
              maxLength={2}
            />
          )}
        </div>
        {error && <p className="error">{error}</p>}
        <PrimaryButton className="btn--full-width" type="submit" disabled={maxEntries}>
          {translations.participants.addBtn[translationKey]}
        </PrimaryButton>
        {maxEntries && <p className="error margin-0">Max entry limit reached - {MAX_ENTRY_LIMIT}</p>}
      </form>
    </div>
  )
}
