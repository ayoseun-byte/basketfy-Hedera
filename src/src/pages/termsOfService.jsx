import React from "react";



const TermsOfService = ({ isDarkmode }) => {
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
            Basketfy Terms of Service
          </h1>
          <p
            className={`mt-4 text-sm ${
              isDarkmode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Last updated: October 28, 2025
          </p>
        </div>

        {/* Card Container */}
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
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing or using Basketfy, you agree to be bound by these
                Terms of Service. If you do not agree, you must not access or
                use the platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                2. Description of Service
              </h2>
              <p className="leading-relaxed">
                Basketfy is a decentralized investment protocol that enables
                users to create and invest in tokenized baskets of assets
                (“Baskets”) on the Solana blockchain. Each Basket represents a
                curated set of tokens and may be accompanied by a Basket
                Identity NFT.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                3. User Responsibilities
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for securing your wallet and private keys.</li>
                <li>
                  You agree not to use Basketfy for illegal, fraudulent, or
                  malicious activities.
                </li>
                <li>
                  You acknowledge that all transactions are final and
                  irreversible due to the immutable nature of blockchain.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                4. Fees and Transactions
              </h2>
              <p className="leading-relaxed">
                Basketfy may charge fees for basket creation, minting, or
                portfolio rebalancing. All fees are transparently displayed
                prior to confirmation and are paid on-chain in SOL, USDC, or
                other supported assets.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                5. Risk Disclosure
              </h2>
              <p className="leading-relaxed">
                Investing in crypto assets involves risk, including potential
                loss of principal. Basketfy does not provide financial advice,
                portfolio management, or guaranteed returns. You are solely
                responsible for your investment decisions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                6. Intellectual Property
              </h2>
              <p className="leading-relaxed">
                The Basketfy brand, name, and visual assets are owned by the
                Basketfy team. You may not reproduce, modify, or distribute them
                without written consent.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                7. Limitation of Liability
              </h2>
              <p className="leading-relaxed">
                Basketfy is provided “as is” without warranties of any kind. We
                are not liable for losses arising from blockchain failures,
                third-party integrations, or user mismanagement of wallets or
                private keys.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                8. Modifications
              </h2>
              <p className="leading-relaxed">
                We may update these Terms periodically. Continued use of the
                platform after updates constitutes acceptance of the new Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-2">
                9. Contact
              </h2>
              <p className="leading-relaxed">
                For questions regarding these Terms, contact{" "}
                <a
                  href="mailto:legal@basketfy.xyz"
                  className="text-purple-400 hover:text-pink-400 transition-colors"
                >
                  legal@basketfy.xyz
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

export default TermsOfService;
