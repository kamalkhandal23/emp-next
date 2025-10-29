export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>© {new Date().getFullYear()} Lifebox NextGen Pvt. Ltd. All rights reserved.</div>
        <div style={{ marginTop: '1rem' }}>
          <a href="mailto:careers@lifeboxnextgen.co.site" className="footer-link">
            careers@lifeboxnextgen.co.site
          </a>
        </div>
        <div className="footer-links">
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-link">
            LinkedIn
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link">
            GitHub
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer" className="footer-link">
            X (Twitter)
          </a>
          <a href="/nextgen/privacy-policy" className="footer-link">
            Privacy Policy
          </a>
          <a href="/terms" className="footer-link">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  )
}

