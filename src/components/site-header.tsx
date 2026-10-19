export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="CineScope 3D home">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="brand-name">
          CineScope<span className="brand-dimension">3D</span>
        </span>
      </a>

      <nav className="main-nav" aria-label="Main navigation">
        <a className="nav-link active" href="#discover" aria-current="page">
          Discover
        </a>
        <a className="nav-link" href="#now-showing">
          Your next watch
        </a>
        <a className="nav-link" href="#about">
          The experience
        </a>
      </nav>

      <a className="header-cta" href="#now-showing">
        <span>Explore films</span>
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M8 3l5 5-5 5" />
        </svg>
      </a>
    </header>
  );
}
