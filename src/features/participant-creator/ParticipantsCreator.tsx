import { type FormEvent, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addParticipant, selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import type { RootState } from "@/app/store.ts"
import type { TournamentProps } from "@/app/types/tournament.ts"
import { ParticipantTypes } from "@/app/enumerators/participant.ts"
import translations from "@/app/translations/en.json"
import TextInput from "@/app/components/inputs/TextInput.tsx"
import PrimaryButton from "@/app/components/buttons/PrimaryButton.tsx"

export default function ParticipantsCreator({ tournament, settings }: TournamentProps) {
  const dispatch = useDispatch()
  const standings = useSelector<RootState, ReturnType<typeof selectStandings>>(state =>
    selectStandings(state, tournament)
  )
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  const translationKey = settings?.showAddPlayer ? ParticipantTypes.PLAYER : ParticipantTypes.TEAM

  function handleAddParticipant(e: FormEvent): void {
    e.preventDefault()
    const el = inputRef.current

    if (!el) {
      return
    }

    const value = el.value

    if (!value) {
      setError(translations.participants.errors.empty[translationKey])
      el.focus()

      return
    }

    const exists = standings.some(t => t.name === value)

    if (exists) {
      setError(translations.participants.errors.duplicate[translationKey])
      el.select()
      el.focus()

      return
    }

    dispatch(addParticipant(el.value, tournament))
    el.value = ""
    setError(null)
  }

  return (
    <div className="card__element">
      <h2>{translations.participants.title[translationKey]}</h2>
      <form onSubmit={handleAddParticipant}>
        <TextInput
          id={`participant-${tournament}`}
          ref={inputRef}
          placeholder={translations.participants.placeholder[translationKey]}
          maxLength={250}
        />
        {error && <p style={{ color: "crimson", margin: "0.5rem 0 0 0" }}>{error}</p>}
        <PrimaryButton className="btn--full-width" type="submit">
          {translations.participants.addBtn[translationKey]}
        </PrimaryButton>
      </form>
    </div>
  )
}
