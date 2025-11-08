import { useMemo, useState } from "react";
import { TrendingUp, Sparkles, Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const SKU_OPTIONS = ["BREAD-001", "MILK-001", "APPLE-001"];
const REGION_OPTIONS = ["Norway", "Sweden", "Finland", "Denmark", "Iceland"];
const CHANNEL_OPTIONS = ["Online", "In-Store", "Both"];
const HORIZON_OPTIONS = ["8 Weeks", "12 Weeks", "16 Weeks"];

export default function DemandForecast() {
  const [sku, setSku] = useState("");
  const [region, setRegion] = useState("Norway");
  const [channel, setChannel] = useState("Online");
  const [horizon, setHorizon] = useState("8 Weeks");
  const [selected, setSelected] = useState(null);

  const chart = useMemo(() => {
    if (!selected) return [];
    // Sample smooth band series for 8–16 weeks
    const labels = [
      "Nov 6", "Nov 13", "Nov 20", "Nov 27", "Dec 4",
      "Dec 11", "Dec 18", "Dec 25",
    ];
    return labels.map((d, i) => {
      const base = 160 + i * 12; // base trend
      return { d, low: base * 0.55, high: base * 1.05 };
    });
  }, [selected]);

  function generate() {
    const chosenSku = sku || "BREAD-001";
    setSelected({
      sku: chosenSku,
      region,
      channel,
      horizon,
      confidence: 0.85,
      ts: new Date("2025-11-07T17:23:00"),
      seasonal: true,
    });
  }

  function selectFromHistory() {
    setSelected({
      sku: "BREAD-001",
      region: "Denmark",
      channel: "Online",
      horizon: "8 Weeks",
      confidence: 0.85,
      ts: new Date("2025-11-07T17:23:00"),
      seasonal: true,
    });
  }

  return (
    <div className="px-5 md:px-10 pb-16">
      {/* Title */}
      <div className="pt-8 pb-6">
        <div className="text-4xl md:text-5xl font-extrabold flex items-center gap-3">
          <TrendingUp className="size-8 text-blue-600" />
          <span className="text-slate-900">Demand</span> Forecasting
        </div>
        <p className="mt-2 text-slate-600">
          AI-powered time-series forecasting with seasonality detection
        </p>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Left: form */}
        <div className="card p-6">
          <div className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="size-5 text-brand-600" />
            Generate Forecast
          </div>

          <div className="mt-4 space-y-5">
            <Field label="Product SKU">
              <select
                className="w-full rounded-xl border-slate-200"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              >
                <option value="">Select SKU</option>
                {SKU_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Region">
              <select
                className="w-full rounded-xl border-slate-200"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {REGION_OPTIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>

            <Field label="Channel">
              <select
                className="w-full rounded-xl border-slate-200"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                {CHANNEL_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Forecast Horizon">
              <select
                className="w-full rounded-xl border-slate-200"
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
              >
                {HORIZON_OPTIONS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </Field>

            <button
              onClick={generate}
              className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white py-3 font-medium shadow-md"
            >
              ✨ Generate Forecast
            </button>
          </div>
        </div>

        {/* Right: empty state or chart */}
        <div className="card min-h-[460px]">
          {!selected ? (
            <EmptyRight title="No Forecast Selected" subtitle="Generate a new forecast or select one from the list below" />
          ) : (
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg md:text-xl font-semibold">
                    Demand Forecast - {selected.sku}
                  </div>
                  <div className="text-slate-600">
                    {selected.region} • {selected.channel} •{" "}
                    {selected.horizon.toLowerCase()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-blue-100 text-blue-700">
                    ai_generated
                  </span>
                  <span className="badge bg-emerald-100 text-emerald-700">
                    {Math.round(selected.confidence * 100)}% Confidence
                  </span>
                </div>
              </div>

              <div className="h-[340px] mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart} margin={{ left: 10, right: 10 }}>
                    <defs>
                      <linearGradient id="high" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="low" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="d" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="high"
                      name="High Confidence"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#high)"
                    />
                    <Area
                      type="monotone"
                      dataKey="low"
                      name="Low Confidence"
                      stroke="#34d399"
                      strokeWidth={2}
                      fill="url(#low)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Legend + KPIs */}
              <div className="mt-3 text-sm text-slate-600">
                <div className="flex items-center gap-6">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-600"></span>
                    High Confidence
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-300"></span>
                    Low Confidence
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <KPI title="Avg Demand" value="204" sub="units/week" />
                <KPI title="Peak Demand" value="300" sub="units" />
                <KPI
                  title="Seasonality"
                  value="Detected"
                  tone="emerald"
                />
              </div>

              <div className="mt-6 text-xs text-slate-500 flex items-center justify-between">
                <div>
                  Generated: Nov 7, 2025, 5:23 PM
                </div>
                <div className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5 text-slate-400" />
                  Model: ai_generated
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forecast History */}
      <div className="card mt-8">
        <div className="flex items-center gap-2 p-6 text-xl font-semibold">
          <Calendar className="size-5 text-blue-600" />
          Forecast History
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={selectFromHistory}
            className="w-full text-left rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white px-4 py-4 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-lg">BREAD-001</div>
                <div className="text-slate-600">Denmark • Online • 8w</div>
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <span className="badge bg-emerald-100 text-emerald-700">
                    85% Confidence
                  </span>
                  <span className="badge bg-violet-100 text-violet-700">
                    Seasonal
                  </span>
                </div>
              </div>
              <span className="badge bg-slate-100 text-slate-700">
                ai_generated
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Nov 7, 17:23</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

function KPI({ title, value, sub, tone = "slate" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="text-slate-600">{title}</div>
      <div className="mt-2 text-4xl font-extrabold tracking-tight">{value}</div>
      {sub && <div className="text-slate-500">{sub}</div>}
      {tone === "emerald" && (
        <div className="mt-3 badge bg-emerald-100 text-emerald-700">Detected</div>
      )}
    </div>
  );
}

function EmptyRight({ title, subtitle }) {
  return (
    <div className="h-full grid place-items-center px-6 py-16 text-center">
      <div>
        <Calendar className="mx-auto size-14 text-slate-300" />
        <div className="mt-4 text-xl font-semibold text-slate-800">
          {title}
        </div>
        <div className="text-slate-500">{subtitle}</div>
      </div>
    </div>
  );
}