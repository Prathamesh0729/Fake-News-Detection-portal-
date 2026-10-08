import { useEffect, useState } from "react";
import "./App.css";
import "./SourceCard.css";
import axios from "axios";
import { ArrowUpRight, Check, ChevronDown, Clock3, ExternalLink, FileText, Flag, History, Link2, Loader2, Search, ShieldCheck, Sparkles, X } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const samples = [
  { title: "CJP protest forces Pradhan to resign at Jantar Mantar", tag: "FICTIONAL SAMPLE", text: "A post claims a large CJP gathering at Jantar Mantar forced the Pradhan to resign immediately. No named source or official statement is linked." },
  { title: "Police confirm protest route was approved", tag: "FICTIONAL SAMPLE", text: "A fictional bulletin says Delhi Police issued a route approval for the CJP march on 14 March, with the gathering planned near Jantar Mantar." },
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

  const loadHistory = async () => { try { const res = await axios.get(`${API}/history`); setHistory(res.data); } catch { /* empty history is okay */ } };
  useEffect(() => { loadHistory(); }, []);
  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try { const res = await axios.post(`${API}/analyze`, { headline, article, url, mode }); setResult(res.data); loadHistory(); }
    catch (e) { setError(e.response?.data?.detail || "We could not review this claim. Try again."); }
    finally { setLoading(false); }
  };
  const fillSample = (sample) => { setHeadline(sample.title); setArticle(sample.text); setResult(null); window.scrollTo({ top: 300, behavior: "smooth" }); };
  const visibleChecks = result && Array.isArray(result.checks) ? result.checks : [];
  return <div className="site-shell">
    <div className="tricolor-rule" aria-hidden="true"><i /><i /><i /></div>
    <header className="topbar">
      <div className="brand-lockup"><div className="brand-mark" data-testid="brand-mark">SP</div><div><strong data-testid="brand-name">Satya<span>Parkhar</span></strong><small data-testid="brand-subtitle">CJP &amp; public claim desk</small></div></div>
      <nav className="nav-links"><a href="#detector" data-testid="nav-detector-link">Detector</a><a href="#how-it-works" data-testid="nav-how-link">How it works</a><button onClick={() => setShowHistory(true)} data-testid="open-history-button"><History size={15} /> History <span>{history.length}</span></button></nav>
      <div className="trust-pill" data-testid="trust-pill"><span /> Evidence first</div>
    </header>

    <main>
      <section className="hero" id="detector"><div className="hero-copy"><div className="eyebrow" data-testid="hero-eyebrow"><span>01</span> VERIFY BEFORE YOU AMPLIFY</div><h1 data-testid="hero-heading">Make the claim<br /><em>earn</em> your trust.</h1><p data-testid="hero-description">A calm, transparent way to examine news about public movements, official decisions, and the stories travelling fastest.</p><div className="hero-notes"><span><ShieldCheck size={16} /> Human-readable checks</span><span><Flag size={16} /> Built for Indian context</span></div></div><div className="hero-art"><div className="art-frame"><img src="https://images.unsplash.com/photo-1632999875725-abd36aa34059?crop=entropy&cs=srgb&fm=jpg&q=85" alt="Citizen holding a sign at a public demonstration" /><div className="art-caption"><span>FIELD NOTE / 07</span><strong>Context is<br />evidence too.</strong></div></div><div className="chakra">✦</div></div></section>

      <section className="detector-area" aria-label="News detector"><div className="section-kicker"><span>02</span><div><strong>THE CLAIM DESK</strong><p>Paste the story. We’ll show what needs checking.</p></div></div><div className="detector-grid"><form className="input-panel" onSubmit={submit} data-testid="analysis-form"><div className="panel-top"><span className="live-dot" /> <span data-testid="analysis-status">Ready for a claim</span><div className="mode-switch"><button type="button" className={mode === "quick" ? "active" : ""} onClick={() => setMode("quick")} data-testid="quick-mode-button"><Search size={14} /> Quick scan</button><button type="button" className={mode === "deep" ? "active" : ""} onClick={() => setMode("deep")} data-testid="deep-mode-button"><Sparkles size={14} /> Deep scan</button></div></div><label>HEADLINE OR CLAIM<input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="What is being claimed?" data-testid="headline-input" /></label><label>ARTICLE TEXT <span>OPTIONAL</span><textarea value={article} onChange={e => setArticle(e.target.value)} placeholder="Paste the article, post, or message here…" rows="6" data-testid="article-input" /></label><label className="url-field"><Link2 size={16} /> <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Add source URL (optional)" data-testid="source-url-input" /></label>{error && <div className="error-note" role="alert" data-testid="analysis-error"><X size={16} /> {error}</div>}<button className="submit-button" disabled={loading} data-testid="analyze-submit-button">{loading ? <><Loader2 className="spin" size={18} /> Reviewing signal…</> : <>Run the check <ArrowUpRight size={18} /></>}</button><p className="fine-print">This is a news-literacy aid, not a final editorial verdict.</p></form>
        <div className="result-panel" data-testid="result-panel">{result ? <><div className="result-head"><div><span className="result-label">REVIEW COMPLETE</span><h2 data-testid="result-verdict">{result.verdict}</h2></div><div className={`score-ring ${result.confidence > 70 ? "warm" : ""}`}><strong data-testid="confidence-score">{result.confidence}%</strong><span>confidence</span></div></div><p className="result-summary" data-testid="result-summary">{result.summary}</p><div className="checks">{visibleChecks.map((check, index) => <div className="check-row" key={`${check.label || "check"}-${index}`} data-testid={`evidence-check-${index}`}><span className={check.status === "pass" ? "check-icon pass" : "check-icon review"}>{check.status === "pass" ? <Check size={14} /> : <Clock3 size={14} />}</span><div><strong>{check.label || "Evidence signal"}</strong><p>{check.detail || "Review this signal manually."}</p></div><span className="check-state">{check.status === "pass" ? "CLEAR" : "REVIEW"}</span></div>)}</div>{result.source_card && <div className="source-card" data-testid="source-card"><div className="source-card-top"><span className={result.source_card.status === "verified" ? "source-status verified" : "source-status limited"}>{result.source_card.status === "verified" ? <Check size={12} /> : <Clock3 size={12} />} {result.source_card.status === "verified" ? "PUBLIC PAGE FOUND" : "CHECK MANUALLY"}</span><a href={result.source_card.url} target="_blank" rel="noreferrer" data-testid="source-card-link"><ExternalLink size={14} /></a></div><strong data-testid="source-card-title">{result.source_card.title}</strong><span data-testid="source-card-publisher">{result.source_card.publisher}</span><p data-testid="source-card-date-note">{result.source_card.published_at ? `Published ${new Date(result.source_card.published_at).toLocaleDateString()} · ${result.source_card.date_note}` : result.source_card.date_note}</p></div>}<div className="result-footer"><span>Mode: {result.mode === "deep" ? "AI deep scan" : "transparent quick scan"}</span><button onClick={() => { setResult(null); setHeadline(""); setArticle(""); setUrl(""); }} data-testid="reset-analysis-button">Check another <ArrowUpRight size={15} /></button></div></> : <div className="empty-result"><div className="empty-symbol"><ShieldCheck size={28} /></div><span className="result-label">YOUR REVIEW WILL APPEAR HERE</span><h2>Clarity over<br /><em>certainty.</em></h2><p>We’ll separate source signals, context, and language risk — without pretending to know more than the evidence.</p><div className="empty-lines"><span /><span /><span /></div></div>}</div></div></section>

      <section className="samples" id="how-it-works"><div className="section-kicker"><span>03</span><div><strong>CLAIMS IN THE WILD</strong><p>Fictional samples to explore the detector</p></div></div><div className="sample-grid">{samples.map((sample, index) => <button className="sample-card" onClick={() => fillSample(sample)} key={sample.title} data-testid={`sample-claim-${index}`}><div><span>{sample.tag}</span><h3>{sample.title}</h3><p>{sample.text}</p></div><ArrowUpRight size={20} /></button>)}</div></section>
      <section className="method-strip"><div><span className="section-number">04</span><h2>Trust is a process,<br /><em>not a feeling.</em></h2></div><div className="method-copy"><p>SatyaParkhar highlights what is present, what is missing, and what deserves a second source. It keeps the language neutral so your next decision can be yours.</p><div className="method-items"><span><b>01</b> Attribute the source</span><span><b>02</b> Check the context</span><span><b>03</b> Notice the language</span></div></div></section>
    </main>
    <footer><span>SatyaParkhar / A public claim desk</span><span>For better conversations, one claim at a time.</span></footer>
    {showHistory && <div className="drawer-backdrop" onClick={() => setShowHistory(false)}><aside className="history-drawer" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><span className="result-label">YOUR ACTIVITY</span><h2>Recent reviews</h2></div><button onClick={() => setShowHistory(false)} aria-label="Close history" data-testid="close-history-button"><X /></button></div>{history.length ? history.map((item, i) => <button className="history-item" key={item.id || i} onClick={() => { setResult(item); setShowHistory(false); }} data-testid={`history-item-${i}`}><span>{item.verdict}</span><strong>{item.headline}</strong><small>{item.confidence}% confidence · {new Date(item.created_at).toLocaleDateString()}</small></button>) : <p className="history-empty" data-testid="history-empty">Your completed reviews will appear here.</p>}</aside></div>}
  </div>;
};

function App() {
  return <div className="App"><Home /></div>;
}

export default App;
