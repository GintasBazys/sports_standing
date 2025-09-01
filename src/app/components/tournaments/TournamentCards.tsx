import TeamPlayerCreator from "@/features/team-creator/TeamPlayerCreator.tsx"
import { TOURNAMENTS } from "@/app/constants/tournaments.ts"
import ScoreCreator from "@/features/score-creator/ScoreCreator.tsx"
import ScoringTable from "@/app/components/tables/ScoringTable.tsx"
import StandingsTable from "@/app/components/tables/StandingsTable.tsx"

export default function TournamentCards() {
  return (
    <>
      {TOURNAMENTS.map(tournament => (
        <section key={tournament.title} className={`layout-${tournament.layout} section`}>
          <div className="container">
            <div className="card">
              <h2>{tournament.title}</h2>
              <TeamPlayerCreator />
              <ScoreCreator />
              <ScoringTable />
              <StandingsTable />
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
