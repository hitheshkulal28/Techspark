import { Search, Star, Image } from "lucide-react";

const deals = [
  {
    rank: 1, category: "Beverages", brand: "Nordic Roast", name: "Premium Coffee Beans 500g",
    desc: "Fair trade Arabica beans, medium roast", rating: 4.7, stock: 95, price: "71.20", oldPrice: "89.00",
    currency: "EUR", region: "Finland", channel: "Both", discount: "-20%", score: 68.9, image: "https://typescoffee.com/wp-content/uploads/2023/03/premium-coffee-beans.jpg"
  },
  {
    rank: 2, category: "Meat & Fish", brand: "Ocean Nordic", name: "Fresh Salmon Fillet",
    desc: "Wild-caught Norwegian salmon, premium quality", rating: 4.8, stock: 80, price: "160.65", oldPrice: "189.00",
    currency: "NOK", region: "Norway", channel: "Both", discount: "-15%", score: 66.2, image: "https://www.marionmizzi.com/wp-content/uploads/2019/11/wild-alaskan-salmon.jpg"
  },
  {
    rank: 3, category: "Fresh Produce", brand: "Nordic Fresh", name: "Organic Apples 1kg",
    desc: "Premium organic apples from local Norwegian farms. Crisp, sweet, and…",
    rating: 4.5, stock: 150, price: "40.50", oldPrice: "45.00",
    currency: "NOK", region: "Norway", channel: "Both", discount: "-10%", score: 64.8,
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=1200&auto=format&fit=crop"
  },
  {
    rank: 4, category: "Bakery", brand: "Baker's Choice", name: "Sourdough Bread",
    desc: "Artisan sourdough bread baked fresh daily", rating: 4.6, stock: 120, price: "45.00",
    currency: "DKK", region: "Denmark", channel: "In-Store", discount: null, score: 61.9, image: "https://www.healthbenefitstimes.com/glossary/wp-content/uploads/2020/08/Sourdough-bread.jpg"
  },
  {
    rank: 5, category: "Dairy", brand: "Nordic Dairy", name: "Organic Milk 1L",
    desc: "Fresh organic milk from grass-fed cows", rating: 4.2, stock: 200, price: "30.40", oldPrice: "32.00",
    currency: "SEK", region: "Sweden", channel: "In-Store", discount: "-5%", score: 61.5, image: "https://tse3.mm.bing.net/th/id/OIP.RhzN81Yf_N8CH-LYdMM6rwHaE7?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3"
  },
  {
    rank: 6, category: "Pantry", brand: "Bella Italia", name: "Italian Pasta 500g",
    desc: "Premium durum wheat pasta", rating: 4.3, stock: 300, price: "28.00",
    currency: "SEK", region: "Sweden", channel: "Online", discount: null, score: 60.4, image: "https://img.freepik.com/premium-photo/creamy-fettuccine-alfredo-with-fresh-parsley-parmesan-classic-italian-comfort-food-delight_875755-11136.jpg"
  },
];

export default function SmartDeals() {
  return (
    <div className="px-5 md:px-10 pb-16">
      {/* Title */}
      <div className="pt-8 pb-6">
        <div className="text-4xl md:text-5xl font-extrabold flex items-center gap-3">
          <span className="text-brand-600">Smart</span> Deals Finder
        </div>
        <p className="mt-2 text-slate-600">
          AI-powered deal ranking using price, quality, discount, and availability
        </p>
      </div>

      {/* Search + Filters */}
      <div className="card p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400"/>
            <input placeholder="Search products by name, category, or brand..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <select className="min-w-[190px] rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500">
            <option>All Regions</option><option>Norway</option><option>Sweden</option><option>Finland</option><option>Denmark</option><option>Iceland</option>
          </select>
          <select className="min-w-[190px] rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500">
            <option>All Channels</option><option>Online</option><option>In-Store</option><option>Both</option>
          </select>
          <select className="min-w-[190px] rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500">
            <option>All Categories</option><option>Fresh Produce</option><option>Meat & Fish</option><option>Dairy</option><option>Bakery</option><option>Pantry</option><option>Beverages</option>
          </select>
          <button className="rounded-xl bg-linear-to-r from-brand-600 to-indigo-600 text-white px-6 py-3 font-medium shadow-md">
            <span className="mr-2">✨</span> AI Rank Deals
          </button>
        </div>
      </div>

      {/* Found + Sort */}
      <div className="flex items-center justify-between mt-6 mb-2">
        <div className="text-slate-700">Found <span className="font-semibold">{deals.length}</span> deals</div>
        <div className="text-sm text-slate-500">Sorted by Deal Score</div>
      </div>

      {/* Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        {deals.map((d) => (
          <div className="card overflow-hidden" key={d.rank}>
            {/* image / placeholder */}
            {d.image ? (
              <img src={d.image} alt="" className="h-44 w-full object-cover"/>
            ) : (
              <div className="h-44 grid place-items-center bg-slate-50">
                <Image className="size-10 text-slate-300" />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between">
                <span className="badge bg-amber-100 text-amber-700">#{d.rank}</span>
                {d.discount && (
                  <span className="badge bg-rose-100 text-rose-600">{d.discount}</span>
                )}
              </div>

              <div className="mt-4 flex gap-3 text-sm text-slate-600">
                <span className="badge bg-slate-100">{d.category}</span>
                <span className="text-slate-500">{d.brand}</span>
              </div>

              <div className="mt-2 text-xl font-semibold">{d.name}</div>
              <p className="mt-1 text-slate-600 line-clamp-2">{d.desc}</p>

              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="size-4 fill-amber-400/30" />
                  <span className="font-medium text-slate-700">{d.rating}</span>
                </div>
                <div className="text-emerald-600 font-medium">{d.stock} in stock</div>
              </div>

              <div className="soft-divider mt-4 pt-4 flex items-end justify-between">
                <div>
                  <div className="text-3xl font-extrabold tracking-tight">
                    {d.price} {d.currency}
                  </div>
                  {d.oldPrice && (
                    <div className="text-slate-400 line-through -mt-1">{d.oldPrice}</div>
                  )}
                  {d.oldPrice && (
                    <div className="text-emerald-600 font-medium mt-1">
                      Save {(Number(d.oldPrice) - Number(d.price)).toFixed(2)} {d.currency}
                    </div>
                  )}
                </div>
                <div className="text-right text-sm text-slate-600">
                  <div>{d.region} • {d.channel}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">Deal Score</span>
                <span className="font-semibold text-indigo-600">{d.score.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}