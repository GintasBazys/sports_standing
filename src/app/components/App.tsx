import TournamentCards from "@/app/components/tournaments/TournamentCards"

export default function App() {
  return (
    <main className="container">
      <h1>Sports Standing App</h1>
      <div className="grid">
        <TournamentCards />
      </div>
    </main>
  )
}
