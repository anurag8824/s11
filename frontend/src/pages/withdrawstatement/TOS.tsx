import React from "react";

const TOS = () => {
  return (
    <div className="container my-5">
      <div className="card shadow-lg p-4 border-0 rounded-4">
        <h2 className="text-center mb-4 fw-bold text-uppercase">
          Terms & Conditions
        </h2>
        <p className="text-muted text-center mb-5">
          Welcome to <strong>SangamExch.com</strong> — your trusted
          platform for cricket, casino, and sports betting entertainment.
        </p>

        <section className="mb-4">
          <h5 className="fw-semibold">1. Acceptance of Terms</h5>
          <p>
            By accessing and using <strong>SangamExch.com</strong>, you
            agree to comply with and be bound by these Terms & Conditions. If
            you do not agree, please do not use the website or its services.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">2. Eligibility</h5>
          <p>
            You must be at least <strong>18 years of age</strong> or the legal
            gambling age in your jurisdiction to use our services. We reserve
            the right to verify your age and identity at any time.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">3. Responsible Gaming</h5>
          <p>
            Betting should be fun and done responsibly. We encourage users to
            set limits and avoid chasing losses. If you feel you may have a
            gambling problem, please seek help from professional organizations.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">4. Account & Security</h5>
          <p>
            You are responsible for maintaining the confidentiality of your
            account and password. Any activity under your account will be deemed
            to be conducted by you.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">5. Betting Rules</h5>
          <p>
            All bets placed on our platform are subject to the rules specific to
            each sport or casino game. Once a bet is confirmed, it cannot be
            canceled or modified. We reserve the right to void bets in case of
            suspicious or fraudulent activity.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">6. Payments & Withdrawals</h5>
          <p>
            Deposits and withdrawals must be made using your own verified
            account details. All transactions are processed in accordance with
            applicable financial and anti-money-laundering regulations.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">7. Fair Play Policy</h5>
          <p>
            <strong>SangamExch</strong> reserves the right to suspend or
            terminate any account found engaging in unfair, illegal, or
            manipulative behavior on the platform.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">8. Limitation of Liability</h5>
          <p>
            We do not guarantee that our services will be uninterrupted or
            error-free. <strong>SangamExch.com</strong> is not liable for
            any financial losses or damages arising from the use of our
            platform.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">9. Modifications</h5>
          <p>
            We may update or modify these Terms at any time without prior
            notice. Continued use of the website indicates your acceptance of
            the latest version.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-semibold">10. Contact Us</h5>
          <p>
            For any questions or concerns regarding these Terms & Conditions,
            please contact our support team at{" "}
            <a href="mailto:support@SangamExch.com">
              support@SangamExch.com
            </a>
            .
          </p>
        </section>

        <p className="text-center mt-5 small text-secondary">
          © {new Date().getFullYear()} SangamExch.com — All Rights
          Reserved.
        </p>
      </div>
    </div>
  );
};

export default TOS;
