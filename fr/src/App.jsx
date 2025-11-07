import { NavLink, Route, Routes } from "react-router-dom";
import {
  Sparkles, LayoutDashboard, Tags, TrendingUp, DollarSign, Upload,
} from "lucide-react";
import Dashboard from "./pages/Dashboard.jsx";
import SmartDeals from "./pages/SmartDeals.jsx";
import DemandForecast from "./pages/DemandForecast.jsx";
import DynamicPricing from "./pages/DynamicPricing.jsx";
import ImportData from "./pages/ImportData.jsx";

export default function App() {
  return (
    <div className="min-h-screen text-slate-800">
      <div className="grid md:grid-cols-[280px_1fr]">
        <aside className="hidden md:flex md:flex-col h-screen sticky top-0 bg-white border-r border-slate-200">
          <div className="flex items-center gap-3 px-6 pt-5 pb-6">
            <div className="grid place-items-center size-11 rounded-2xl bg-brand-600 text-white shadow-lg">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="text-xl font-semibold">RetailAI</div>
              <div className="text-xs text-slate-500">Nordic Pricing Engine</div>
            </div>
          </div>

          <div className="px-6 text-xs font-semibold text-slate-500 tracking-wide">NAVIGATION</div>

          <nav className="mt-3 px-3 space-y-1">
            <SideLink to="/" icon={<LayoutDashboard className="size-4" />} label="Dashboard" />
            <SideLink to="/deals" icon={<Tags className="size-4" />} label="Smart Deals" />
            <SideLink to="/forecast" icon={<TrendingUp className="size-4" />} label="Demand Forecast" />
            <SideLink to="/pricing" icon={<DollarSign className="size-4" />} label="Dynamic Pricing" />
            <SideLink to="/import" icon={<Upload className="size-4" />} label="Import Data" />
          </nav>
        </aside>

        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/deals" element={<SmartDeals />} />
            <Route path="/forecast" element={<DemandForecast />} />
            <Route path="/pricing" element={<DynamicPricing />} />
            <Route path="/import" element={<ImportData />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function SideLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-4 py-3 rounded-xl transition",
          isActive
            ? "bg-brand-50 text-brand-700 font-semibold"
            : "text-slate-700 hover:bg-slate-50",
        ].join(" ")
      }
    >
      <span className="grid place-items-center size-6 text-slate-500">
        {icon}
      </span>
      <span>{label}</span>
    </NavLink>
  );
}