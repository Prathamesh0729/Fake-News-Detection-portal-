import { useEffect, useState } from "react";
import "./App.css";
import "./SourceCard.css";
import axios from "axios";
import {
  ArrowUpRight,
  Check,
  Clock3,
  ExternalLink,
  Flag,
  History,
  Link2,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

const samples = [
  {
    title: "CJP protested at Jantar Mantar over the NEET paper leak",
    tag: "REAL EVIDENCE TEST",
    text: "Check whether stored Jantar Mantar reporting supports this claim.",
  },
  {
    title: "CJP's October Jantar Mantar protest was about the NEET paper leak",
    tag: "DATE CHECK TEST",
    text: "Check whether the October event should be separated from the earlier NEET protests.",
  },
];

const Home = () => {
  const [headline, setHeadline] = useState("");
  const [article, setArticle] = useState("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState("quick");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API}/history`);
      setHistory(res.data);
    } catch {
      // History is optional.
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/analyze`, {
        headline,
        article,
        url,
        mode,
      });

      setResult(res.data);
      loadHistory();
    } catch (e) {
      setError(
        e.response?.data?.detail ||
          "We could not review this claim. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillSample = (sample) => {
    setHeadline(sample.title);
    setArticle(sample.text);
    setResult(null);

    window.scrollTo({
      top: 300,
      behavior: "smooth",
    });
  };

  const visibleChecks =
    result && Array.isArray(result.checks)
      ? result.checks
      : [];

  const evidence =
    result && Array.isArray(result.evidence)
      ? result.evidence
      : [];

  return (
    <div className="site-shell">
      <div className="tricolor-rule" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" data-testid="brand-mark">
            SP
          </div>

          <div>
            <strong data-testid="brand-name">
              Satya<span>Parkhar</span>
            </strong>

            <small data-testid="brand-subtitle">
              Jantar Mantar news verification desk
            </small>
          </div>
        </div>

        <nav className="nav-links">
          <a
            href="#detector"
            data-testid="nav-detector-link"
          >
            Detector
          </a>

          <a
            href="#how-it-works"
            data-testid="nav-how-link"
          >
            How it works
          </a>

          <button
            onClick={() => setShowHistory(true)}
            data-testid="open-history-button"
          >
            <History size={15} />

            History <span>{history.length}</span>
          </button>
        </nav>

        <div
          className="trust-pill"
          data-testid="trust-pill"
        >
          <span />
          Evidence first
        </div>
      </header>

      <main>
        <section
          className="hero"
          id="detector"
        >
          <div className="hero-copy">
            <div
              className="eyebrow"
              data-testid="hero-eyebrow"
            >
              <span>01</span> VERIFY BEFORE YOU AMPLIFY
            </div>

            <h1 data-testid="hero-heading">
              Make the claim
              <br />
              <em>earn</em> your trust.
            </h1>

            <p data-testid="hero-description">
              Check news and claims specifically against
              evidence associated with Jantar Mantar, New
              Delhi.
            </p>

            <div className="hero-notes">
              <span>
                <ShieldCheck size={16} />
                Source-based checks
              </span>

              <span>
                <Flag size={16} />
                Jantar Mantar scope
              </span>
            </div>
          </div>

          <div className="hero-art">
            <div className="art-frame">
              <img
                src="https://images.unsplash.com/photo-1632999875725-abd36aa34059?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Citizen holding a sign at a public demonstration"
              />

              <div className="art-caption">
                <span>FIELD NOTE / 07</span>

                <strong>
                  Context is
                  <br />
                  evidence too.
                </strong>
              </div>
            </div>

            <div className="chakra">✦</div>
          </div>
        </section>

        <section
          className="detector-area"
          aria-label="News detector"
        >
          <div className="section-kicker">
            <span>02</span>

            <div>
              <strong>THE CLAIM DESK</strong>

              <p>
                Paste the story. We’ll compare it with stored
                evidence.
              </p>
            </div>
          </div>

          <div className="detector-grid">
            <form
              className="input-panel"
              onSubmit={submit}
              data-testid="analysis-form"
            >
              <div className="panel-top">
                <span className="live-dot" />

                <span data-testid="analysis-status">
                  Ready for a claim
                </span>

                <div className="mode-switch">
                  <button
                    type="button"
                    className={
                      mode === "quick" ? "active" : ""
                    }
                    onClick={() => setMode("quick")}
                    data-testid="quick-mode-button"
                  >
                    <Search size={14} />
                    Quick scan
                  </button>

                  <button
                    type="button"
                    className={
                      mode === "deep" ? "active" : ""
                    }
                    onClick={() => setMode("deep")}
                    data-testid="deep-mode-button"
                  >
                    <Sparkles size={14} />
                    Deep scan
                  </button>
                </div>
              </div>

              <label>
                HEADLINE OR CLAIM

                <input
                  value={headline}
                  onChange={(e) =>
                    setHeadline(e.target.value)
                  }
                  placeholder="What is being claimed?"
                  data-testid="headline-input"
                />
              </label>

              <label>
                ARTICLE TEXT <span>OPTIONAL</span>

                <textarea
                  value={article}
                  onChange={(e) =>
                    setArticle(e.target.value)
                  }
                  placeholder="Paste the article, post, or message here…"
                  rows="6"
                  data-testid="article-input"
                />
              </label>

              <label className="url-field">
                <Link2 size={16} />

                <input
                  value={url}
                  onChange={(e) =>
                    setUrl(e.target.value)
                  }
                  placeholder="Add source URL (optional)"
                  data-testid="source-url-input"
                />
              </label>

              {error && (
                <div
                  className="error-note"
                  role="alert"
                  data-testid="analysis-error"
                >
                  <X size={16} />
                  {error}
                </div>
              )}

              <button
                className="submit-button"
                disabled={loading}
                data-testid="analyze-submit-button"
              >
                {loading ? (
                  <>
                    <Loader2
                      className="spin"
                      size={18}
                    />
                    Checking evidence…
                  </>
                ) : (
                  <>
                    Run the check
                    <ArrowUpRight size={18} />
                  </>
                )}
              </button>

              <p className="fine-print">
                Results are based on the current Jantar
                Mantar evidence database. They are not a
                substitute for independent editorial
                verification.
              </p>
            </form>

            <div
              className="result-panel"
              data-testid="result-panel"
            >
              {result ? (
                <>
                  <div className="result-head">
                    <div>
                      <span className="result-label">
                        EVIDENCE REVIEW COMPLETE
                      </span>

                      <h2 data-testid="result-verdict">
                        {result.verdict}
                      </h2>
                    </div>

                    <div
                      className={`score-ring ${
                        result.confidence > 70
                          ? "warm"
                          : ""
                      }`}
                    >
                      <strong data-testid="confidence-score">
                        {result.confidence}%
                      </strong>

                      <span>evidence score</span>
                    </div>
                  </div>

                  <p
                    className="result-summary"
                    data-testid="result-summary"
                  >
                    {result.summary}
                  </p>

                  {result.location_scope && (
                    <div className="location-note">
                      <strong>Location scope</strong>

                      <span>
                        {result.location_scope}
                      </span>
                    </div>
                  )}

                  <div className="checks">
                    {visibleChecks.map(
                      (check, index) => (
                        <div
                          className="check-row"
                          key={`${
                            check.label || "check"
                          }-${index}`}
                          data-testid={`evidence-check-${index}`}
                        >
                          <span
                            className={
                              check.status === "pass"
                                ? "check-icon pass"
                                : "check-icon review"
                            }
                          >
                            {check.status === "pass" ? (
                              <Check size={14} />
                            ) : (
                              <Clock3 size={14} />
                            )}
                          </span>

                          <div>
                            <strong>
                              {check.label ||
                                "Evidence signal"}
                            </strong>

                            <p>
                              {check.detail ||
                                "Review this signal manually."}
                            </p>
                          </div>

                          <span className="check-state">
                            {check.status === "pass"
                              ? "CLEAR"
                              : "REVIEW"}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {evidence.length > 0 && (
                    <div className="evidence-list">
                      <div className="evidence-list-heading">
                        <span className="result-label">
                          MATCHED NEWS
                        </span>

                        <strong>
                          {evidence.length} source
                          {evidence.length === 1
                            ? ""
                            : "s"} found
                        </strong>
                      </div>

                      {evidence.map(
                        (item, index) => (
                          <article
                            className="evidence-card"
                            key={`${item.url}-${index}`}
                          >
                            <div className="evidence-card-top">
                              <span>
                                {item.publisher}
                              </span>

                              <span>
                                Event: {item.event_date}
                              </span>
                            </div>

                            <strong>
                              {item.title}
                            </strong>

                            <p>
                              {item.summary}
                            </p>

                            <div className="evidence-card-bottom">
                              <small>
                                Published:{" "}
                                {item.published_date}
                              </small>

                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Read source
                                <ExternalLink
                                  size={13}
                                />
                              </a>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  )}

                  <div className="result-footer">
                    <span>
                      Mode:{" "}
                      {result.mode === "deep"
                        ? "evidence deep scan"
                        : "Jantar Mantar evidence scan"}
                    </span>

                    <button
                      onClick={() => {
                        setResult(null);
                        setHeadline("");
                        setArticle("");
                        setUrl("");
                      }}
                      data-testid="reset-analysis-button"
                    >
                      Check another
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-result">
                  <div className="empty-symbol">
                    <ShieldCheck size={28} />
                  </div>

                  <span className="result-label">
                    YOUR REVIEW WILL APPEAR HERE
                  </span>

                  <h2>
                    Evidence over
                    <br />
                    <em>assumption.</em>
                  </h2>

                  <p>
                    We’ll compare the claim against stored
                    news associated with Jantar Mantar, New
                    Delhi.
                  </p>

                  <div className="empty-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          className="samples"
          id="how-it-works"
        >
          <div className="section-kicker">
            <span>03</span>

            <div>
              <strong>CLAIMS IN THE WILD</strong>

              <p>
                Test the Jantar Mantar evidence engine
              </p>
            </div>
          </div>

          <div className="sample-grid">
            {samples.map((sample, index) => (
              <button
                className="sample-card"
                onClick={() => fillSample(sample)}
                key={sample.title}
                data-testid={`sample-claim-${index}`}
              >
                <div>
                  <span>{sample.tag}</span>

                  <h3>{sample.title}</h3>

                  <p>{sample.text}</p>
                </div>

                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
        </section>

        <section className="method-strip">
          <div>
            <span className="section-number">
              04
            </span>

            <h2>
              Trust is a process,
              <br />
              <em>not a feeling.</em>
            </h2>
          </div>

          <div className="method-copy">
            <p>
              SatyaParkhar compares a claim with
              location-specific evidence, dates, events,
              and source records before presenting the
              result.
            </p>

            <div className="method-items">
              <span>
                <b>01</b> Identify the location
              </span>

              <span>
                <b>02</b> Match the event
              </span>

              <span>
                <b>03</b> Examine the sources
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span>
          SatyaParkhar / Jantar Mantar evidence desk
        </span>

        <span>One claim at a time.</span>
      </footer>

      {showHistory && (
        <div
          className="drawer-backdrop"
          onClick={() => setShowHistory(false)}
        >
          <aside
            className="history-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-head">
              <div>
                <span className="result-label">
                  YOUR ACTIVITY
                </span>

                <h2>Recent reviews</h2>
              </div>

              <button
                onClick={() => setShowHistory(false)}
                aria-label="Close history"
                data-testid="close-history-button"
              >
                <X />
              </button>
            </div>

            {history.length ? (
              history.map((item, i) => (
                <button
                  className="history-item"
                  key={item.id || i}
                  onClick={() => {
                    setResult(item);
                    setShowHistory(false);
                  }}
                  data-testid={`history-item-${i}`}
                >
                  <span>{item.verdict}</span>

                  <strong>
                    {item.headline}
                  </strong>

                  <small>
                    {item.confidence}% evidence score ·{" "}
                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}
                  </small>
                </button>
              ))
            ) : (
              <p
                className="history-empty"
                data-testid="history-empty"
              >
                Your completed reviews will appear here.
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Home />
    </div>
  );
}

export default App;