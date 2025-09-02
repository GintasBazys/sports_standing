export const TOURNAMENTS = [
  { title: "Premier League", tournament: "premier-league", layout: "clean" },
  { title: "EuroBasket", tournament: "eurobasket", layout: "energetic" },
  { title: "Wimbledon", tournament: "wimbledon", layout: "table" }
]

export const LAYOUT_SETTINGS = [
  {
    name: "clean",
    showAddTeam: true,
    showAddPlayer: false,
    showStandings: true,
    showMatchResults: true,
    showButtons: false,
    showIcons: false
  },
  {
    name: "energetic",
    showAddTeam: true,
    showAddPlayer: true,
    showStandings: true,
    showMatchResults: true,
    showButtons: true,
    showIcons: true
  },
  {
    name: "table",
    showAddTeam: false,
    showAddPlayer: true,
    showStandings: true,
    showMatchResults: false,
    showButtons: true,
    showIcons: false
  }
]
