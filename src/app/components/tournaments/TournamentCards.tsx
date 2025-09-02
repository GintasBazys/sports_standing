import ParticipantsCreator from "@/features/participant-creator/ParticipantsCreator.tsx"
import { TOURNAMENTS } from "@/app/constants/tournaments.ts"
import ScoreCreator from "@/features/score-creator/ScoreCreator.tsx"
import StandingsTable from "@/app/components/tables/StandingsTable.tsx"
import MatchResultsTable from "@/app/components/tables/MatchResultsTable.tsx"

export default function TournamentCards() {
  return (
    <>
      {TOURNAMENTS.map(({ title, layout, tournament }) => (
        <section key={title} className={`layout-${layout} section`}>
          <div className="card">
            <div className="card__title">
              <h2>{title}</h2>
            </div>
            <div className="card__body">
              <ParticipantsCreator tournament={tournament} />
              <ScoreCreator tournament={tournament} />
              <MatchResultsTable tournament={tournament} />
              <StandingsTable tournament={tournament} />
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
