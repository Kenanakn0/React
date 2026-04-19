"use client";

import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Trash2, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Veri Tipi Tanımı
type Transaction = {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const CATEGORIES = ["Mutfak", "Barınma", "Fatura", "Eğlence", "Ulaşım", "Maaş", "Diğer"];

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMounted, setIsMounted] = useState(false); // Hydration hatasını önlemek için
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State'leri
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Diğer");
  const [newType, setNewType] = useState<"income" | "expense">("expense");

  // 1. ADIM: Sayfa yüklendiğinde LocalStorage'dan verileri çek
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("smart_finance_v2");
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  // 2. ADIM: Veri değiştikçe LocalStorage'a kaydet
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("smart_finance_v2", JSON.stringify(transactions));
    }
  }, [transactions, isMounted]);

  // Hesaplamalar (useMemo ile performans optimizasyonu)
  const income = useMemo(() => 
    transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0), 
  [transactions]);

  const expense = useMemo(() => 
    transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0), 
  [transactions]);

  const balance = income - expense;

  const chartData = useMemo(() => {
    const categories = transactions.filter(t => t.type === "expense").reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    return Object.keys(categories).map(key => ({ name: key, value: categories[key] }));
  }, [transactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;

    const transaction: Transaction = {
      id: Date.now(),
      title: newTitle,
      amount: parseFloat(newAmount),
      category: newCategory,
      type: newType,
    };

    setTransactions([transaction, ...transactions]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewAmount("");
  };

  // Hydration Guard: Sunucu tarafında render edilirken hata vermemesi için
  if (!isMounted) return <div className="min-h-screen bg-[#0f172a]" />;

  return (
    <main className="min-h-screen bg-[#0f172a] text-gray-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Smart Finance</h1>
            <p className="text-slate-400">Harcamalarınızı kontrol altına alın.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} /> <span className="font-bold">İşlem Ekle</span>
          </button>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Güncel Bakiye" amount={balance} color="blue" icon={<Wallet />} />
          <StatCard title="Toplam Gelir" amount={income} color="emerald" icon={<ArrowUpCircle />} />
          <StatCard title="Toplam Gider" amount={expense} color="rose" icon={<ArrowDownCircle />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CHART SECTION */}
          <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold mb-8">Harcama Analizi</h3>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                      {chartData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px" }} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 italic">Veri girişi bekleniyor...</div>
              )}
            </div>
          </div>

          {/* LIST SECTION */}
          <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold mb-8">Son Hareketler</h3>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.length === 0 && <p className="text-slate-500 text-center py-10">Henüz bir işlem yok.</p>}
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-5 bg-[#0f172a]/40 rounded-3xl border border-transparent hover:border-slate-700 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${t.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                      {t.type === "income" ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}
                    </div>
                    <div>
                      <p className="font-bold text-white">{t.title}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{t.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-black ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                      {t.type === "income" ? "+" : "-"} ₺{t.amount.toLocaleString("tr-TR")}
                    </span>
                    <button onClick={() => setTransactions(transactions.filter(x => x.id !== t.id))} className="text-slate-700 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ADD MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#1e293b] w-full max-w-md rounded-[2.5rem] border border-slate-700 p-10 animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black">Yeni Kayıt</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={28} />
                </button>
              </div>
              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Açıklama</label>
                  <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" placeholder="Örn: Kira Gideri" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Miktar</label>
                    <input type="number" required value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tür</label>
                    <select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none appearance-none cursor-pointer">
                      <option value="expense">Gider</option>
                      <option value="income">Gelir</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kategori</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none appearance-none cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] mt-4">KAYDET</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Stats Card Component
function StatCard({ title, amount, color, icon }: { title: string, amount: number, color: string, icon: any }) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    rose: "text-rose-400 bg-rose-500/10"
  };
  return (
    <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{title}</span>
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      <h2 className={`text-3xl font-black ${color === "blue" ? "text-white" : color === "emerald" ? "text-emerald-400" : "text-rose-400"}`}>
        ₺{amount.toLocaleString("tr-TR")}
      </h2>
    </div>
  );
}