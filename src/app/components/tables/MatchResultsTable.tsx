import { useMemo, useRef } from "react"
import { selectMatches } from "@/features/match-creator/matchesSlice.ts"
import { selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import type { RootState } from "@/app/store.ts"
import { ParticipantTypes } from "@/app/enumerators/participant.ts"
import type { TournamentProps } from "@/app/types/tournament.ts"
import translations from "@/app/translations/en.json"
import { useTableAutoScroll } from "@/app/hooks/useTableAutoScroll.ts"
import type { MatchEntry } from "@/app/types/matches.ts"
import ReactCountryFlag from "react-country-flag"
import { useAppSelector } from "@/app/stateHooks.ts"

export default function MatchResultsTable({ tournamentId, settings }: TournamentProps) {
  const matches = useAppSelector<RootState, ReturnType<typeof selectMatches>>((state: RootState) =>
    selectMatches(state, tournamentId)
  )

  const standings = useAppSelector<RootState, ReturnType<typeof selectStandings>>((state: RootState) =>
    selectStandings(state, tournamentId)
  )

  const nameAndFlagById = useMemo<Map<string, { name: string; isoCode?: string }>>(() => {
    const participantsById = new Map<string, { name: string; isoCode?: string }>()

    for (const participant of standings) {
      if (!participant.id) {
        continue
      }

      participantsById.set(participant.id, { name: participant.name, isoCode: participant.iso_code })
    }

    return participantsById
  }, [standings])

  const definedMatches = useMemo<MatchEntry[]>(() => matches.filter(matchEntry => matchEntry != null), [matches])

  const isPlayersOnly = settings.showAddPlayer && !settings.showAddTeam
  const translationKey: ParticipantTypes = isPlayersOnly ? ParticipantTypes.PLAYER : ParticipantTypes.TEAM

  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useTableAutoScroll(tbodyRef, wrapperRef)

  if (!tournamentId) {
    return null
  }

  return (
    <>
      <h3>{translations.headings.results}</h3>
      <div ref={wrapperRef} className="scrollable-x">
        <table>
          <thead>
            <tr>
              <th>{translations.headers.number}</th>
              <th>{translations.headers.home[translationKey]}</th>
              <th>{translations.headers.score}</th>
              <th>{translations.headers.away[translationKey]}</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {!definedMatches.length && (
              <tr>
                <td className="text-center" colSpan={4}>
                  {translations.matches.empty}
                </td>
              </tr>
            )}
            {definedMatches.map((match, index) => {
              const hasAnyScore = match.homeScore != null || match.awayScore != null

              const home = match.homeId
                ? (nameAndFlagById.get(match.homeId) ?? { name: match.homeId, isoCode: "" })
                : { name: "—", isoCode: undefined }

              const away = match.awayId
                ? (nameAndFlagById.get(match.awayId) ?? { name: match.awayId, isoCode: "" })
                : { name: "—", isoCode: undefined }

              return (
                <tr key={match.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="wrapper">
                      {settings.showFlags && home.isoCode && (
                        <ReactCountryFlag className="country-flag" countryCode={home.isoCode} />
                      )}
                      {home.name}
                    </div>
                  </td>
                  <td>
                    {match.homeScore}
                    {hasAnyScore ? " - " : ""}
                    {match.awayScore}
                  </td>
                  <td>
                    <div className="wrapper">
                      {settings.showFlags && away.isoCode && (
                        <ReactCountryFlag className="country-flag" countryCode={away.isoCode} />
                      )}
                      {away.name}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
