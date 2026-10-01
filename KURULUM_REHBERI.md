# GELİŞTİRME ORTAMI KURULUM REHBERİ
## Windows (CLI / winget tabanlı kolay kurulum)

Bu rehber, görme engelli ve gören bireyler için geliştireceğimiz çok oyunculu oyun platformunun yerel geliştirme ortamını Windows işletim sisteminde en hızlı ve en kolay şekilde nasıl kuracağınızı anlatmaktadır.

Kurulumları kolaylaştırmak için Windows'un resmi paket yöneticisi olan **`winget`** aracını kullanacağız.

---

## 1. PowerShell'i Yönetici Olarak Açın

Kurulum komutlarını çalıştırmadan önce:
1. Başlat menüsüne sağ tıklayın.
2. **Terminal (Yönetici)** veya **PowerShell (Yönetici)** seçeneğini seçin.

---

## 2. Geliştirme Araçlarının Kurulumu (CLI)

Aşağıdaki komutları sırasıyla PowerShell ekranına yapıştırıp `Enter` tuşuna basarak kurulumları başlatabilirsiniz:

### A. Node.js (LTS Sürümü)
Projemizin backend (Socket.io) ve frontend (Next.js) sunucusunu çalıştırmak için gereken çalışma ortamı.
```powershell
winget install OpenJS.NodeJS.LTS
```

### B. Git (Versiyon Kontrol Sistemi)
Kod geçmişini yönetmek ve dosyaları takip etmek için.
```powershell
winget install Git.Git
```

### C. Visual Studio Code (Kod Editörü)
Microsoft'un erişilebilirlik (ekran okuyucu) desteği en güçlü olan kod editörü.
```powershell
winget install Microsoft.VisualStudioCode
```

---

## 3. Docker Kurulumu (Manuel)

Docker Desktop uygulamasını kendi resmi web sitesinden indirip kurabilirsiniz:
* **İndirme Linki:** [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)

> **Not:** Docker Desktop kurulumundan sonra bilgisayarınızı yeniden başlatmanız gerekecektir. Kurulum sırasında WSL2 (Windows Subsystem for Linux) özelliğini etkinleştirmeniz önerilir.

---

## 4. Kurulumların Doğrulanması

Kurulumlar bittikten sonra yeni bir PowerShell penceresi açın ve aşağıdaki komutlarla araçların başarıyla kurulup kurulmadığını kontrol edin:

```powershell
# Node.js sürüm kontrolü (v20+ veya v22+ olmalıdır)
node -v

# npm (paket yöneticisi) kontrolü
npm -v

# Git sürüm kontrolü
git --version

# Docker sürüm kontrolü
docker --version
```

---

## 5. Veritabanlarının (PostgreSQL & Redis) Tek Komutla Başlatılması

Kurulumlar bittikten sonra, proje klasörünüzün kök dizininde `docker-compose.yml` adında bir dosya oluşturarak veritabanlarınızı saniyeler içinde ayağa kaldırabilirsiniz.

### `docker-compose.yml` Dosya İçeriği (Örnek Şablon):
```yaml
services:
  # PostgreSQL Veritabanı
  postgres:
    image: postgres:16-alpine
    container_name: oyun_platformu_db
    restart: always
    environment:
      POSTGRES_USER: oyun_user
      POSTGRES_PASSWORD: oyun_sifre123
      POSTGRES_DB: oyun_platformu
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  # Redis Bellek İçi Önbellek (Lobi ve Oda Durumları için)
  redis:
    image: redis:7-alpine
    container_name: oyun_platformu_redis
    restart: always
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### Veritabanlarını Çalıştırma Komutu:
Proje klasörünüzdeyken (PowerShell veya VS Code terminalinde) şu komutu çalıştırmanız yeterlidir:
```powershell
docker compose up -d
```
Bu komut PostgreSQL ve Redis'i arka planda otomatik olarak indirip çalıştıracaktır. Kapatmak istediğinizde ise şu komutu kullanabilirsiniz:
```powershell
docker compose down
```

---

## 6. Önerilen VS Code Erişilebilirlik ve Geliştirici Eklentileri

VS Code'u açıp `Ctrl + Shift + X` tuşlarına basarak eklenti mağazasından aşağıdaki eklentileri kurabilirsiniz:

1.  **Prettier - Code Formatter** (Kimlik: `esbenp.prettier-code-formatter`): Kod düzenini otomatik hizalar.
2.  **ESLint** (Kimlik: `dbaeumer.vscode-eslint`): Hatalı kod yazımlarını anında uyarır.
3.  **Tailwind CSS IntelliSense** (Kimlik: `bradlc.vscode-tailwindcss`): Arayüz tasarımlarında stil sınıflarını otomatik tamamlar.
4.  **A11y - Accessibility Linter** (Kimlik: `marius-lucian.a11y-accessibility-linter`): HTML yazarken erişilebilirlik hatalarını (örneğin resimlerde `alt` etiketi eksikliği, yanlış ARIA kullanımı) gerçek zamanlı olarak uyarır.
