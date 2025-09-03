import { useSelector } from "react-redux"
import { selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import type { RootState } from "@/app/store"
import type { TournamentProps } from "@/app/types/tournament.ts"
import translations from "@/app/translations/en.json"
import { ParticipantTypes } from "@/app/enumerators/participant.ts"
import { useAutoScroll } from "@/app/hooks/useAutoScroll.ts"

export default function StandingsTable({ tournament, settings }: TournamentProps) {
  const standings = useSelector((state: RootState) => selectStandings(state, tournament))

  const isPlayersOnly = settings?.showAddPlayer && !settings.showAddTeam
  const translationKey: ParticipantTypes = isPlayersOnly ? ParticipantTypes.PLAYER : ParticipantTypes.TEAM

  const visibleCols = {
    played: settings?.showPlayed,
    wins: settings?.showWins,
    draws: settings?.showDraws,
    losses: settings?.showLosses,
    points: settings?.showPoints
  }

  const colCount =
    1 +
    Number(visibleCols.played) +
    Number(visibleCols.wins) +
    Number(visibleCols.draws) +
    Number(visibleCols.losses) +
    Number(visibleCols.points)

  const setRowRef = useAutoScroll(standings)

  return (
    <>
      <h3>{translations.headings.standings}</h3>
      <div className="scrollable-x">
        <table>
          <thead>
            <tr>
              <th>{translations.headers.name[translationKey]}</th>
              {visibleCols.played && <th>{translations.headers.played[translationKey]}</th>}
              {visibleCols.wins && <th>{translations.headers.wins}</th>}
              {visibleCols.draws && <th>{translations.headers.draws}</th>}
              {visibleCols.losses && <th>{translations.headers.losses}</th>}
              {visibleCols.points && <th>{translations.headers.points}</th>}
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
                  {translations.empty[translationKey]}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
