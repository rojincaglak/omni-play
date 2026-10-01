# 🎮 OmniPlay - Erişilebilir Çok Oyunculu Oyun Platformu

Görme engelli ve gören bireylerin bir arada, eş zamanlı ve engelsiz bir şekilde oynayabileceği, WCAG 2.2 AAA erişilebilirlik standartlarına uygun çok oyunculu web tabanlı oyun platformu. İlk odaklanan oyun: **Tabu**.

---

## 🌟 Öne Çıkan Özellikler

- **Erişilebilirlik (A11y - WCAG 2.2 AAA):** Ekran okuyucularla (NVDA, JAWS, VoiceOver, TalkBack) ve klavye kısayollarıyla %100 uyumlu arayüz.
- **Gerçek Zamanlı İletişim:** Socket.io tabanlı anlık oda kurma, oyuncu katılımı ve lobi yönetimi.
- **Modern Teknoloji Yığını:** Next.js (Frontend), Node.js & TypeScript (Backend), Docker Compose (PostgreSQL & Redis).
- **Genişletilebilir Mimari:** Yeni oyunların (kelime oyunları, kart oyunları, satranç vb.) kolayca entegre edilebileceği modüler altyapı.

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- **Node.js** (v20+ veya v22+ LTS)
- **Docker & Docker Compose** (PostgreSQL ve Redis için)
- **Git**

### Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   # Kök bağımlılıklar
   npm install

   # Backend bağımlılıkları
   cd backend && npm install

   # Frontend bağımlılıkları
   cd ../frontend && npm install
   ```

2. **Veritabanlarını başlatın (Docker):**
   ```bash
   docker compose up -d
   ```

3. **Geliştirme sunucularını başlatın:**
   Kök dizindeyken tek komutla hem backend hem frontend sunucusunu çalıştırabilirsiniz:
   ```bash
   npm run dev
   ```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

---

## 📖 Dökümantasyon

- [Mimari Tasarım ve Analiz](MIMARI_TASARIM.md)
- [Geliştirme Ortamı Kurulum Rehberi](KURULUM_REHBERI.md)
