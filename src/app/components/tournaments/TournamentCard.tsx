import type { TournamentItem } from "@/app/types/tournament"
import { useState } from "react"
import PrimaryButton from "@/app/components/buttons/PrimaryButton"
import SecondaryButton from "@/app/components/buttons/SecondaryButton"
import ParticipantsCreator from "@/features/participant-creator/ParticipantsCreator"
import MatchesCreator from "@/features/match-creator/MatchesCreator.tsx"
import MatchResultsTable from "@/app/components/tables/MatchResultsTable"
import StandingsTable from "@/app/components/tables/StandingsTable"
import { ParticipantTypes } from "@/app/enumerators/participant"
import translations from "@/app/translations/en.json"
import { DEFAULT_LAYOUT_SETTINGS, LAYOUT_SETTINGS } from "@/app/constants/tournaments.ts"

export default function TournamentCard({ title, layout, tournamentId }: TournamentItem) {
  const settings = LAYOUT_SETTINGS.find(l => l.name === layout) ?? DEFAULT_LAYOUT_SETTINGS
  const commonProps = { tournamentId, settings }

  const [showParticipantCreator, setShowParticipantCreator] = useState<boolean>(!settings.showButtons)
  const [showScoreCreator, setShowScoreCreator] = useState<boolean>(!settings.showButtons)

  const isPlayersOnly = settings.showAddPlayer
  const translationKey: ParticipantTypes = isPlayersOnly ? ParticipantTypes.PLAYER : ParticipantTypes.TEAM

  const shouldShowCreatorsAlways = !settings.showButtons

  return (
    <section className={`layout-${layout} section`}>
      <div className="card">
        <div className="card__title">
          <h2>{title}</h2>
        </div>
        {settings.showButtons && (
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
          <>
            {(shouldShowCreatorsAlways || showParticipantCreator) && <ParticipantsCreator {...commonProps} />}
            {(shouldShowCreatorsAlways || showScoreCreator) && <MatchesCreator {...commonProps} />}
            {settings.showMatchResults && <MatchResultsTable {...commonProps} />}
            {settings.showStandings && <StandingsTable {...commonProps} />}
          </>
        </div>
      </div>
    </section>
  )
}
