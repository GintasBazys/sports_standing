import ParticipantsCreator from "@/features/participant-creator/ParticipantsCreator.tsx"
import { TOURNAMENTS } from "@/app/constants/tournaments.ts"
import ScoreCreator from "@/features/score-creator/ScoreCreator.tsx"
import StandingsTable from "@/app/components/tables/StandingsTable.tsx"
import MatchResultsTable from "@/app/components/tables/MatchResultsTable.tsx"
import { getLayoutSettings } from "@/app/utils/layout.ts"
import PrimaryButton from "@/app/components/buttons/PrimaryButton.tsx"
import SecondaryButton from "@/app/components/buttons/SecondaryButton.tsx"

export default function TournamentCards() {
  return (
    <>
      {TOURNAMENTS.map(({ title, layout, tournament }) => {
        const settings = getLayoutSettings(layout)
        const commonProps = { tournament, settings }

        return (
          <section key={title} className={`layout-${layout} section`}>
            <div className="card">
              <div className="card__title">
                <h2>{title}</h2>
              </div>
              {settings?.showButtons && (
                <div className="card__actions">
                  <PrimaryButton>Create Team</PrimaryButton>
                  <SecondaryButton>Add Score</SecondaryButton>
                </div>
              )}
              <div className="card__body">
                {settings && (
                  <>
                    <ParticipantsCreator {...commonProps} />
                    <ScoreCreator {...commonProps} />
                    {settings.showMatchResults && <MatchResultsTable {...commonProps} />}
                    {settings.showStandings && <StandingsTable {...commonProps} />}
                  </>
                )}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
