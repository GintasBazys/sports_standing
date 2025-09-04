import type { TournamentItem } from "@/app/types/tournament"
import { getLayoutSettings } from "@/app/utils/layout"
import { useState } from "react"
import PrimaryButton from "@/app/components/buttons/PrimaryButton"
import SecondaryButton from "@/app/components/buttons/SecondaryButton"
import ParticipantsCreator from "@/features/participant-creator/ParticipantsCreator"
import ScoreCreator from "@/features/score-creator/ScoreCreator"
import MatchResultsTable from "@/app/components/tables/MatchResultsTable"
import StandingsTable from "@/app/components/tables/StandingsTable"
import { ParticipantTypes } from "@/app/enumerators/participant"
import translations from "@/app/translations/en.json"

export default function TournamentCard({ title, layout, tournamentId }: TournamentItem) {
  const settings = getLayoutSettings(layout)
  const commonProps = { tournamentId, settings }

  const [showParticipantCreator, setShowParticipantCreator] = useState<boolean>(!settings?.showButtons)
  const [showScoreCreator, setShowScoreCreator] = useState<boolean>(!settings?.showButtons)

  const isPlayersOnly = settings?.showAddPlayer && !settings.showAddTeam
  const translationKey: ParticipantTypes = isPlayersOnly ? ParticipantTypes.PLAYER : ParticipantTypes.TEAM

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
                setShowParticipantCreator(value => !value)
              }}
            >
              {showParticipantCreator
                ? translations.participants.hideBtn[translationKey]
                : translations.participants.addBtn[translationKey]}
            </PrimaryButton>
            <SecondaryButton
              onClick={() => {
                setShowScoreCreator(value => !value)
              }}
            >
              {showScoreCreator ? translations.scores.hideBtn : translations.scores.addBtn}
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
