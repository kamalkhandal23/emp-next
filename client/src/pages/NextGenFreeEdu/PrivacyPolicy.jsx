import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4" style={{color: 'black'}}>Privacy Policy</h1>
      <p className="mb-3 ">
        This Privacy Policy explains how we collect, use, and protect your information when you use our website or services.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2" style={{color: 'black'}}>1. Information We Collect</h2>
      <p>
        We may collect personal details like name, email, or contact information when you register or interact with our site.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2" style={{color: 'black'}}>2. How We Use Information</h2>
      <p>
        Your information is used to provide services, improve user experience, and communicate updates.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2" style={{color: 'black'}}>3. Data Protection</h2>
      <p>
        We implement strong security measures to protect your personal data from unauthorized access.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2" style={{color: 'black'}}>4. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at <strong>careers@lifeboxnextgen.co.site</strong>.
      </p>

      <p className="text-sm mt-8 text-gray-600 text-black">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
