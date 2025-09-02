import { useEffect, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import { selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import type { RootState } from "@/app/store"
import type { LayoutSettings } from "@/app/types/tournament.ts"
import { TEXT } from "@/app/constants/text.ts"
import { ParticipantTypes } from "@/app/enumerators/participant.ts"

type Props = { tournament: string; settings: LayoutSettings }

export default function StandingsTable({ tournament, settings }: Props) {
  const standings = useSelector((state: RootState) => selectStandings(state, tournament))

  const isPlayersOnly = settings.showAddPlayer && !settings.showAddTeam
  const translationKey: ParticipantTypes = isPlayersOnly ? ParticipantTypes.PLAYER : ParticipantTypes.TEAM

  const visibleCols = {
    played: settings.showPlayed,
    wins: settings.showWins,
    draws: settings.showDraws,
    losses: settings.showLosses,
    points: settings.showPoints
  }

  const colCount =
    1 +
    Number(visibleCols.played) +
    Number(visibleCols.wins) +
    Number(visibleCols.draws) +
    Number(visibleCols.losses) +
    Number(visibleCols.points)

  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map())
  const setRowRef = useCallback(
    (id: string) => (el: HTMLTableRowElement | null) => {
      if (el) {
        rowRefs.current.set(id, el)
      } else {
        rowRefs.current.delete(id)
      }
    },
    []
  )

  const prevIdsRef = useRef<Set<string>>(new Set(standings.map(r => r.id)))

  useEffect(() => {
    const currIds = new Set(standings.map(r => r.id))
    const added: string[] = []

    currIds.forEach(id => {
      if (!prevIdsRef.current.has(id)) {
        added.push(id)
      }
    })

    if (added.length) {
      const targetId = added[added.length - 1] ?? ""
      const node = rowRefs.current.get(targetId)

      node?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
    }

    prevIdsRef.current = currIds
  }, [standings])

  return (
    <>
      <h3>{TEXT.headings.standings}</h3>
      <div className="scrollable-x">
        <table>
          <thead>
            <tr>
              <th>{TEXT.headers.name[translationKey]}</th>
              {visibleCols.played && <th>{TEXT.headers.played[translationKey]}</th>}
              {visibleCols.wins && <th>{TEXT.headers.wins}</th>}
              {visibleCols.draws && <th>{TEXT.headers.draws}</th>}
              {visibleCols.losses && <th>{TEXT.headers.losses}</th>}
              {visibleCols.points && <th>{TEXT.headers.points}</th>}
            </tr>
          </thead>
          <tbody>
            {standings.map(row => (
              <tr key={row.id} ref={setRowRef(row.id)}>
                <td>{row.name}</td>
                {visibleCols.played && <td>{row.played}</td>}
                {visibleCols.wins && <td>{row.wins}</td>}
                {visibleCols.draws && <td>{row.draws}</td>}
                {visibleCols.losses && <td>{row.losses}</td>}
                {visibleCols.points && <td>{row.points}</td>}
              </tr>
            ))}

            {standings.length === 0 && (
              <tr>
                <td style={{ textAlign: "center" }} colSpan={colCount}>
                  {TEXT.empty[translationKey]}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
