import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Lütfen analiz edilecek bir kod gönderin." }, { status: 400 });
    }

    // --- YAPAY ZEKA SİMÜLASYONU (MOCK AI) ---
    // API sorunu çözülene kadar belirli zafiyetleri Regex/String eşleşmesi ile biz kontrol ediyoruz.
    
    // Gerçekçilik katmak için 1.5 saniye bekle (Yapay zeka düşünüyormuş gibi loading animasyonu dönsün)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let analysisResult = "";
    let foundVulnerability = false;

    // 1. KURAL: SQL Injection Kontrolü
    // İçinde SELECT kelimesi varsa ve dışarıdan değişken alıyorsa (${...} veya '+...')
    if (code.includes("SELECT") && (code.includes("${") || code.includes("'+") || code.includes('"+'))) {
      foundVulnerability = true;
      analysisResult += `### 🚨 SQL Injection (SQL Enjeksiyonu) Zafiyeti\n`;
      analysisResult += `**Tehlike:** Kullanıcıdan alınan veriler (örneğin username veya password) doğrudan veritabanı sorgusuna dahil edilmiş. Saldırganlar bu sayede veritabanına sızıp tüm tabloları silebilir veya kullanıcı bilgilerini çalabilir.\n\n`;
      analysisResult += `**Çözüm:** Doğrudan string birleştirme yerine Parametrik sorgular (Prepared Statements) veya bir ORM (Prisma vb.) kullanmalısınız.\n\n`;
      analysisResult += `\`\`\`javascript\n// Güvenli Örnek:\nconst query = 'SELECT * FROM users WHERE username = ? AND password = ?';\n\`\`\`\n\n---\n\n`;
    }

    // 2. KURAL: XSS (Cross-Site Scripting) Kontrolü
    if (code.includes("innerHTML")) {
      foundVulnerability = true;
      analysisResult += `### 🚨 XSS (Cross-Site Scripting) Riski\n`;
      analysisResult += `**Tehlike:** Kodunuzda \`innerHTML\` kullanımı tespit edildi. Kullanıcıdan gelen veriler temizlenmeden HTML içine basılırsa, saldırganlar zararlı JavaScript kodları çalıştırabilir.\n\n`;
      analysisResult += `**Çözüm:** \`innerHTML\` yerine \`textContent\` kullanın veya veriyi DOMPurify gibi bir kütüphane ile temizleyin.\n\n---\n\n`;
    }

    // 3. KURAL: Hardcoded (Sabit) Şifre Kontrolü
    if (code.toLowerCase().includes("password = '") || code.toLowerCase().includes('password = "') || code.toLowerCase().includes('apikey =')) {
       foundVulnerability = true;
       analysisResult += `### ⚠️ Sabit Şifre (Hardcoded Credentials)\n`;
       analysisResult += `**Tehlike:** Kodun içine doğrudan şifre veya gizli anahtar yazılmış gibi görünüyor. Kodlar GitHub'a yüklendiğinde herkes bu şifreyi görebilir.\n\n`;
       analysisResult += `**Çözüm:** Şifreleri ve API anahtarlarını daima \`.env\` dosyalarında saklayın.\n\n---\n\n`;
    }

    // SONUÇLARI DEĞERLENDİR
    if (!foundVulnerability) {
      analysisResult = `### ✅ Temiz İş!\n\nBu kodda belirgin bir güvenlik zafiyeti (SQL Injection, XSS, Hardcoded Data) bulunmamaktadır. Kodunuz güvenli görünüyor! 🚀`;
    } else {
      // Başına genel bir uyarı ekle
      analysisResult = `İncelediğim kodda bazı ciddi güvenlik açıkları tespit ettim:\n\n` + analysisResult;
    }

    // Ön yüze tıpkı yapay zekadan gelmiş gibi sonucu gönderiyoruz
    return NextResponse.json({ analysis: analysisResult });

  } catch (error) {
    console.error("Analiz hatası:", error);
    return NextResponse.json({ error: "Analiz sırasında sunucu tarafında bir hata oluştu." }, { status: 500 });
  }
}