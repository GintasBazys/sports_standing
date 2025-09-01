import { useMatches, type UIMatch } from "react-router"

export default function StandingsComponent() {
  type Handle = {
    title?: string
    layout?: string
  }

  const useTypedMatches = <TData,>() => useMatches() as UIMatch<TData, Handle>[]

  const matches = useTypedMatches()
  const { handle } = matches[matches.length - 1]
  return (
    <>
      <section className="section">
        <div className="container">{handle.layout}</div>
      </section>
    </>
  )
}
