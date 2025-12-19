import React from "react";

const RG = () => {
  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0 rounded-4 p-4">
        <h2 className="text-center fw-bold text-uppercase mb-4">
          Responsible Gaming
        </h2>
        <p className="text-muted text-center mb-5">
          At <strong>DiamondExchange11.com</strong>, we encourage all users to
          enjoy betting as a form of entertainment — not as a way to make money.
          Responsible gaming is at the heart of what we stand for.
        </p>

        <section className="mb-4">
          <h5 className="fw-semibold">1. Our Commitment</h5>
          <p>
            We are fully committed to promoting a safe, fair, and responsible
            gaming environment. Betting involves financial risk, and players
            should always play within their limits and means.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">2. Know the Risks</h5>
          <p>
            Gambling can be addictive if not controlled. Always remember:
            <ul>
              <li>Bet only what you can afford to lose.</li>
              <li>Do not chase your losses.</li>
              <li>Set time and money limits before you start.</li>
              <li>Take regular breaks while playing.</li>
              <li>Never gamble when upset, tired, or under the influence.</li>
            </ul>
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">3. Play for Fun</h5>
          <p>
            Online betting and casino games are designed for fun and
            entertainment. They should never be seen as a guaranteed source of
            income. Treat every game as a form of leisure — not an investment.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">4. Age Restriction</h5>
          <p>
            Only users aged <strong>18 years or older</strong> (or the legal
            gambling age in your jurisdiction) are allowed to register and place
            bets. Any account found violating this rule may be suspended
            immediately.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">5. Self-Control Tools</h5>
          <p>
            We provide options for users to:
            <ul>
              <li>Set betting and deposit limits.</li>
              <li>Temporarily or permanently close their account.</li>
              <li>Seek help for gambling-related concerns.</li>
            </ul>
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">6. Getting Help</h5>
          <p>
            If you ever feel your gaming habits are becoming problematic, we
            encourage you to seek help. The following organizations offer
            confidential support:
          </p>
          <ul>
            <li>
              <a
                href="https://www.gamcare.org.uk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                GamCare (www.gamcare.org.uk)
              </a>
            </li>
            <li>
              <a
                href="https://www.begambleaware.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                BeGambleAware (www.begambleaware.org)
              </a>
            </li>
            <li>
              <a
                href="https://www.gamblersanonymous.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Gamblers Anonymous (www.gamblersanonymous.org)
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">7. Our Message</h5>
          <p>
            <strong>DiamondExchange11</strong> stands for safe, transparent, and
            enjoyable gaming. We remind all our users — play smart, play safe,
            and always know when to stop.
          </p>
        </section>

        <p className="text-center mt-5 small text-secondary">
          © {new Date().getFullYear()} DiamondExchange11.com — Play Responsibly.
        </p>
      </div>
    </div>
  );
};

export default RG;
