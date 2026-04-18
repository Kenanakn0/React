"use client";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import dynamic from "next/dynamic";

// Editörü SSR kapalı olarak yüklüyoruz
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function Home() {
  const [code, setCode] = useState("// Test edilecek kodunuzu buraya yapıştırın...\n\nfunction login(username, password) {\n  // güvensiz bir işlem - SQL Injection test\n  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;\n  return query;\n}");
  
  // Yüklenme ve sonuç durumlarını tutacağımız state'ler
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rapor, setRapor] = useState<string | null>(null);

  // Butona basıldığında çalışacak fonksiyon
  const handleAnalyzeClick = async () => {
    if (!code.trim()) return; // Kod boşsa çalışma
    
    setIsAnalyzing(true);
    setRapor(null);

    try {
      // Arka plandaki API'mize (beyne) kodumuzu gönderiyoruz
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        setRapor(data.analysis); // Gelen başarılı cevabı state'e yaz
      } else {
        setRapor(`❌ Hata: ${data.error}`);
      }
    } catch (error) {
      console.error("İstek hatası:", error);
      setRapor("❌ Sunucuya bağlanırken bir hata oluştu.");
    } finally {
      setIsAnalyzing(false); // İşlem bitince yüklenme durumunu kapat
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-950 text-white font-sans p-4">
      <header className="mb-6 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-blue-400">🛡️ AI Code Guard</h1>
        <p className="text-gray-400 text-sm">Yapay Zeka Destekli Güvenlik Zafiyeti Tarayıcı</p>
      </header>

      <div className="flex flex-1 gap-4">
        {/* Sol Taraf: Editör */}
        <div className="flex-1 border border-gray-800 rounded-lg overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>

        {/* Sağ Taraf: Sonuç Paneli */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">🤖 Analiz Raporu</h2>
          
          <div className="flex-1 overflow-y-auto p-4 border border-gray-800 rounded-md bg-gray-950">
            {isAnalyzing ? (
              <div className="flex items-center justify-center h-full text-blue-400 animate-pulse">
                Yapay Zeka kodu inceliyor... 🕵️‍♂️
              </div>
            ) : rapor ? (
              <div className="text-gray-200">
                <ReactMarkdown>{rapor}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Analiz başlatmak için aşağıdaki butona tıklayın.
              </div>
            )}
          </div>

          <button 
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing}
            className={`mt-4 w-full font-bold py-3 px-4 rounded transition-colors ${
              isAnalyzing ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isAnalyzing ? "Analiz Ediliyor..." : "Kodu Analiz Et"}
          </button>
        </div>
      </div>
    </main>
  );
}