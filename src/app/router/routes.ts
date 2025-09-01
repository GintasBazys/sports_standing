import { createBrowserRouter, replace } from "react-router"
import App from "@/app/components/App"
import StandingsComponent from "@/app/components/StandingsComponent"

const TOURNAMENT_ROUTES = [
  { path: "premier-league", title: "Premier League", tournament: "premier-league", layout: "clean" },
  { path: "eurobasket", title: "EuroBasket", tournament: "eurobasket", layout: "energetic" },
  { path: "wimbledon", title: "Wimbledon", tournament: "wimbledon", layout: "table" }
]

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      ...TOURNAMENT_ROUTES.map(route => ({
        path: route.path,
        Component: StandingsComponent,
        handle: { title: route.title, tournament: route.tournament, layout: route.layout }
      }))
    ]
  },
  { path: "*", loader: () => replace("/") }
])
