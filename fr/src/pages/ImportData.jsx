import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Sparkles,
} from "lucide-react";

export default function ImportData() {
  const [tab, setTab] = useState("products"); // products | sales
  return (
    <div className="px-5 md:px-10 pb-16">
      {/* Title */}
      <div className="pt-8 pb-4">
        <div className="text-4xl md:text-5xl font-extrabold flex items-center gap-3">
          <Upload className="size-8 text-brand-600" />
          <span className="text-brand-600">Import</span> Data
        </div>
        <p className="mt-2 text-slate-600">
          Upload CSV files to populate your retail database
        </p>
      </div>

      {/* Tabs */}
      <div className="card p-2 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <Tab active={tab === "products"} onClick={() => setTab("products")}>
            Products Catalog
          </Tab>
          <Tab active={tab === "sales"} onClick={() => setTab("sales")}>
            Sales History
          </Tab>
        </div>
      </div>

      {tab === "products" ? <ProductsPanel /> : <SalesPanel />}
    </div>
  );
}

function ProductsPanel() {
  const [fileName, setFileName] = useState("");
  return (
    <div className="space-y-6">
      {/* Upload Product Catalog */}
      <div className="card overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-indigo-600" />
            Upload Product Catalog
          </div>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Need a template */}
          <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-4">
            <div className="font-medium text-slate-700 mb-2">Need a template?</div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Download our sample CSV file to see the required format
              </div>
              <button className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 hover:bg-slate-50">
                <Download className="size-4" /> Download Sample Products CSV
              </button>
            </div>
          </div>

          {/* Dropzone */}
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-300 transition p-8 text-center">
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <Upload className="size-8 text-indigo-400" />
              <div className="font-medium">
                {fileName || "Choose a CSV file"}
              </div>
              <div className="text-xs text-slate-500">Click to browse or drag and drop</div>
            </div>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFileName(f.name);
              }}
            />
          </label>

          <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-400 text-white py-3 font-medium shadow-md hover:bg-indigo-500">
            <Sparkles className="size-4" />
            Import Products with AI
          </button>

          {/* Required fields */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="font-semibold text-slate-800 mb-2">Required Fields:</div>
            <ul className="text-blue-700 space-y-1 text-sm leading-relaxed">
              <li>• <b>sku</b>: Unique product identifier</li>
              <li>• <b>name</b>: Product name</li>
              <li>• <b>category</b>: Product category</li>
              <li>• <b>price</b>: Current price</li>
              <li>• <b>region</b>: Norway, Sweden, Denmark, Finland, or Iceland</li>
              <li>• <b>channel</b>: Online, In-Store, or Both</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalesPanel() {
  const [fileName, setFileName] = useState("");
  return (
    <div className="space-y-6">
      {/* Upload Sales History */}
      <div className="card overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-emerald-600" />
            Upload Sales History
          </div>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Need a template */}
          <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-4">
            <div className="font-medium text-slate-700 mb-2">Need a template?</div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Download our sample CSV file to see the required format
              </div>
              <button className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 hover:bg-slate-50">
                <Download className="size-4" /> Download Sample Sales CSV
              </button>
            </div>
          </div>

          {/* Dropzone (green outline on hover) */}
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-400 transition p-8 text-center">
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <Upload className="size-8 text-emerald-400" />
              <div className="font-medium">
                {fileName || "Choose a CSV file"}
              </div>
              <div className="text-xs text-slate-500">Click to browse or drag and drop</div>
            </div>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFileName(f.name);
              }}
            />
          </label>

          <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white py-3 font-medium shadow-md hover:bg-emerald-600">
            <Sparkles className="size-4" />
            Import Sales with AI
          </button>

          {/* Required fields */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="font-semibold text-slate-800 mb-2">Required Fields:</div>
            <ul className="text-emerald-700 space-y-1 text-sm leading-relaxed">
              <li>• <b>date</b>: Sale date (YYYY-MM-DD)</li>
              <li>• <b>sku</b>: Product SKU</li>
              <li>• <b>region</b>: Sales region</li>
              <li>• <b>channel</b>: Online or In-Store</li>
              <li>• <b>units_sold</b>: Number of units</li>
              <li>• <b>price</b>: Price at time of sale</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-xl text-sm font-medium transition",
        active ? "bg-white shadow-sm" : "bg-slate-100 hover:bg-slate-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}