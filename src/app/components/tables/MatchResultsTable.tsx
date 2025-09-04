import { useMemo } from "react"
import { useSelector } from "react-redux"
import { selectMatches } from "@/features/score-creator/scoresSlice.ts"
import { selectStandings } from "@/features/participant-creator/participantsSlice.ts"
import type { RootState } from "@/app/store.ts"
import { ParticipantTypes } from "@/app/enumerators/participant.ts"
import type { TournamentProps } from "@/app/types/tournament.ts"
import translations from "@/app/translations/en.json"
import { useAutoScroll } from "@/app/hooks/useAutoScroll.ts"
import type { MatchEntry } from "@/app/types/scores.ts"
import ReactCountryFlag from "react-country-flag"

export default function MatchResultsTable({ tournamentId, settings }: TournamentProps) {
  const matches = useSelector<RootState, ReturnType<typeof selectMatches>>((state: RootState) =>
    selectMatches(state, tournamentId)
  )

  const standings = useSelector<RootState, ReturnType<typeof selectStandings>>((state: RootState) =>
    selectStandings(state, tournamentId)
  )

  const nameAndFlagById = useMemo<Map<string, { name: string; isoCode: string | undefined }>>(() => {
    const participantsById = new Map<string, { name: string; isoCode: string | undefined }>()

    for (const participant of standings) {
      if (!participant.id) {
        continue
      }

      participantsById.set(participant.id, { name: participant.name, isoCode: participant.iso_code })
    }

    return participantsById
  }, [standings])

  const definedMatches = useMemo<MatchEntry[]>(() => matches.filter(matchEntry => matchEntry != null), [matches])

  const isPlayersOnly = settings?.showAddPlayer && !settings.showAddTeam
  const translationKey: ParticipantTypes = isPlayersOnly ? ParticipantTypes.PLAYER : ParticipantTypes.TEAM

  const setRowRef = useAutoScroll(definedMatches)

  if (!tournamentId) {
    return
  }

  return (
    <>
      <h3>{translations.headings.results}</h3>
      <div className="scrollable-x">
        <table>
          <thead>
            <tr>
              <th>{translations.headers.number}</th>
              <th>{translations.headers.home[translationKey]}</th>
              <th>{translations.headers.score}</th>
              <th>{translations.headers.away[translationKey]}</th>
            </tr>
          </thead>
          <tbody>
            {!definedMatches.length && (
              <tr>
                <td className="text-center" colSpan={4}>
                  No results found
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
                <tr key={match.id} ref={setRowRef(match.id)}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="wrapper">
                      {settings?.showFlags && home.isoCode && (
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
                      {settings?.showFlags && away.isoCode && (
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
