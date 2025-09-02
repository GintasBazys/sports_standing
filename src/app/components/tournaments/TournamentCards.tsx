import ParticipantsCreator from "@/features/participant-creator/ParticipantsCreator.tsx"
import { TOURNAMENTS } from "@/app/constants/tournaments.ts"
import ScoreCreator from "@/features/score-creator/ScoreCreator.tsx"
import StandingsTable from "@/app/components/tables/StandingsTable.tsx"
import MatchResultsTable from "@/app/components/tables/MatchResultsTable.tsx"
import { getLayoutSettings } from "@/app/utils/layout.ts"

export default function TournamentCards() {
  return (
    <>
      {TOURNAMENTS.map(({ title, layout, tournament }) => {
        const settings = getLayoutSettings(layout)

        return (
          <section key={title} className={`layout-${layout} section`}>
            <div className="card">
              <div className="card__title">
                <h2>{title}</h2>
              </div>
              <div className="card__body">
                {settings && <ParticipantsCreator tournament={tournament} settings={settings} />}
                <ScoreCreator tournament={tournament} />
                <MatchResultsTable tournament={tournament} />
                {settings?.showStandings && <StandingsTable tournament={tournament} settings={settings} />}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
