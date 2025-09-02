import { type FormEvent, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addTeamOrPlayer, selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import { normalizeName } from "@/app/utils/normalizeName"
import type { RootState } from "@/app/store.ts"
import type { LayoutSettings } from "@/app/types/tournament.ts"
import { ParticipantTypes } from "@/app/enumerators/participant.ts"
import { TEXT } from "@/app/constants/text.ts"

type Props = { tournament: string; settings: LayoutSettings }

export default function ParticipantsCreator({ tournament, settings }: Props) {
  const dispatch = useDispatch()
  const standings = useSelector((state: RootState) => selectStandings(state, tournament))
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const translationKey = settings.showAddPlayer ? ParticipantTypes.PLAYER : ParticipantTypes.TEAM

  const onAddTeam = (e: FormEvent) => {
    e.preventDefault()
    const el = inputRef.current

    if (!el) {
      return
    }

    const raw = el.value
    const normalized = normalizeName(raw)

    if (!normalized) {
      setError(TEXT.participants.errors.empty[translationKey])
      el.focus()

      return
    }

    const exists = standings.some(t => normalizeName(t.name) === normalized)

    if (exists) {
      setError(TEXT.participants.errors.duplicate[translationKey])
      el.select()
      el.focus()

      return
    }

    dispatch(addTeamOrPlayer(el.value, tournament))
    el.value = ""
    setError(null)
  }

  return (
    <div>
      <h2>{TEXT.participants.title[translationKey]}</h2>
      <form onSubmit={onAddTeam}>
        <input ref={inputRef} placeholder={TEXT.participants.placeholder[translationKey]} />
        <button type="submit">{TEXT.participants.addBtn[translationKey]}</button>
      </form>

      {error && (
        <p role="alert" style={{ color: "crimson", marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  )
}
