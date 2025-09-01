import { Link } from "react-router"

export const HeaderComponent = () => {
  return (
    <header className="header">
      <nav className="nav container">
        <Link to="/" className="nav__link">
          Home
        </Link>
        <Link to="/premier-league" className="nav__link">
          Premier League
        </Link>
        <Link to="/eurobasket" className="nav__link">
          EuroBasket
        </Link>
        <Link to="/wimbledon" className="nav__link">
          Wimbledon
        </Link>
      </nav>
    </header>
  )
}
