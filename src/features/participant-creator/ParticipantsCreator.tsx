import { type FormEvent, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addTeamOrPlayer, selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import { normalizeName } from "@/app/utils/normalizeName"
import type { RootState } from "@/app/store.ts"

export default function ParticipantsCreator({ tournament }: { tournament: string }) {
  const dispatch = useDispatch()
  const standings = useSelector((state: RootState) => selectStandings(state, tournament))
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const onAddTeam = (e: FormEvent) => {
    e.preventDefault()
    const el = inputRef.current

    if (!el) {
      return
    }

    const raw = el.value
    const normalized = normalizeName(raw)

    if (!normalized) {
      setError("Please enter a team name")
      el.focus()

      return
    }

    const exists = standings.some(t => normalizeName(t.name) === normalized)

    if (exists) {
      setError("That team name already exists")
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
      <h2>Create Team</h2>
      <form onSubmit={onAddTeam}>
        <input ref={inputRef} placeholder="Team name" />
        <button type="submit">Add Team</button>
      </form>

      {error && (
        <p role="alert" style={{ color: "crimson", marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  )
}
