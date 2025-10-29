import React from "react";



const PrivacyPolicy = ({ isDarkmode }) => {
  return (
    <div
      className={`min-h-screen px-6 py-16 transition-colors duration-500 ${
        isDarkmode
          ? "bg-gradient-to-br from-gray-900 via-purple-900 to-black text-gray-100"
          : "bg-gradient-to-br from-white via-purple-50 to-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Basketfy Privacy Policy
          </h1>
          <p
            className={`mt-4 text-sm ${
              isDarkmode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Last updated: October 28, 2025
          </p>
        </div>

        {/* Card */}
        <div
          className={`rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md border ${
            isDarkmode
              ? "bg-gray-800/40 border-gray-700"
              : "bg-white/60 border-gray-200"
          }`}
        >
          <section className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                Basketfy (“we,” “us,” or “our”) values your privacy. This
                Privacy Policy explains how we collect, use, and protect your
                personal data when you interact with our platform, mobile app,
                and decentralized investment tools.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                2. Information We Collect
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Wallet Information:</strong> Your connected Solana
                  wallet address and related transaction data.
                </li>
                <li>
                  <strong>Account Data:</strong> Optional email, username, or
                  social handles you provide for updates or verification.
                </li>
                <li>
                  <strong>Usage Data:</strong> Analytics on site visits, basket
                  interactions, and device type (anonymized).
                </li>
                <li>
                  <strong>Offchain Data:</strong> When applicable, data sent via
                  forms, API integrations, or support channels.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                3. How We Use Your Information
              </h2>
              <p className="leading-relaxed">
                We use collected data to deliver our services, personalize your
                experience, and ensure compliance with blockchain standards.
                Specifically, we use data to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Process basket creation and investment transactions.</li>
                <li>Monitor performance and user engagement.</li>
                <li>
                  Communicate updates, releases, or platform-related notices.
                </li>
                <li>Maintain security and prevent fraud or abuse.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                4. Data Protection
              </h2>
              <p className="leading-relaxed">
                We implement encryption, anonymization, and secure access
                policies to safeguard all user data. Wallet private keys are
                never stored, accessed, or transmitted by Basketfy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                5. Data Sharing and Third Parties
              </h2>
              <p className="leading-relaxed">
                Basketfy does not sell or rent your personal data. We may share
                anonymized usage metrics with analytics or blockchain partners
                strictly to enhance product performance and security.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                6. User Control and Rights
              </h2>
              <p className="leading-relaxed">
                You have the right to access, correct, or request deletion of
                your data. You may also disconnect your wallet at any time to
                stop further data collection.
              </p>
              <p className="mt-3">
                To exercise these rights, contact{" "}
                <a
                  href="mailto:privacy@basketfy.xyz"
                  className="text-purple-400 hover:text-pink-400 transition-colors"
                >
                  privacy@basketfy.xyz
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                7. Cookies and Analytics
              </h2>
              <p className="leading-relaxed">
                Basketfy uses minimal cookies and privacy-friendly analytics to
                monitor performance. No personally identifiable information is
                tracked across sessions or shared externally.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                8. Data Retention
              </h2>
              <p className="leading-relaxed">
                We retain anonymized interaction data only as long as necessary
                for operational and compliance purposes. You can request full
                deletion at any time.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                9. Updates to this Policy
              </h2>
              <p className="leading-relaxed">
                Basketfy may revise this Privacy Policy periodically. The
                updated date will always reflect the latest revision, and
                continued use of our platform constitutes acceptance.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                10. Contact
              </h2>
              <p className="leading-relaxed">
                For privacy concerns, data access requests, or additional
                details, reach us at{" "}
                <a
                  href="mailto:privacy@basketfy.xyz"
                  className="text-purple-400 hover:text-pink-400 transition-colors"
                >
                  privacy@basketfy.xyz
                </a>
                .
              </p>
            </div>
          </section>

          {/* Divider */}
          <div
            className={`mt-16 h-px ${
              isDarkmode ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p
              className={`text-sm ${
                isDarkmode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              © {new Date().getFullYear()} Basketfy. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
