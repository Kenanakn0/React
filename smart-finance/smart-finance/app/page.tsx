"use client";

import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Trash2, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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
  // Başlangıçta boş bir dizi ile başlatıyoruz
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // Hydration hatasını önlemek için

  // Form State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Diğer");
  const [newType, setNewType] = useState<"income" | "expense">("expense");

  // 1. ADIM: Sayfa yüklendiğinde LocalStorage'dan verileri çek
  useEffect(() => {
    const savedTransactions = localStorage.getItem("smart-finance-data");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    setIsLoaded(true);
  }, []);

  // 2. ADIM: Her veri değiştiğinde LocalStorage'ı güncelle
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("smart-finance-data", JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  const income = useMemo(() => transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const expense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0), [transactions]);
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
    setNewCategory("Diğer");
  };

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Hydration hatasını önlemek için yükleme tamamlanana kadar içeriği gösterme
  if (!isLoaded) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-[#0f172a] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Smart Finance</h1>
            <p className="text-slate-400">Harcamalarınızı yerel olarak güvenle saklayın.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus size={20} /> <span className="font-semibold">İşlem Ekle</span>
          </button>
        </header>

        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Toplam Bakiye" amount={balance} icon={<Wallet />} color="blue" />
          <StatCard title="Toplam Gelir" amount={income} icon={<ArrowUpCircle />} color="emerald" />
          <StatCard title="Toplam Gider" amount={expense} icon={<ArrowDownCircle />} color="rose" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Harcama Dağılımı</h3>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 italic">Henüz harcama verisi yok.</div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Son İşlemler</h3>
            <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
              {transactions.length === 0 && <p className="text-center text-slate-500 py-10">Henüz bir işlem eklemediniz.</p>}
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-[#0f172a]/50 rounded-2xl group hover:bg-[#0f172a] transition-all border border-transparent hover:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${t.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                      {t.type === "income" ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                    </div>
                    <div>
                      <p className="font-bold">{t.title}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">{t.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                      {t.type === "income" ? "+" : "-"} ₺{t.amount.toLocaleString("tr-TR")}
                    </span>
                    <button onClick={() => deleteTransaction(t.id)} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Yeni İşlem Ekle</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddTransaction} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Açıklama</label>
                  <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500" placeholder="Örn: Yemek"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Miktar</label>
                    <input type="number" required value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Tür</label>
                    <select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500">
                      <option value="expense">Gider</option>
                      <option value="income">Gelir</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Kategori</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg mt-4 transition-all active:scale-95">Kaydet</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ title, amount, icon, color }: { title: string, amount: number, icon: any, color: string }) {
  const colorMap: any = { blue: "bg-blue-500/10 text-blue-500", emerald: "bg-emerald-500/10 text-emerald-400", rose: "bg-rose-500/10 text-rose-400" };
  return (
    <div className="bg-[#1e293b] p-7 rounded-3xl border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">{title}</span>
        <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>{icon}</div>
      </div>
      <h2 className={`text-3xl font-bold ${color === "emerald" ? "text-emerald-400" : color === "rose" ? "text-rose-400" : "text-white"}`}>₺{amount.toLocaleString("tr-TR")}</h2>
    </div>
  );
}