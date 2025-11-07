import React, { useMemo, useState } from "react";
import {
  Sparkles,
  SlidersHorizontal,
  Info,
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

const PRODUCTS = [
  {
    sku: "APPLE-001",
    name: "Organic Apples 1kg",
    region: "Norway",
    channel: "Online",
    currency: "NOK",
    price: 45.0,
    cost: 27.0,
    baseUnits: 100,
    elasticity: 0.5, // 10% price up -> ~5% demand down
    confidence: 0.85,
  },
];

const REGION_OPTIONS = ["Norway", "Sweden", "Finland", "Denmark", "Iceland"];
const CHANNEL_OPTIONS = ["Online", "In-Store", "Both"];

export default function DynamicPricing() {
  const [sku, setSku] = useState(PRODUCTS[0].sku);
  const product = useMemo(
    () => PRODUCTS.find((p) => p.sku === sku) || PRODUCTS[0],
    [sku]
  );

  // Left form
  const [region, setRegion] = useState(product.region);
  const [channel, setChannel] = useState(product.channel);
  const [minMargin, setMinMargin] = useState(20); // %
  const [maxDiscount, setMaxDiscount] = useState(30); // %
  // Simulation slider (-30% .. +30%)
  const [pct, setPct] = useState(0); // in percent

  // Derived values
  const currentPrice = product.price;
  const minPriceFromMargin = useMemo(() => {
    const mm = clamp(Number(minMargin) / 100, 0, 0.95);
    return +(product.cost / (1 - mm)).toFixed(2);
  }, [product.cost, minMargin]);

  const minPctAllowed = useMemo(() => {
    const boundByDiscount = -Number(maxDiscount);
    const boundByMargin = (minPriceFromMargin / currentPrice - 1) * 100;
    return Math.max(boundByDiscount, Math.round(boundByMargin * 100) / 100);
  }, [maxDiscount, minPriceFromMargin, currentPrice]);

  const simulatedPrice = +(currentPrice * (1 + pct / 100)).toFixed(2);
  const simulatedUnits = useMemo(
    () => Math.max(0, Math.round(product.baseUnits * (1 - product.elasticity * (pct / 100)))),
    [pct, product.baseUnits, product.elasticity]
  );
  const baseRevenue = currentPrice * product.baseUnits;
  const simulatedRevenue = simulatedPrice * simulatedUnits;
  const demandImpactPct = ((simulatedUnits - product.baseUnits) / product.baseUnits) * 100;

  // Chart data: -30%..+30%
  const chartData = useMemo(() => {
    const data = [];
    for (let x = -30; x <= 30; x += 3) {
      let price = +(currentPrice * (1 + x / 100)).toFixed(2);
      // Respect min margin
      if (price < minPriceFromMargin) price = minPriceFromMargin;
      const units = Math.max(0, Math.round(product.baseUnits * (1 - product.elasticity * (x / 100))));
      const revenue = price * units;
      data.push({
        pct: x,
        demand: units,
        revenue,
      });
    }
    return data;
  }, [currentPrice, minPriceFromMargin, product.baseUnits, product.elasticity]);

  // One-click optimizer (search best revenue under constraints)
  function optimize() {
    let best = { pct: 0, revenue: -Infinity, price: currentPrice };
    for (let x = minPctAllowed; x <= 30; x += 0.5) {
      const priceCandidate = +(currentPrice * (1 + x / 100)).toFixed(2);
      if (priceCandidate < minPriceFromMargin) continue;
      const units = Math.max(0, Math.round(product.baseUnits * (1 - product.elasticity * (x / 100))));
      const revenue = priceCandidate * units;
      if (revenue > best.revenue) best = { pct: x, revenue, price: priceCandidate };
    }
    setPct(+best.pct.toFixed(1));
  }

  const recommendationText = useMemo(() => {
    const recPrice = +(currentPrice * (1 + 0.1)).toFixed(2); // example 10% uplift narrative
    const marginPct = ((recPrice - product.cost) / recPrice) * 100;
    return [
      `AI Recommendation: Based on the available data, the recommended price for ${product.sku} is ${recPrice.toFixed(1)} ${product.currency}.`,
      `This price point maintains a profit margin of approximately ${marginPct.toFixed(0)}% (Cost: ${product.cost} ${product.currency}, Price: ${recPrice} ${product.currency}), aligning with the minimum margin requirement.`,
      `The price elasticity indicates that a 10% price increase may slightly reduce demand while improving revenue.`,
      `Competitor pricing for fresh produce in ${region} varies. Considering the quality of this product, positioning it at ${recPrice} ${product.currency} reflects its premium quality. The maximum allowable discount is ${maxDiscount}%, providing a competitive edge.`,
      `The confidence score for this recommendation is ${Math.round(product.confidence * 100)}%.`,
    ].join(" ");
  }, [currentPrice, product, region, maxDiscount]);

  return (
    <div className="px-5 md:px-10 pb-16">
      {/* Title */}
      <div className="pt-8 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-4xl md:text-5xl font-extrabold flex items-center gap-3">
            <span className="text-brand-600">Dynamic</span> Pricing
          </div>
          <p className="mt-2 text-slate-600">
            Optimize price with constraints, simulate impacts, and visualize price–demand–revenue.
          </p>
        </div>
        <button
          onClick={optimize}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-5 py-3 shadow-md hover:bg-emerald-600"
        >
          <Sparkles className="size-4" /> Optimize Price
        </button>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Left form */}
        <div className="card p-6">
          <div className="text-lg font-semibold flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-brand-600" />
            Constraints
          </div>

          <div className="mt-4 space-y-4">
            <Field label="Product">
              <select
                className="w-full rounded-xl border-slate-200"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              >
                {PRODUCTS.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Region">
              <select className="w-full rounded-xl border-slate-200" value={region} onChange={(e) => setRegion(e.target.value)}>
                {REGION_OPTIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>

            <Field label="Channel">
              <select className="w-full rounded-xl border-slate-200" value={channel} onChange={(e) => setChannel(e.target.value)}>
                {CHANNEL_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Minimum Margin (%)">
              <input
                type="number"
                className="w-full rounded-xl border-slate-200"
                value={minMargin}
                onChange={(e) => setMinMargin(e.target.value)}
              />
            </Field>

            <Field label="Maximum Discount (%)">
              <input
                type="number"
                className="w-full rounded-xl border-slate-200"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
              />
            </Field>

            <button
              onClick={optimize}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white py-3 font-medium shadow-md hover:bg-emerald-600"
            >
              <Sparkles className="size-4" /> Optimize Price
            </button>

            <div className="mt-2 text-sm text-slate-500">
              Current price: <span className="font-semibold">{formatMoney(currentPrice, product.currency)}</span> •
              Cost: <span className="font-semibold">{formatMoney(product.cost, product.currency)}</span> •
              Min price from margin: <span className="font-semibold">{formatMoney(minPriceFromMargin, product.currency)}</span>
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="space-y-6">
          {/* AI Recommendation */}
          <div className="card">
            <div className="p-6 text-lg font-semibold flex items-center gap-2">
              <Info className="size-5 text-emerald-600" />
              AI Recommendation
            </div>
            <div className="px-6 pb-6">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 leading-relaxed text-slate-700">
                {recommendationText}
              </div>
            </div>
          </div>

          {/* Simulator */}
          <div className="card">
            <div className="p-6">
              <div className="text-lg font-semibold">Simulate Price Change</div>

              <div className="mt-4">
                <div className="relative">
                  <input
                    type="range"
                    min={minPctAllowed}
                    max={30}
                    step={1}
                    value={pct}
                    onChange={(e) => setPct(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                  <div className="absolute -top-8 right-0 text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1">
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{minPctAllowed}%</span>
                  <span>0%</span>
                  <span>+30%</span>
                </div>
              </div>

              {/* KPI tiles */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <Tile title="Simulated Price" tone="indigo">
                  <div className="text-3xl font-extrabold">{simulatedPrice.toFixed(2)}</div>
                  <div className="text-slate-500 text-sm">vs {currentPrice.toFixed(2)} current</div>
                </Tile>
                <Tile title="Demand Impact" tone="emerald">
                  <div className="text-3xl font-extrabold">
                    {demandImpactPct >= 0 ? "+" : ""}
                    {demandImpactPct.toFixed(1)}%
                  </div>
                  <div className="text-slate-500 text-sm">≈ {simulatedUnits} units</div>
                </Tile>
                <Tile title="Revenue Impact" tone="violet">
                  <div className="text-3xl font-extrabold">{Math.round(simulatedRevenue)}</div>
                  <div className="text-slate-500 text-sm">normalized revenue</div>
                </Tile>
              </div>

              {/* Chart */}
              <div className="mt-6">
                <div className="text-lg font-semibold mb-2">Price–Demand–Revenue Relationship</div>
                <div className="h-320px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: 10, right: 10 }}>
                      <CartesianGrid stroke="#e5e7eb" />
                      <XAxis
                        dataKey="pct"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        ticks={[-30, -20, -10, 0, 10, 20, 30]}
                        tickFormatter={(v) => `${v}`}
                        label={{ value: "Price Change (%)", position: "insideBottom", offset: -5 }}
                      />
                      <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                      <Tooltip
                        formatter={(val, name) => [
                          name === "Demand" ? `${val} units` : Math.round(val),
                          name,
                        ]}
                        labelFormatter={(v) => `Δ Price: ${v}%`}
                      />
                      <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="demand"
                        name="Demand (normalized)"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue (normalized)"
                        stroke="#a855f7"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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

function Tile({ title, children, tone = "slate" }) {
  const bg =
    tone === "emerald"
      ? "bg-emerald-50/80"
      : tone === "violet"
      ? "bg-violet-50/80"
      : "bg-indigo-50/80";
  return (
    <div className={`rounded-2xl ${bg} p-4`}>
      <div className="text-slate-700 font-medium">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function formatMoney(value, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}