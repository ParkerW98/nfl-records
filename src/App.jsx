import React, { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

// small helper to join class strings safely (avoids template backticks in className)
function cls(...parts) {
  return parts.filter(Boolean).join(" ");
}

// --- Team names (codes must match the grid) ---
const TEAM_NAMES = {
  ARI: "Arizona Cardinals",
  ATL: "Atlanta Falcons",
  BAL: "Baltimore Ravens",
  BUF: "Buffalo Bills",
  CAR: "Carolina Panthers",
  CHI: "Chicago Bears",
  CIN: "Cincinnati Bengals",
  CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys",
  DEN: "Denver Broncos",
  DET: "Detroit Lions",
  GB: "Green Bay Packers",
  HOU: "Houston Texans",
  IND: "Indianapolis Colts",
  JAX: "Jacksonville Jaguars",
  KC: "Kansas City Chiefs",
  LV: "Las Vegas Raiders",
  LAR: "Los Angeles Rams",
  LAC: "Los Angeles Chargers",
  MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings",
  NE: "New England Patriots",
  NO: "New Orleans Saints",
  NYG: "New York Giants",
  NYJ: "New York Jets",
  PHI: "Philadelphia Eagles",
  PIT: "Pittsburgh Steelers",
  SF: "San Francisco 49ers",
  SEA: "Seattle Seahawks",
  TB: "Tampa Bay Buccaneers",
  TEN: "Tennessee Titans",
  WSH: "Washington Commanders",
};
const TEAM_CODES = Object.keys(TEAM_NAMES);

// --- Team themes (NFL 32 teams; WSH code to match grid) ---
const TEAM_THEMES = {
  ARI: { primary: "#97233F", secondary: "#000000", accent: "#FFB612", background: "#fff5f7" },
  ATL: { primary: "#A71930", secondary: "#000000", accent: "#A5ACAF", background: "#fef2f2" },
  BAL: { primary: "#241773", secondary: "#000000", accent: "#9E7C0C", background: "#f5f3ff" },
  BUF: { primary: "#00338D", secondary: "#C60C30", accent: "#FFFFFF", background: "#f0f6ff" },
  CAR: { primary: "#0085CA", secondary: "#101820", accent: "#BFC0BF", background: "#f0faff" },
  CHI: { primary: "#0B162A", secondary: "#C83803", accent: "#FFFFFF", background: "#f5f7fa" },
  CIN: { primary: "#FB4F14", secondary: "#000000", accent: "#FFFFFF", background: "#fff6f2" },
  CLE: { primary: "#311D00", secondary: "#FF3C00", accent: "#FFFFFF", background: "#fff8f5" },
  DAL: { primary: "#041E42", secondary: "#869397", accent: "#FFFFFF", background: "#f4f8ff" },
  DEN: { primary: "#FB4F14", secondary: "#002244", accent: "#FFFFFF", background: "#fff8f5" },
  DET: { primary: "#0076B6", secondary: "#B0B7BC", accent: "#FFFFFF", background: "#f2f9ff" },
  GB:  { primary: "#203731", secondary: "#FFB612", accent: "#FFFFFF", background: "#f9fff5" },
  HOU: { primary: "#03202F", secondary: "#A71930", accent: "#FFFFFF", background: "#f3f8ff" },
  IND: { primary: "#002C5F", secondary: "#A2AAAD", accent: "#FFFFFF", background: "#f2f8ff" },
  JAX: { primary: "#006778", secondary: "#9F792C", accent: "#101820", background: "#f2fbfb" },
  KC:  { primary: "#E31837", secondary: "#FFB612", accent: "#FFFFFF", background: "#fff5f5" },
  LV:  { primary: "#000000", secondary: "#A5ACAF", accent: "#FFFFFF", background: "#f5f5f5" },
  LAC: { primary: "#0080C6", secondary: "#FFC20E", accent: "#FFFFFF", background: "#f0f9ff" },
  LAR: { primary: "#003594", secondary: "#FFA300", accent: "#FFFFFF", background: "#f5f8ff" },
  MIA: { primary: "#008E97", secondary: "#FC4C02", accent: "#005778", background: "#f0fbfb" },
  MIN: { primary: "#4F2683", secondary: "#FFC62F", accent: "#FFFFFF", background: "#f9f5ff" },
  NE:  { primary: "#002244", secondary: "#C60C30", accent: "#B0B7BC", background: "#f5f8ff" },
  NO:  { primary: "#101820", secondary: "#D3BC8D", accent: "#FFFFFF", background: "#f9f7f2" },
  NYG: { primary: "#0B2265", secondary: "#A71930", accent: "#FFFFFF", background: "#f0f6ff" },
  NYJ: { primary: "#125740", secondary: "#000000", accent: "#FFFFFF", background: "#f2fff9" },
  PHI: { primary: "#004C54", secondary: "#A5ACAF", accent: "#FFFFFF", background: "#f2fbfa" },
  PIT: { primary: "#101820", secondary: "#FFB612", accent: "#C60C30", background: "#f9f9f9" },
  SF:  { primary: "#AA0000", secondary: "#B3995D", accent: "#FFFFFF", background: "#fff5f5" },
  SEA: { primary: "#002244", secondary: "#69BE28", accent: "#A5ACAF", background: "#f2f9f2" },
  TB:  { primary: "#D50A0A", secondary: "#0A0A08", accent: "#FF7900", background: "#fff5f5" },
  TEN: { primary: "#0C2340", secondary: "#4B92DB", accent: "#A5ACAF", background: "#f2f7ff" },
  WSH: { primary: "#5A1414", secondary: "#FFB612", accent: "#000000", background: "#fff9f5" },
};

// --- Opponent grid (TEAM + 18 tokens) ---
const GRID = `
ARI @NO CAR @SF SEA TEN @IND GB BYE @DAL @SEA SF JAX @TB LAR @HOU ATL @CIN @LAR
ATL TB @MIN @CAR WSH BYE BUF @SF MIA @NE @IND CAR @NO @NYJ SEA @TB @ARI LAR NO
BAL @BUF CLE DET @KC HOU LAR BYE CHI @MIA @MIN @CLE NYJ CIN PIT @CIN NE @GB @PIT
BUF BAL @NYJ MIA NO NE @ATL BYE @CAR KC @MIA TB @HOU @PIT CIN @NE @CLE PHI NYJ
CAR @JAX @ARI ATL @NE MIA DAL @NYJ BUF @GB NO @ATL @SF LAR BYE @NO TB SEA @TB
CHI MIN @DET DAL @LV BYE @WSH NO @BAL @CIN NYG @MIN PIT @PHI @GB CLE GB @SF DET
CIN @CLE JAX @MIN @DEN DET @GB PIT NYJ CHI BYE @PIT NE @BAL @BUF BAL @MIA ARI CLE
CLE CIN @BAL GB @DET MIN @PIT MIA @NE BYE @NYJ BAL @LV SF TEN @CHI BUF PIT @CIN
DAL @PHI NYG @CHI GB @NYJ @CAR WSH @DEN ARI BYE @LV PHI KC @DET MIN LAC @WSH @NYG
DEN TEN @IND @LAC CIN @PHI @NYJ NYG DAL @HOU LV KC BYE @WSH @LV GB JAX @KC LAC
DET @GB CHI @BAL CLE @CIN @KC TB BYE MIN @WSH @PHI NYG GB DAL @LAR PIT @MIN @CHI
GB DET WSH @CLE @DAL BYE CIN @ARI @PIT CAR PHI @NYG MIN @DET CHI @DEN @CHI BAL @MIN
HOU @LAR TB @JAX TEN @BAL BYE @SEA SF DEN JAX @TEN BUF @IND @KC ARI LV @LAC IND
IND MIA DEN @TEN @LAR LV ARI @LAC TEN @PIT ATL BYE @KC HOU @JAX @SEA SF JAX @HOU
JAX CAR @CIN HOU @SF KC SEA LAR BYE @LV @HOU LAC @ARI @TEN IND NYJ @DEN @IND TEN
KC @LAC PHI @NYG BAL @JAX DET LV WSH @BUF BYE @DEN IND @DAL HOU LAC @TEN DEN @LV
LV @NE LAC @WSH CHI @IND TEN @KC BYE JAX @DEN DAL CLE @LAC DEN @PHI @HOU NYG KC
LAR HOU @TEN @PHI IND SF @BAL @JAX BYE NO @SF SEA TB @CAR @ARI DET @SEA @ATL ARI
LAC KC @LV DEN @NYG WSH @MIA IND MIN @TEN PIT @JAX BYE LV PHI @KC @DAL HOU @DEN
MIA @IND NE @BUF NYJ @CAR LAC @CLE @ATL BAL BUF WSH BYE NO @NYJ @PIT CIN TB @NE
MIN @CHI ATL CIN @PIT @CLE BYE PHI @LAC @DET BAL CHI @GB @SEA WSH @DAL @NYG DET GB
NE LV @MIA PIT CAR @BUF @NO @TEN CLE ATL @TB NYJ @CIN NYG BYE BUF @BAL @NYJ MIA
NO ARI SF @SEA @BUF NYG NE @CHI TB @LAR @CAR BYE ATL @MIA @TB CAR NYJ @TEN @ATL
NYG @WSH @DAL KC LAC @NO PHI @DEN @PHI SF @CHI GB @DET @NE BYE WSH MIN @LV DAL
NYJ PIT BUF @TB @MIA DAL DEN CAR @CIN BYE CLE @NE @BAL ATL MIA @JAX @NO NE @BUF
PHI DAL @KC LAR @TB DEN @NYG @MIN NYG BYE @GB DET @DAL CHI @LAC LV @WSH @BUF WSH
PIT @NYJ SEA @NE MIN BYE CLE @CIN GB IND @LAC CIN @CHI BUF @BAL MIA @DET @CLE BAL
SF @SEA @NO ARI JAX @LAR @TB ATL @HOU @NYG LAR @ARI CAR @CLE BYE TEN @IND CHI SEA
SEA SF @PIT NO @ARI TB @JAX HOU BYE @WSH ARI @LAR @TEN MIN @ATL IND LAR @CAR @SF
TB @ATL @HOU NYJ PHI @SEA SF @DET @NO BYE NE @BUF @LAR ARI NO ATL @CAR @MIA CAR
TEN @DEN LAR IND @HOU @ARI @LV NE @IND LAC BYE HOU SEA JAX @CLE @SF KC NO @JAX
WSH NYG @GB LV @ATL @LAC CHI @DAL @KC SEA DET @MIA BYE DEN @MIN @NYG PHI DAL @PHI
`;

// Parse the grid into schedules per team
function parseGrid(grid) {
  const lines = grid.split("\n").map((l) => l.trim()).filter(Boolean);
  const schedules = {};
  for (const line of lines) {
    const naive = line.split(/\s+/);
    let team = naive[0];
    let tokens = naive.slice(1);

    if (!TEAM_NAMES[team]) {
      const maybeTeam = TEAM_CODES.find((code) => line.startsWith(code + " "));
      if (maybeTeam) {
        team = maybeTeam;
        tokens = line.slice(maybeTeam.length).trim().split(/\s+/);
      } else {
        console.warn("Unrecognized team row:", line);
        continue;
      }
    }

    if (tokens.length !== 18) {
      const lex = [];
      const charset = new Set(TEAM_CODES);
      const s = line.slice(team.length).replace(/\s+/g, "");
      let i = 0;
      while (i < s.length) {
        if (s.startsWith("BYE", i)) { lex.push("BYE"); i += 3; continue; }
        let away = false;
        if (s[i] === "@") { away = true; i++; }
        let matched = "";
        if (i + 3 <= s.length && charset.has(s.slice(i, i + 3))) { matched = s.slice(i, i + 3); i += 3; }
        else if (i + 2 <= s.length && charset.has(s.slice(i, i + 2))) { matched = s.slice(i, i + 2); i += 2; }
        else { console.warn("Tokenizer failed at:", s.slice(i)); break; }
        lex.push((away ? "@" : "") + matched);
      }
      tokens = lex;
    }

    schedules[team] = tokens.slice(0, 18).map((tok, idx) => {
      if (!tok || tok === "BYE") return { week: idx + 1, token: "BYE", type: "BYE" };
      const away = tok.startsWith("@");
      const code = away ? tok.slice(1) : tok;
      return { week: idx + 1, token: tok, type: "GAME", homeAway: away ? "AWAY" : "HOME", opponentCode: code };
    });
  }
  return schedules;
}

const SCHEDULES = parseGrid(GRID);

function prettyOpponent(token) {
  if (token === "BYE") return "BYE";
  const away = token.startsWith("@");
  const code = away ? token.slice(1) : token;
  const name = TEAM_NAMES[code] || code;
  return (away ? "@ " : "vs ") + name;
}

function useLocalStorageState(key, initial) {
  const [state, setState] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; }
    catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState];
}

export default function App() {
  const defaultTheme = { primary: "#0ea5e9", secondary: "#0369a1", accent: "#e2e8f0", background: "#f8fafc" };
  const [team, setTeam] = useLocalStorageState("nflrp.team", "SEA");
  const [picks, setPicks] = useLocalStorageState("nflrp.picks", {});
  const teamSchedule = useMemo(() => SCHEDULES[team] || [], [team]);
  const theme = useMemo(() => TEAM_THEMES[team] || defaultTheme, [team]);

  useEffect(() => {
    setPicks((prev) => {
      const cur = prev[team] || new Array(18).fill(null);
      if (cur.length !== 18) prev[team] = new Array(18).fill(null).map((_, i) => (cur[i] == null ? null : cur[i]));
      return { ...prev, [team]: cur };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team]);

  const record = useMemo(() => {
    const arr = picks[team] || [];
    return { wins: arr.filter((x) => x === "W").length, losses: arr.filter((x) => x === "L").length };
  }, [picks, team]);

  const cardRef = useRef(null);

  const downloadImage = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#ffffff" });
    const teamName = TEAM_NAMES[team].replace(/[^a-z0-9]+/gi, "-").replace(/-+/g, "-").toLowerCase();
    const link = document.createElement("a");
    link.download = `${teamName}-2025-record-${record.wins}-${record.losses}.png`;
    link.href = dataUrl;
    link.click();
  };

  const resetPicks = () => setPicks((prev) => ({ ...prev, [team]: new Array(18).fill(null) }));

  const allTeams = useMemo(
    () => Object.entries(TEAM_NAMES).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => ({ code, name })),
    []
  );

  const baseBtn = "px-3 py-1.5 rounded-lg border text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed";
  const winOn  = "text-white";
  const winOff = "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50";
  const lossOn  = "text-white";
  const lossOff = "bg-white text-rose-700 border-rose-300 hover:bg-rose-50";

  return (
    <div className="min-h-screen w-full text-slate-900" style={{ background: theme.background }}>
      <header className="sticky top-0 z-10 backdrop-blur border-b border-slate-200" style={{ background: "#ffffffcc" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: theme.primary }}>
            NFL 2025 Record Predictor
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadImage}
              className="px-3 py-2 rounded-xl text-white text-sm font-medium shadow hover:opacity-90"
              style={{ background: theme.primary }}
            >
              Save as Image
            </button>
            <button
              onClick={resetPicks}
              className="px-3 py-2 rounded-xl text-sm font-medium border shadow-sm hover:bg-slate-50"
              style={{ color: theme.primary, borderColor: theme.primary, background: "#fff" }}
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-600 mb-1">Select team</label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full rounded-xl border bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2"
              style={{ borderColor: theme.primary }}
            >
              {allTeams.map(({ code, name }) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>

            <div className="mt-6 text-xs text-slate-600 leading-relaxed">
              <p>
                Pick <span className="font-semibold">W/L</span> for each non-bye week. Your selections auto-save in this
                browser. Use <em>Save as Image</em> to download a shareable PNG of your predictions card.
              </p>
              <p className="mt-2">Opponents & home/away are preloaded from a public schedule grid.</p>
            </div>
          </div>

          <div className="md:col-span-2">
            {/* Accent bar + Card */}
            <div className="rounded-2xl bg-white shadow-lg border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }} />
              <div ref={cardRef} className="overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: theme.primary }}>{TEAM_NAMES[team]}</h2>
                    <p className="text-sm text-slate-500">2025 Regular Season • Weeks 1–18</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold leading-none" style={{ color: theme.primary }}>
                      {record.wins}-{record.losses}
                    </div>
                    <div className="text-xs text-slate-500">Projected Record</div>
                  </div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500">
                      <th className="text-left px-4 py-2 w-16">Week</th>
                      <th className="text-left px-4 py-2">Opponent</th>
                      <th className="text-right px-4 py-2 w-36">Pick</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamSchedule.map((g, i) => {
                      const pickArr = picks[team] || new Array(18).fill(null);
                      const pick = pickArr[i];
                      const isBye = g.type === "BYE";
                      const chip = g.type === "BYE"
                        ? "bg-amber-100 text-amber-800"
                        : g.homeAway === "HOME"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-sky-100 text-sky-800";
                      return (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                          <td className="px-4 py-2 font-medium text-slate-700">{g.week}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className={cls("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", chip)}>
                                {g.type === "BYE" ? "BYE" : g.homeAway}
                              </span>
                              <span className="text-slate-800">{g.type === "BYE" ? "Bye Week" : prettyOpponent(g.token)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex justify-end gap-2">
                              <button
                                disabled={isBye}
                                onClick={() =>
                                  setPicks((prev) => {
                                    const arr = (prev[team] || new Array(18).fill(null)).slice();
                                    arr[i] = arr[i] === "W" ? null : "W";
                                    return { ...prev, [team]: arr };
                                  })
                                }
                                className={cls(baseBtn, pick === "W" ? winOn : winOff)}
                                style={pick === "W" ? { background: theme.primary, borderColor: theme.primary } : undefined}
                              >
                                W
                              </button>
                              <button
                                disabled={isBye}
                                onClick={() =>
                                  setPicks((prev) => {
                                    const arr = (prev[team] || new Array(18).fill(null)).slice();
                                    arr[i] = arr[i] === "L" ? null : "L";
                                    return { ...prev, [team]: arr };
                                  })
                                }
                                className={cls(baseBtn, pick === "L" ? lossOn : lossOff)}
                                style={pick === "L" ? { background: theme.secondary, borderColor: theme.secondary } : undefined}
                              >
                                L
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="px-5 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Summary:</span> {TEAM_NAMES[team]} finish {record.wins}-{record.losses} in your picks.
                  </div>
                  <div className="text-xs text-slate-500">Tip: Click a selected W/L again to clear it.</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={downloadImage}
                className="px-4 py-2 rounded-xl text-white text-sm font-medium shadow hover:opacity-90"
                style={{ background: theme.primary }}
              >
                Save this card as PNG
              </button>
              <button
                onClick={resetPicks}
                className="px-4 py-2 rounded-xl text-sm font-medium border shadow-sm hover:bg-slate-50"
                style={{ color: theme.primary, borderColor: theme.primary, background: "#fff" }}
              >
                Clear picks for this team
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-10 text-xs text-slate-500">
        <div className="mt-6">Built for quick predictions. Opponents/home-away came from a public schedule grid.</div>
      </footer>
    </div>
  );
}
