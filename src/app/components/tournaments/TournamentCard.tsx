import type { TournamentItem } from "@/app/types/tournament.ts"
import { getLayoutSettings } from "@/app/utils/layout.ts"
import { useState } from "react"
import PrimaryButton from "@/app/components/buttons/PrimaryButton.tsx"
import SecondaryButton from "@/app/components/buttons/SecondaryButton.tsx"
import ParticipantsCreator from "@/features/participant-creator/ParticipantsCreator.tsx"
import ScoreCreator from "@/features/score-creator/ScoreCreator.tsx"
import MatchResultsTable from "@/app/components/tables/MatchResultsTable.tsx"
import StandingsTable from "@/app/components/tables/StandingsTable.tsx"

export default function TournamentCard({ title, layout, tournamentId }: TournamentItem) {
  const settings = getLayoutSettings(layout)
  const commonProps = { tournamentId, settings }

  const [showParticipantCreator, setShowParticipantCreator] = useState<boolean>(!settings?.showButtons)
  const [showScoreCreator, setShowScoreCreator] = useState<boolean>(!settings?.showButtons)

  const shouldShowCreatorsAlways = !settings?.showButtons

  return (
    <section className={`layout-${layout} section`}>
      <div className="card">
        <div className="card__title">
          <h2>{title}</h2>
        </div>

        {settings?.showButtons && (
          <div className="card__actions">
            <PrimaryButton
              onClick={() => {
                setShowParticipantCreator(v => !v)
              }}
            >
              {showParticipantCreator ? "Hide Team Creator" : "Add Team"}
            </PrimaryButton>
            <SecondaryButton
              onClick={() => {
                setShowScoreCreator(v => !v)
              }}
            >
              {showScoreCreator ? "Hide Score Creator" : "Add Score"}
            </SecondaryButton>
          </div>
        )}

        <div className="card__body">
          {settings && (
            <>
              {(shouldShowCreatorsAlways || showParticipantCreator) && <ParticipantsCreator {...commonProps} />}
              {(shouldShowCreatorsAlways || showScoreCreator) && <ScoreCreator {...commonProps} />}
              {settings.showMatchResults && <MatchResultsTable {...commonProps} />}
              {settings.showStandings && <StandingsTable {...commonProps} />}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
