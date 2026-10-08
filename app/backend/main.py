from datetime import datetime, timezone
from pathlib import Path
import json
import re
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "news_db.json"

with open(DB_PATH, "r", encoding="utf-8") as f:
    NEWS = json.load(f)

history: list[dict[str, Any]] = []

app = FastAPI(title="Jantar Mantar News Verification API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    headline: str = Field(default="")
    article: str = Field(default="")
    url: str = Field(default="")
    mode: str = Field(default="quick")


def normalize(text: str) -> str:
    text = (text or "").lower()
    text = text.replace("jantar-mantar", "jantar mantar")
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def tokens(text: str) -> set[str]:
    stop = {
        "the", "a", "an", "is", "was", "were", "at", "in", "on", "to",
        "of", "for", "and", "or", "with", "from", "this", "that", "it",
        "about", "over", "after", "before", "by", "as", "has", "have",
        "had", "be", "been", "will", "their", "they", "he", "she"
    }
    return {t for t in normalize(text).split() if len(t) > 2 and t not in stop}


def location_match(text: str) -> bool:
    n = normalize(text)
    return "jantar mantar" in n or "jantar" in n and "mantar" in n


def score_record(query: str, record: dict[str, Any]) -> tuple[float, list[str]]:
    q = tokens(query)
    hay = " ".join([
        record.get("event_name", ""),
        record.get("topic", ""),
        record.get("headline", ""),
        record.get("summary", ""),
        " ".join(record.get("tags", [])),
    ])
    r = tokens(hay)
    overlap = q & r

    score = len(overlap) / max(1, min(len(q), 12))
    reasons = sorted(overlap)

    # Strong location requirement: this database is intentionally Jantar Mantar-only.
    if location_match(query):
        score += 0.20

    # Boost exact important entities.
    n = normalize(query)
    for phrase, boost in [
        ("cjp", 0.15),
        ("neet", 0.15),
        ("paper leak", 0.15),
        ("education", 0.08),
        ("protest", 0.08),
        ("election commission", 0.15),
        ("gyanesh kumar", 0.15),
    ]:
        if phrase in n and phrase in normalize(hay):
            score += boost

    return min(score, 1.0), reasons


def find_matches(query: str, limit: int = 6) -> list[tuple[float, dict[str, Any], list[str]]]:
    ranked = []
    for record in NEWS:
        score, reasons = score_record(query, record)
        if score >= 0.12:
            ranked.append((score, record, reasons))
    ranked.sort(key=lambda x: x[0], reverse=True)
    return ranked[:limit]


def determine_verdict(query: str, matches: list[tuple[float, dict[str, Any], list[str]]]) -> tuple[str, int, str]:
    n = normalize(query)

    if not matches:
        return (
            "Unverified",
            20,
            "No sufficiently related Jantar Mantar report was found in the current evidence database."
        )

    top = matches[0][1]
    top_score = matches[0][0]

    # Explicitly distinguish the current October event from the earlier NEET protests.
    asks_neet = "neet" in n or "paper leak" in n or "exam" in n
    asks_october = "october" in n or "oct 10" in n or "10 october" in n
    october_election_match = any(
        "election commission" in normalize(record["topic"] + " " + record["event_name"])
        and (
            "2026-10" in record["event_date"]
            or "october" in normalize(record["event_date"] + " " + record["published_date"])
        )
        for _, record, _ in matches
    )

    if asks_neet and asks_october and october_election_match:
        return (
            "Misleading",
            84,
            "The Jantar Mantar evidence shows separate CJP events: the June–July 2026 protests concerned NEET/examination issues, while the planned October 10 event concerns Election Commission/electoral-roll issues."
        )

    if top_score >= 0.45:
        return (
            "Supported",
            min(92, 60 + int(top_score * 35)),
            f"Related Jantar Mantar reporting supports the main event described in the claim. The strongest matching report is from {top['publisher']} dated {top['published_date']}."
        )

    return (
        "Needs review",
        48,
        "The claim has some overlap with Jantar Mantar reporting, but the available evidence is not specific enough for a strong determination."
    )


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "location_scope": "Jantar Mantar, New Delhi, India",
        "news_records": len(NEWS),
    }


@app.get("/api/news")
def get_news(topic: str = "", limit: int = 20):
    query = topic.strip()
    if not query:
        return {"location": "Jantar Mantar, New Delhi, India", "count": min(limit, len(NEWS)), "items": NEWS[:limit]}

    matches = find_matches(query, limit)
    return {
        "location": "Jantar Mantar, New Delhi, India",
        "count": len(matches),
        "items": [record for _, record, _ in matches],
    }


@app.get("/api/history")
def get_history():
    return history[-20:][::-1]


@app.post("/api/analyze")
def analyze_claim(payload: AnalyzeRequest):
    query = " ".join(x for x in [payload.headline, payload.article] if x).strip()
    matches = find_matches(query)

    verdict, confidence, summary = determine_verdict(query, matches)

    checks = [
        {
            "label": "Location",
            "status": "pass" if matches else "review",
            "detail": "Evidence is restricted to records associated with Jantar Mantar, New Delhi."
            if matches else "No matching Jantar Mantar evidence was found."
        },
        {
            "label": "Event match",
            "status": "pass" if matches and matches[0][0] >= 0.45 else "review",
            "detail": "The claim matches one or more stored Jantar Mantar events."
            if matches else "The claim could not be matched to a stored Jantar Mantar event."
        },
        {
            "label": "Source evidence",
            "status": "pass" if len(matches) >= 2 else ("review" if matches else "review"),
            "detail": f"{len(matches)} related source record(s) were found in the evidence database."
        },
    ]

    evidence = []
    for score, record, reasons in matches:
        evidence.append({
            "title": record["headline"],
            "publisher": record["publisher"],
            "published_date": record["published_date"],
            "event_date": record["event_date"],
            "url": record["source_url"],
            "summary": record["summary"],
            "relevance": round(score, 3),
            "matched_terms": reasons,
            "status": record["status"],
        })

    result = {
        "id": len(history) + 1,
        "headline": payload.headline,
        "verdict": verdict,
        "confidence": confidence,
        "summary": summary,
        "checks": checks,
        "source_card": evidence[0] if evidence else None,
        "evidence": evidence,
        "location_scope": "Jantar Mantar, New Delhi, India",
        "mode": payload.mode,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    history.append(result)
    return result
