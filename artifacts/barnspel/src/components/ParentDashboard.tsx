import { useState } from "react";
import { loadProgress, clearProgress, accuracy, type GameId } from "@/lib/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const GAME_LABELS: Record<GameId, { label: string; icon: string; color: string; group: string }> = {
  // Age 3-5
  colors:     { label: "Färger",    icon: "palette",               color: "#E84393", group: "3–5 år" },
  count:      { label: "Räkna",     icon: "pin",                   color: "#0984E3", group: "3–5 år" },
  pattern:    { label: "Mönster",   icon: "blur_on",               color: "#6C5CE7", group: "3–5 år" },
  sort:       { label: "Sortera",   icon: "category",              color: "#00B894", group: "3–5 år" },
  memory:     { label: "Minne",     icon: "grid_view",             color: "#E17055", group: "3–5 år" },
  // Age 6-7
  countBig:   { label: "Räkna 1–20",icon: "format_list_numbered",  color: "#0984E3", group: "6–7 år" },
  letters:    { label: "Bokstäver", icon: "abc",                   color: "#6C5CE7", group: "6–7 år" },
  patternAdv: { label: "Mönster +", icon: "auto_awesome",          color: "#E84393", group: "6–7 år" },
  memory67:   { label: "Minne",     icon: "grid_view",             color: "#00B894", group: "6–7 år" },
  sort67:     { label: "Sortera",   icon: "category",              color: "#E17055", group: "6–7 år" },
  // Age 8-9
  math:       { label: "Matte",     icon: "calculate",             color: "#6C5CE7", group: "8–9 år" },
  clock:      { label: "Klockan",   icon: "schedule",              color: "#0984E3", group: "8–9 år" },
  english:    { label: "Engelska",  icon: "translate",             color: "#00B894", group: "8–9 år" },
  logic:      { label: "Logik",     icon: "extension",             color: "#E17055", group: "8–9 år" },
};

function barColor(acc: number): string {
  if (acc < 0) return "#DFE6E9";
  if (acc >= 70) return "#00B894";
  if (acc >= 45) return "#FDCB6E";
  return "#FF7675";
}

function statusLabel(acc: number): string {
  if (acc < 0) return "Inte spelat";
  if (acc >= 70) return "Bra";
  if (acc >= 45) return "Öva mer";
  return "Behöver hjälp";
}

function statusColor(acc: number): string {
  if (acc < 0) return "#B2BEC3";
  if (acc >= 70) return "#00B894";
  if (acc >= 45) return "#E67E22";
  return "#FF7675";
}

interface Props { onClose: () => void; }

export default function ParentDashboard({ onClose }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>("3–5 år");
  const progress = loadProgress();

  const groups = ["3–5 år", "6–7 år", "8–9 år"];

  const data = (Object.keys(GAME_LABELS) as GameId[])
    .filter((id) => GAME_LABELS[id].group === activeGroup)
    .map((id) => {
      const stats = progress[id];
      const acc = accuracy(stats);
      return {
        id,
        name: GAME_LABELS[id].label,
        accuracy: acc < 0 ? 0 : acc,
        played: stats.correct + stats.wrong,
        correct: stats.correct,
        wrong: stats.wrong,
        rawAcc: acc,
        color: GAME_LABELS[id].color,
        icon: GAME_LABELS[id].icon,
      };
    });

  const handleClear = () => {
    if (!confirmed) { setConfirmed(true); return; }
    clearProgress();
    setConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(45,52,54,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-white w-full sm:max-w-lg overflow-hidden"
        style={{
          borderRadius: "24px 24px 0 0",
          maxHeight: "92svh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1.5px solid #E8EAF0" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#EEF0FD" }}
            >
              <span className="material-icons-round" style={{ color: "#6C5CE7", fontSize: "22px" }}>bar_chart</span>
            </div>
            <div>
              <h2 className="font-800 text-lg" style={{ fontWeight: 800, color: "#2D3436" }}>Framsteg</h2>
              <p className="text-xs" style={{ color: "#636E72" }}>Se barnets övningsresultat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center cb-card-interactive"
            style={{ border: "1.5px solid #E8EAF0", color: "#636E72" }}
          >
            <span className="material-icons-round" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        {/* Age group tabs */}
        <div className="flex gap-2 px-5 pt-4">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className="flex-1 py-2 rounded-xl text-sm font-700 transition-all"
              style={{
                fontWeight: 700,
                background: activeGroup === g ? "#6C5CE7" : "#F0F0FA",
                color: activeGroup === g ? "white" : "#636E72",
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Chart */}
          <div>
            <p className="cb-label mb-3">Träffsäkerhet per övning</p>
            <div style={{ background: "#F8F9FF", borderRadius: 16, padding: "12px 4px 4px" }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} margin={{ top: 4, right: 12, left: -24, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#636E72", fontFamily: "Nunito" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "#B2BEC3", fontFamily: "Nunito" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(val: number, _: string, props: any) => {
                      const item = props.payload;
                      return [
                        item.rawAcc < 0
                          ? "Inte spelat ännu"
                          : `${val}% · ${item.correct} rätt, ${item.wrong} fel`,
                        "Träffsäkerhet",
                      ];
                    }}
                    contentStyle={{
                      borderRadius: 14,
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      fontFamily: "Nunito",
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} maxBarSize={44}>
                    {data.map((entry) => (
                      <Cell key={entry.id} fill={barColor(entry.rawAcc)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              { color: "#00B894", label: "Bra (≥70%)" },
              { color: "#FDCB6E", label: "Öva mer (45–69%)" },
              { color: "#FF7675", label: "Behöver hjälp (<45%)" },
              { color: "#DFE6E9", label: "Inte spelat" },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "#636E72", fontWeight: 600 }}>
                <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>

          {/* Per-game detail list */}
          <div>
            <p className="cb-label mb-3">Detaljer</p>
            <div className="flex flex-col gap-2">
              {data.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: "#F8F9FF", border: "1.5px solid #E8EAF0" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${d.color}18` }}
                  >
                    <span className="material-icons-round" style={{ color: d.color, fontSize: "20px" }}>
                      {d.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-700 text-sm" style={{ fontWeight: 700, color: "#2D3436" }}>{d.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#636E72" }}>
                      {d.played > 0 ? `${d.correct} rätt · ${d.wrong} fel · ${d.played} svar` : "Inte spelat ännu"}
                    </p>
                  </div>
                  <div
                    className="text-xs font-800 px-3 py-1.5 rounded-xl flex-shrink-0"
                    style={{
                      fontWeight: 800,
                      background: `${barColor(d.rawAcc)}20`,
                      color: statusColor(d.rawAcc),
                    }}
                  >
                    {d.rawAcc < 0 ? "–" : `${d.rawAcc}%`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="cb-btn w-full mt-2"
            style={{
              background: confirmed ? "#FF7675" : "#F8F9FF",
              color: confirmed ? "white" : "#636E72",
              border: `1.5px solid ${confirmed ? "#FF7675" : "#E8EAF0"}`,
              boxShadow: "none",
              fontSize: "15px",
            }}
          >
            <span className="material-icons-round" style={{ fontSize: "18px" }}>
              {confirmed ? "warning" : "delete_outline"}
            </span>
            {confirmed ? "Tryck igen för att radera all statistik" : "Rensa statistik"}
          </button>
        </div>
      </div>
    </div>
  );
}
