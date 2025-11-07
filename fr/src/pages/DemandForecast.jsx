import { TrendingUp, Sparkles } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const chart = [
  { d: "Oct 30", low: 280, high: 330 },
  { d: "Nov 06", low: 300, high: 360 },
  { d: "Nov 13", low: 320, high: 400 },
  { d: "Nov 20", low: 340, high: 430 },
  { d: "Nov 27", low: 380, high: 480 },
  { d: "Dec 04", low: 420, high: 520 },
  { d: "Dec 11", low: 460, high: 560 },
  { d: "Dec 18", low: 480, high: 590 },
  { d: "Dec 25", low: 320, high: 350 },
  { d: "Jan 01", low: 290, high: 310 },
  { d: "Jan 08", low: 300, high: 330 },
  { d: "Jan 15", low: 310, high: 340 },
];

export default function DemandForecast() {
  return (
    <div className="px-5 md:px-10 pb-16">
      {/* Title */}
      <div className="pt-8 pb-6">
        <div className="text-4xl md:text-5xl font-extrabold flex items-center gap-3">
          <span className="text-brand-600">Demand</span> Forecasting
        </div>
        <p className="mt-2 text-slate-600">
          AI-powered time-series forecasting with seasonality detection
        </p>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        {/* Left: form */}
        <div className="card p-6">
          <div className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="size-5 text-brand-600" />
            Generate Forecast
          </div>

          <div className="mt-4 space-y-4">
            <Field label="Product SKU">
              <select className="w-full rounded-xl border-slate-200">
                <option>Select SKU</option>
                <option>APPLE-001</option>
                <option>MILK-001</option>
                <option>BREAD-001</option>
              </select>
            </Field>

            <Field label="Region">
              <select className="w-full rounded-xl border-slate-200">
                <option>Norway</option>
                <option>Sweden</option>
                <option>Finland</option>
                <option>Denmark</option>
              </select>
            </Field>

            <Field label="Channel">
              <select className="w-full rounded-xl border-slate-200">
                <option>Online</option>
                <option>In-Store</option>
                <option>Both</option>
              </select>
            </Field>

            <Field label="Forecast Horizon">
              <select className="w-full rounded-xl border-slate-200">
                <option>8 Weeks</option>
                <option>12 Weeks</option>
                <option>16 Weeks</option>
              </select>
            </Field>

            <button className="mt-4 w-full rounded-xl bg-linear-to-r from-brand-600 to-indigo-600 text-white py-3 font-medium shadow-md">
              ✨ Generate Forecast
            </button>
          </div>
        </div>

        {/* Right: chart + stats */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between p-6">
              <div className="text-lg md:text-xl font-semibold">
                Demand Forecast - APPLE-001
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-slate-100 text-slate-700">ai_generated</span>
                <span className="badge bg-emerald-100 text-emerald-700">85% Confidence</span>
              </div>
            </div>

            <div className="h-[360px] px-4 md:px-6 pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ left: 10, right: 10 }}>
                  <defs>
                    <linearGradient id="high" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="low" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#a7f3d0" stopOpacity={0.35}/>
                      <stop offset="100%" stopColor="#a7f3d0" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e5e7eb"/>
                  <XAxis dataKey="d" tickLine={false} axisLine={false}/>
                  <YAxis tickLine={false} axisLine={false}/>
                  <Tooltip />
                  <Area type="monotone" dataKey="high" name="High Confidence" stroke="#10b981" strokeWidth={3} fill="url(#high)" />
                  <Area type="monotone" dataKey="low"  name="Low Confidence"  stroke="#34d399" strokeWidth={2} fill="url(#low)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="px-6 pb-6 text-sm text-slate-600">
              <div className="flex items-center gap-6">
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-600"></span> High Confidence
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-300"></span> Low Confidence
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard title="Avg Demand" value="315" sub="units/week" />
            <StatCard title="Peak Demand" value="450" sub="units" />
            <StatCard title="Seasonality" value="Detected" tone="emerald" />
          </div>

          {/* History */}
          <div className="card">
            <div className="p-6 text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="size-5 text-blue-600" />
              Forecast History
            </div>
            <div className="px-6 pb-6">
              <div className="rounded-2xl border-2 border-brand-100 bg-brand-50/50 p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">APPLE-001</div>
                  <div className="text-slate-600">Sweden • In-Store • 12w</div>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="badge bg-emerald-100 text-emerald-700">85% Confidence</span>
                    <span className="badge bg-violet-100 text-violet-700">Seasonal</span>
                  </div>
                </div>
                <span className="badge bg-slate-100 text-slate-700">ai_generated</span>
              </div>
            </div>
          </div>
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

function StatCard({ title, value, sub, tone = "slate" }) {
  return (
    <div className="card p-6">
      <div className="text-slate-600">{title}</div>
      <div className="mt-2 text-4xl font-extrabold tracking-tight">{value}</div>
      {sub && <div className="text-slate-500">{sub}</div>}
      {tone === "emerald" && (
        <div className="mt-3 badge bg-emerald-100 text-emerald-700">Detected</div>
      )}
    </div>
  );
}