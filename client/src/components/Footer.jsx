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
          <a href="https://www.linkedin.com/company/lifebox-global-pvt-ltd/" target="_blank" rel="noreferrer" className="footer-link">
            LinkedIn
          </a>
          <a href="https://www.instagram.com/lifeboxnexgen_media?igsh=ZXFnanNrYzVnejA4" target="_blank" rel="noreferrer" className="footer-link">
            Instagram
          </a>
          <a href="https://youtube.com/@techabouttodie?si=I_9I2wdxl8ZvMJ7l" target="_blank" rel="noreferrer" className="footer-link">
            YouTube
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

