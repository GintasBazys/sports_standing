import { useEffect, useMemo, useState } from "react"
import { TOURNAMENTS } from "@/app/constants/tournaments"
import TournamentCard from "@/app/components/tournaments/TournamentCard"
import { Layout } from "@/app/enumerators/layout"
import OutlineButton from "@/app/components/buttons/OutlineButton.tsx"

export default function TournamentCards() {
  const [activeLayout, setActiveLayout] = useState<Layout>(() => TOURNAMENTS[0]?.layout ?? Layout.CLEAN)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)")

    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
      if (event.matches) {
        setActiveLayout(Layout.CLEAN)
      }
    }

    setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener("change", onChange)

    return () => {
      mediaQuery.removeEventListener("change", onChange)
    }
  }, [])

  const layoutButtons = useMemo(() => {
    const seenLayouts: Layout[] = []
    const buttons: { layout: Layout; label: string }[] = []

    for (const tournament of TOURNAMENTS) {
      if (!seenLayouts.includes(tournament.layout)) {
        seenLayouts.push(tournament.layout)
        buttons.push({ layout: tournament.layout, label: tournament.title })
      }
    }

    return buttons
  }, [])

  const visibleTournaments = isMobile
    ? TOURNAMENTS.filter(tournament => tournament.layout === activeLayout)
    : TOURNAMENTS

  return (
    <>
      {isMobile && (
        <div className="button-wrapper">
          {layoutButtons.map(({ layout, label }) => (
            <OutlineButton
              key={layout}
              className={layout === activeLayout ? "outline-active" : ""}
              onClick={() => {
                setActiveLayout(layout)
              }}
            >
              {label}
            </OutlineButton>
          ))}
        </div>
      )}

      {visibleTournaments.map(({ title, layout, id }) => (
        <TournamentCard key={`${layout}-${id}`} title={title} layout={layout} tournamentId={id} />
      ))}
    </>
  )
}
