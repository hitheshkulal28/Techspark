import { useMemo, useState } from "react";
import {
  DollarSign,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

const CATALOG = [
  { sku: "BREAD-001", name: "Sourdough Bread", region: "Norway", channel: "In-Store", currency: "DKK", price: 45.0, cost: 28.0, baseUnits: 100, elasticity: -0.21, confidence: 0.8 },
  { sku: "MILK-001",  name: "Organic Milk 1L", region: "Norway", channel: "Online",   currency: "NOK", price: 32.0, cost: 20.5, baseUnits: 100, elasticity: -0.50, confidence: 0.7 },
  { sku: "APPLE-001", name: "Organic Apples 1kg", region: "Norway", channel: "Online", currency: "NOK", price: 45.0, cost: 27.0, baseUnits: 100, elasticity: -1.50, confidence: 0.85 },
];

const REGIONS = ["Norway", "Sweden", "Finland", "Denmark", "Iceland"];
const CHANNELS = ["Online", "In-Store", "Both"];

export default function DynamicPricing() {
  const [sku, setSku] = useState("");
  const [region, setRegion] = useState("Norway");
  const [channel, setChannel] = useState("Online");
  const [minMargin, setMinMargin] = useState(20);
  const [maxDiscount, setMaxDiscount] = useState(30);

  const [pct, setPct] = useState(0);
  const [rec, setRec] = useState(null);

  const product = useMemo(() => CATALOG.find((p) => p.sku === sku) ?? null, [sku]);

  function optimize() {
    if (!product) { setRec(null); return; }
    const p0 = product.price;
    const minByMargin = product.cost / (1 - clamp(minMargin / 100, 0, 0.95));
    const minByDiscount = p0 * (1 - clamp(maxDiscount / 100, 0, 1));
    const minAllowed = Math.max(minByMargin, minByDiscount);
    const maxAllowed = p0 * 1.3;

    let best = { pct: 0, price: p0, revenue: p0 * product.baseUnits, units: product.baseUnits };
    for (let x = Math.round(((minAllowed / p0 - 1) * 100) * 10) / 10; x <= 30; x += 0.5) {
      const price = +(p0 * (1 + x / 100)).toFixed(2);
      if (price < minAllowed || price > maxAllowed) continue;
      const units = Math.max(0, Math.round(product.baseUnits * (1 + product.elasticity * (x / 100))));
      const revenue = +(price * units).toFixed(2);
      if (revenue > best.revenue) best = { pct: x, price, revenue, units };
    }

    const ai = `AI Recommendation: Given current market context in ${region} (${channel}),
we recommend ${fmt(best.price, product.currency)} for ${product.sku}.
Elasticity ≈ ${product.elasticity.toFixed(2)} suggests a modest demand change across this range.
This respects a minimum margin of ${minMargin}% and a max discount of ${maxDiscount}%.`;

    setRec({
      sku: product.sku, name: product.name, region, channel,
      currentPrice: p0, recommendedPrice: best.price, deltaPct: best.pct,
      units: best.units, revenue: best.revenue, elasticity: product.elasticity,
      currency: product.currency, confidence: product.confidence,
      minAllowed, maxAllowed,
      competitor: { min: 28.0, avg: 30.0, max: 33.0 },
      note: ai,
    });
    setPct(+best.pct.toFixed(1));
  }

  // Elasticity chart series (-30..30%)
  const chartData = useMemo(() => {
    const p0 = product?.price ?? 1;
    const u0 = product?.baseUnits ?? 100;
    const e = product?.elasticity ?? -0.5;
    const pts = [];
    for (let x = -30; x <= 30; x += 3) {
      const price = +(p0 * (1 + x / 100)).toFixed(2);
      const units = Math.max(0, Math.round(u0 * (1 + e * (x / 100))));
      const revenue = +(price * units).toFixed(2);
      pts.push({ pct: x, demand: units, revenue });
    }
    return pts;
  }, [product]);

  // Slider KPIs
  const sim = useMemo(() => {
    if (!product) return null;
    const price = +(product.price * (1 + pct / 100)).toFixed(2);
    const units = Math.max(0, Math.round(product.baseUnits * (1 + product.elasticity * (pct / 100))));
    const revenue = +(price * units).toFixed(2);
    return { price, units, revenue };
  }, [product, pct]);

  return (
    <div className="px-5 md:px-10 pb-16">
      {/* Title */}
      <div className="pt-8 pb-6">
        <div className="text-4xl md:text-5xl font-extrabold flex items-center gap-3">
          <DollarSign className="size-8 text-emerald-600" />
          <span className="text-slate-900">Dynamic Pricing</span> Engine
        </div>
        <p className="mt-2 text-slate-600">AI-powered price optimization with elasticity modeling</p>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Left: Price Optimizer */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50">
            <div className="text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal className="size-5 text-emerald-600" />
              Price Optimizer
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 space-y-4">
            <Field label="Product SKU">
              <select className="w-full rounded-xl border-slate-200" value={sku} onChange={(e) => setSku(e.target.value)}>
                <option value="">Select SKU</option>
                {CATALOG.map((p) => <option key={p.sku} value={p.sku}>{p.sku}</option>)}
              </select>
            </Field>
            <Field label="Region">
              <select className="w-full rounded-xl border-slate-200" value={region} onChange={(e) => setRegion(e.target.value)}>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Channel">
              <select className="w-full rounded-xl border-slate-200" value={channel} onChange={(e) => setChannel(e.target.value)}>
                {CHANNELS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Minimum Margin (%)">
              <input type="number" className="w-full rounded-xl border-slate-200" value={minMargin} onChange={(e) => setMinMargin(Number(e.target.value))} />
            </Field>
            <Field label="Maximum Discount (%)">
              <input type="number" className="w-full rounded-xl border-slate-200" value={maxDiscount} onChange={(e) => setMaxDiscount(Number(e.target.value))} />
            </Field>

            <button onClick={optimize} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white py-3 font-medium shadow-md hover:bg-emerald-600" disabled={!sku}>
              <Sparkles className="size-4" /> Optimize Price
            </button>
          </div>
        </div>

        {/* Right: Panel */}
        <div className="card min-h-[460px]">
          {!rec ? (
            <EmptyPanel title="No Recommendation Selected" subtitle="Generate a price recommendation to see elasticity analysis" />
          ) : (
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="text-lg md:text-xl font-semibold">Price Elasticity Simulation</div>
                <span className="badge bg-emerald-100 text-emerald-700">
                  Elasticity: {rec.elasticity.toFixed(2)}
                </span>
              </div>
              <div className="text-slate-600">{rec.sku} • {rec.region} • {rec.channel}</div>

              {/* AI note */}
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-slate-800 leading-relaxed">
                <span className="inline-flex items-center gap-2 font-medium text-emerald-700">
                  <Info className="size-4" /> AI Recommendation
                </span>
                <div className="mt-2">{rec.note}</div>
              </div>

              {/* Slider */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-700">Simulate Price Change</div>
                  <div className="text-xs rounded-lg bg-slate-100 border border-slate-200 px-2 py-1">
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="range"
                    min={Math.round(((rec.minAllowed / rec.currentPrice) - 1) * 100)}
                    max={30}
                    step={1}
                    value={pct}
                    onChange={(e) => setPct(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>-30%</span><span>0%</span><span>+30%</span>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              {sim && (
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <Tile title="Simulated Price" tone="indigo">
                    <div className="text-3xl font-extrabold">{sim.price.toFixed(2)}</div>
                    <div className="text-slate-500 text-sm">vs {rec.currentPrice.toFixed(2)} current</div>
                  </Tile>
                  <Tile title="Demand Impact" tone="emerald">
                    <div className="text-3xl font-extrabold">
                      {(((sim.units - (product?.baseUnits ?? 100)) / (product?.baseUnits ?? 100)) >= 0 ? "+" : "")}
                      {(((sim.units - (product?.baseUnits ?? 100)) / (product?.baseUnits ?? 100)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-slate-500 text-sm">≈ {sim.units} units</div>
                  </Tile>
                  <Tile title="Revenue Impact" tone="violet">
                    <div className="text-3xl font-extrabold">{Math.round(sim.revenue)}</div>
                    <div className="text-slate-500 text-sm">normalized revenue</div>
                  </Tile>
                </div>
              )}

              {/* Chart */}
              <div className="mt-6">
                <div className="text-sm md:text-base font-medium mb-2">
                  Price–Demand–Revenue Relationship
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: 10, right: 10 }}>
                      <CartesianGrid vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="pct" type="number" domain={[-30, 30]} tickFormatter={(v) => `${v}`} />
                      <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                      <Tooltip
                        labelFormatter={(v) => `Δ Price: ${v}%`}
                        formatter={(val, name) => [name.includes("Demand") ? `${val} units` : Math.round(val), name]}
                      />
                      <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
                      <Line yAxisId="left" type="monotone" dataKey="demand" name="Demand (normalized)" stroke="#3b82f6" strokeWidth={3} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (normalized)" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Competitor + Confidence */}
              <div className="mt-6">
                <div className="text-sm font-medium text-slate-700">Competitor Price Range</div>
                <div className="mt-2 h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-300 to-violet-500"
                    style={{
                      width: `${((rec.competitor.max - rec.competitor.avg) / (rec.competitor.max - rec.competitor.min)) * 100}%`,
                      marginLeft: `${((rec.competitor.avg - rec.competitor.min) / (rec.competitor.max - rec.competitor.min)) * 100}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>Min: {rec.competitor.min.toFixed(2)}</span>
                  <span className="text-violet-600 font-medium">Avg: {rec.competitor.avg.toFixed(2)}</span>
                  <span>Max: {rec.competitor.max.toFixed(2)}</span>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-medium text-slate-700">AI Confidence</div>
                  <div className="mt-2 h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.round((rec.confidence ?? 0.75) * 100)}%` }} />
                  </div>
                  <div className="mt-1 text-right text-xs text-emerald-600 font-semibold">
                    {Math.round((rec.confidence ?? 0.75) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Price Recommendations */}
      <div className="card mt-8">
        <div className="p-6 text-xl font-semibold flex items-center gap-2">
          <Sparkles className="size-5 text-emerald-600" />
          Recent Price Recommendations
        </div>
        <div className="px-6 pb-6 grid lg:grid-cols-3 gap-6">
          {RECENTS.map((r) => <RecCard key={r.sku} r={r} />)}
        </div>
      </div>
    </div>
  );
}

/* Recent cards */
const RECENTS = [
  { sku: "BREAD-001", place: "Norway • In-Store", current: 45.0, recommended: 45.0, currency: "DKK", confidence: 0.8, elasticity: -0.21, ts: "Nov 7, 2025, 3:23 PM" },
  { sku: "MILK-001", place: "Norway • Online", current: 32.0, recommended: 32.0, currency: "NOK", confidence: 0.7, elasticity: -0.50, ts: "Nov 7, 2025, 10:53 AM" },
  { sku: "APPLE-001", place: "Norway • Online", current: 45.0, recommended: 49.5, currency: "NOK", confidence: 0.85, elasticity: -1.50, ts: "Nov 7, 2025, 8:00 AM" },
];

function RecCard({ r }) {
  const delta = ((r.recommended - r.current) / r.current) * 100;
  const up = delta > 0;
  const rev = up ? 5.0 : r.recommended === r.current ? 0.0 : -5.0;
  return (
    <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
      <div className="text-2xl font-bold">{r.sku}</div>
      <div className="text-slate-600">{r.place}</div>

      <div className="soft-divider mt-4 pt-4 grid grid-cols-2 gap-6">
        <div>
          <div className="text-slate-500">Current</div>
          <div className="text-2xl font-extrabold">{r.current.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-slate-500">Recommended</div>
          <div className={`text-2xl font-extrabold ${up ? "text-emerald-600" : "text-slate-900"}`}>
            {r.recommended.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div className={`rounded-xl p-3 ${delta === 0 ? "bg-rose-50" : up ? "bg-emerald-50" : "bg-rose-50"}`}>
          <div className="text-slate-600 text-sm">Price Change</div>
          <div className={`text-lg font-semibold ${up ? "text-emerald-600" : "text-rose-600"}`}>
            {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
          </div>
        </div>
        <div className={`${rev >= 0 ? "bg-emerald-50/70" : "bg-rose-50/70"} rounded-xl p-3`}>
          <div className="text-slate-600 text-sm">Revenue</div>
          <div className={`${rev >= 0 ? "text-emerald-600" : "text-rose-600"} text-lg font-semibold`}>
            {rev >= 0 ? "+" : ""}{rev.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {typeof r.confidence === "number" && (
          <span className="badge bg-emerald-100 text-emerald-700">
            {Math.round(r.confidence * 100)}% Confidence
          </span>
        )}
        <span className="badge bg-slate-100 text-slate-700">
          Elasticity: {r.elasticity.toFixed(2)}
        </span>
      </div>

      <div className="mt-4 text-xs text-slate-500">{r.ts}</div>
    </div>
  );
}

/* Small helpers */
function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}
function Tile({ title, children, tone = "slate" }) {
  const bg = tone === "emerald" ? "bg-emerald-50" : tone === "violet" ? "bg-violet-50" : "bg-indigo-50";
  return (
    <div className={`rounded-2xl ${bg} p-4`}>
      <div className="text-slate-700 font-medium">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function EmptyPanel({ title, subtitle }) {
  return (
    <div className="h-full grid place-items-center px-6 py-16 text-center">
      <div>
        <TrendingUp className="mx-auto size-14 text-slate-300" />
        <div className="mt-4 text-xl font-semibold text-slate-800">{title}</div>
        <div className="text-slate-500">{subtitle}</div>
      </div>
    </div>
  );
}
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function fmt(value, currency) {
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(value); }
  catch { return `${value.toFixed(2)} ${currency}`; }
}