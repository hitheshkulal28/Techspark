import {
  Box, DollarSign, TrendingUp, AlertCircle, ArrowUpRight,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";

const stats = [
  { title: "Total Products", value: "6", delta: "+6 this week", icon: Box, tone: "from-blue-500 to-indigo-500" },
  { title: "Total Revenue", value: "13,605 NOK", delta: "+12.4% vs last period", icon: DollarSign, tone: "from-emerald-500 to-green-500" },
  { title: "Avg Quality Score", value: "4.52", delta: "Demand +8.7%", icon: TrendingUp, tone: "from-violet-500 to-fuchsia-500" },
  { title: "Low Stock Alert", value: "0", delta: "All good", icon: AlertCircle, tone: "from-orange-500 to-rose-500" },
];

const sales = [
  { d: "Nov 1", revenue: 2000 },
  { d: "Nov 2", revenue: 1500 },
  { d: "Nov 3", revenue: 1900 },
  { d: "Nov 4", revenue: 4400 },
  { d: "Nov 5", revenue: 3600 },
];

const regions = [
  { name: "Norway", value: 7812, units: 100, products: 2, avg: 78.12, top: true },
  { name: "Finland", value: 3649, units: 41, products: 1, avg: 89.0 },
  { name: "Sweden", value: 2144, units: 67, products: 2, avg: 32.0 },
  { name: "Denmark", value: 0, units: 0, products: 1, avg: 0.0 },
  { name: "Iceland", value: 0, units: 0, products: 0, avg: 0.0 }
];

const recentForecasts = [
  { sku: "MILK-001", place: "Norway • Online" },
  { sku: "MILK-001", place: "Sweden • Online" },
  { sku: "MILK-001", place: "Sweden • Online" },
  { sku: "BREAD-001", place: "Sweden • In-Store" },
  { sku: "APPLE-001", place: "Norway • Online" }
];

export default function Dashboard() {
  return (
    <div className="px-5 md:px-10 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 pt-8 pb-4">
        <div>
          <div className="flex items-center gap-2 text-3xl md:text-5xl font-extrabold tracking-tight">
            <span className="text-brand-600">Retail</span> Intelligence
          </div>
          <p className="mt-2 text-slate-600">
            AI-powered demand forecasting and dynamic pricing for Nordic retailers
          </p>
        </div>
        <Link to="/import" className="hidden md:inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-brand-600 to-indigo-600 text-white px-5 py-3 shadow-md">
          <ArrowUpRight className="size-4" />
          Import Data
        </Link>
      </div>

      {/* Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        {stats.map((s) => (
          <div key={s.title} className="card relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-linear-to-br from-slate-100 to-slate-200" />
            <div className="flex items-center justify-between p-6 md:p-8">
              <div>
                <div className="text-slate-600">{s.title}</div>
                <div className="mt-2 text-4xl font-extrabold tracking-tight">{s.value}</div>
                <div className="mt-3 text-emerald-600 font-medium">{s.delta}</div>
              </div>
              <div className="grid place-items-center size-16 rounded-2xl text-white bg-linear-to-br shadow-lg " style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
              <div className={`absolute top-6 right-6 grid place-items-center size-14 rounded-2xl text-white shadow-md bg-linear-to-br ${s.tone}`}>
                <s.icon className="size-7 opacity-95" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Trend */}
      <div className="card mt-8">
        <div className="p-6 md:p-8">
          <div className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="size-5 text-blue-600" />
            Sales Trend - Last 30 Days
          </div>
        </div>
        <div className="h-80 px-2 md:px-6 pb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sales} margin={{ left: 10, right: 10 }}>
              <defs>
                <linearGradient id="revFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="d" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#revFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Region + Side panels */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Regional Performance */}
        <div className="card lg:col-span-2">
          <div className="p-6 md:p-8">
            <div className="text-xl font-semibold flex items-center gap-2">
              <Box className="size-5 text-violet-600" />
              Regional Performance
            </div>
          </div>
          <div className="px-6 pb-6 space-y-6">
            {regions.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">
                    {r.name}{" "}
                    {r.top && (
                      <span className="badge bg-amber-100 text-amber-700">Top</span>
                    )}
                  </div>
                  <div className="font-bold">{r.value.toLocaleString()} NOK</div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${Math.min(100, (r.value / 8000) * 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-slate-600 flex gap-4">
                  <span>{r.units} units</span>
                  <span>•</span>
                  <span>{r.products} products</span>
                  <span>•</span>
                  <span>Avg: {r.avg.toFixed(2)} NOK</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Forecasts */}
          <div className="card">
            <div className="flex items-center justify-between p-6">
              <div className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="size-5 text-blue-600" />
                Recent Forecasts
              </div>
              <button className="text-sm text-slate-500 hover:text-slate-700">View All</button>
            </div>
            <div className="px-6 pb-6 space-y-4">
              {recentForecasts.map((f, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                  <div>
                    <div className="font-semibold">{f.sku}</div>
                    <div className="text-sm text-slate-600">{f.place}</div>
                  </div>
                  <span className="badge bg-slate-100 text-slate-700">ai_generated</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Recommendations */}
          <div className="card">
            <div className="flex items-center justify-between p-6">
              <div className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="size-5 text-emerald-600" />
                Price Recommendations
              </div>
              <button className="text-sm text-slate-500 hover:text-slate-700">View All</button>
            </div>
            <div className="px-6 pb-6">
              <div className="rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">APPLE-001</div>
                  <div className="text-sm text-slate-600">Norway • Online</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold">49.50 NOK</div>
                  <div className="text-emerald-600 text-sm">+ 10.0%</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}