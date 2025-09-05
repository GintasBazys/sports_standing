import { useRef } from "react"
import { selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import type { TournamentProps } from "@/app/types/tournament.ts"
import translations from "@/app/translations/en.json"
import { ParticipantTypes } from "@/app/enumerators/participant.ts"
import ReactCountryFlag from "react-country-flag"
import { useAppSelector } from "@/app/stateHooks.ts"
import winIcon from "@/assets/icons/win.svg"
import loseIcon from "@/assets/icons/lose.svg"
import { useTableAutoScroll } from "@/app/hooks/useTableAutoScroll.ts"

export default function StandingsTable({ tournamentId, settings }: TournamentProps) {
  const standings = useAppSelector(state => selectStandings(state, tournamentId))

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
    Number(visibleCols.played) +
    Number(visibleCols.wins) +
    Number(visibleCols.draws) +
    Number(visibleCols.losses) +
    Number(visibleCols.points)

  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useTableAutoScroll(tbodyRef, wrapperRef)

  return (
    <>
      <h3>{translations.headings.standings}</h3>
      <div ref={wrapperRef} className="scrollable-x">
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
          <tbody ref={tbodyRef}>
            {standings.map(row => (
              <tr key={row.id}>
                <td>
                  <div className="wrapper">
                    {settings.showFlags && row.iso_code && (
                      <ReactCountryFlag className="country-flag" countryCode={row.iso_code} />
                    )}
                    {row.name}
                  </div>
                </td>
                {visibleCols.played && <td>{row.played}</td>}
                {visibleCols.wins && (
                  <td>
                    {row.wins}
                    {settings.showWinLoseIcons && row.wins > 0 && (
                      <img className="icon" width={16} height={16} src={winIcon} alt="win" />
                    )}
                  </td>
                )}
                {visibleCols.draws && <td>{row.draws}</td>}
                {visibleCols.losses && (
                  <td>
                    {row.losses}
                    {settings.showWinLoseIcons && row.losses > 0 && (
                      <img className="icon" width={16} height={16} src={loseIcon} alt="lose" />
                    )}
                  </td>
                )}
                {visibleCols.points && <td>{row.points}</td>}
              </tr>
            ))}

            {standings.length === 0 && (
              <tr>
                <td className="text-center" colSpan={colCount + 1}>
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
