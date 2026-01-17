# Playwright vs Selenium: Proje Yapısı ve Mimari Karşılaştırması

Bu proje, Java ve Selenium geçmişine sahip otomasyon mühendislerinin Playwright ve TypeScript dünyasına kolayca adapte olabilmesi için hazırlanmıştır. Aşağıda proje dosyalarının ve mimari kavramların karşılaştırmalı açıklamalarını bulabilirsin.

## 📂 Klasör ve Dosya Yapısı

### 1. `package.json`
*   **Java/Maven Karşılığı:** `pom.xml`
*   **Ne İşe Yarar?** Projenin kimliğidir. Kullanılacak kütüphaneleri (dependencies) ve proje içi çalıştırılabilir komutları (scripts) burada tanımlarız.
*   **Örnek:** `mvn test` komutunu `scripts` bölümünde tanımladığımız kısayollarla (örn: `npm test`) çalıştırırız.

### 2. `package-lock.json`
*   **Java/Maven Karşılığı:** Tam bir karşılığı yoktur ama "Maven Dependency Tree"nin donmuş halidir.
*   **Ne İşe Yarar?** Projede kullanılan kütüphanelerin tam versiyonlarını kilitler. Bu sayede proje başka bir bilgisayarda kurulduğunda (örneğin CI/CD ortamında) *birebir* aynı versiyonların yüklenmesini garanti eder.

### 3. `node_modules/`
*   **Java/Maven Karşılığı:** `Maven Dependencies` (External Libraries)
*   **Ne İşe Yarar?** `npm install` dediğimizde internetten indirilen tüm kütüphaneler buraya fiziksel olarak kaydedilir. Java'da bu genellikle `.m2` klasöründe global olarak tutulurken, Node.js projelerinde projenin içine indirilir. **Bu klasörü asla Git'e göndermeyiz (`.gitignore` dosyasında ekli olmalıdır).**

### 4. `playwright.config.ts`
*   **Java/Maven Karşılığı:** `testng.xml` + `BaseTest/ConfigReader` sınıfları
*   **Ne İşe Yarar?** Testlerin beyni burasıdır.
    *   Hangi tarayıcılarda koşulacak? (Chrome, Firefox, Safari...)
    *   Paralel mi koşulacak?
    *   Ekran görüntüsü veya video alınacak mı?
    *   Base URL nedir?
    *   Test fail olursa kaç kere 'retry' edilecek?
    Tüm bu ayarları kod yazmadan buradan yönetiriz.

### 5. `tests/` Klasörü
*   **Java/Maven Karşılığı:** `src/test/java`
*   **Ne İşe Yarar?** Test senaryolarımızın (spec dosyaları) bulunduğu yerdir. Playwright varsayılan olarak bu klasördeki `.spec.ts` ile biten dosyaları test olarak algılar.

### 6. `tests/homepage.spec.ts`
*   **Java/Maven Karşılığı:** `HomepageTest.java` (Test Class)
*   **Yapı:**
    *   `test(...)` bloğu -> `@Test` metoduna eşittir.
    *   `test.beforeEach(...)` bloğu -> `@BeforeMethod` metoduna eşittir.
    *   `test.afterAll(...)` bloğu -> `@AfterClass` metoduna eşittir.

## 🏗 Mimari Farklılıklar (Önemli!)

### 1. Bağlantı Protokolü (WebDriver vs DevTools)
*   **Selenium:** Tarayıcı ile konuşmak için **WebDriver** protokolünü kullanır. Arada bir "Driver" (chromedriver.exe) vardır ve HTTP istekleri ile tarayıcıya "şunu yap", "bunu yap" der. Bu bazen yavaşlıklara ve "flaky" (kararsız) testlere yol açabilir.
*   **Playwright:** Tarayıcı ile **Doğrudan (WebSocket)** üzerinden konuşur (Chrome DevTools Protocol vb.). Arada bir çevirmen yoktur. Bu sayede çok daha hızlıdır ve tarayıcının ağ trafiğine (network) bile müdahale edebilir.

### 2. Bekleme Stratejisi (Sync vs Async & Auto-Wait)
*   **Selenium (Sync):** Kod satır satır çalışır. Element henüz sayfada yoksa hata verir. `Thread.sleep` veya `WebDriverWait` (Explicit Wait) ile manuel olarak bekleme eklemeniz gerekir.
*   **Playwright (Async):** Modern web uygulamaları asenkron çalışır, Playwright da öyle. `await` anahtar kelimesi ile işlemlerin tamamlanmasını bekler. En büyük gücü **Auto-Wait** özelliğidir. Bir butona tıkla dediğinizde; Playwright o butonun DOM'da oluşmasını, görünür olmasını, animasyonunun bitmesini ve tıklanabilir olmasını **otomatik olarak** bekler. Sizin bekleme kodu yazmanıza gerek kalmaz.

### 3. İzolasyon (Browser Context)
*   **Selenium:** Her test için yeni bir browser açıp kapatmak maliyetlidir, bu yüzden genelde aynı driver instance'ı paylaşılır. Bu da çerezlerin (cookies) diğer testleri etkilemesine yol açabilir.
*   **Playwright:** **Browser Context** kavramını kullanır. Tek bir tarayıcı (Browser) açar ama her test için milisaniyeler içinde yepyeni, tamamen izole (Incognito benzeri) bir "bağlam" (Context) oluşturur. Her testin çerezleri, local storage'ı ayrıdır. Test bitince bu bağlam yok edilir. Çok hızlıdır.

## 🚀 Özet: Java Geliştiricisi İçin Sözlük

| TypeScript/Playwright | Java/Selenium |
| :--- | :--- |
| `npm install` | `mvn clean install` (bağımlılıkları indirme kısmı) |
| `package.json` | `pom.xml` |
| `playwright.config.ts` | `testng.xml` |
| `spec.ts` dosyası | `Test` Class |
| `test('name', ...)` | `@Test public void name()...` |
| `await page.goto(...)` | `driver.get(...)` |
| `await expect(loc).toBeVisible()` | `Assert.assertTrue(elem.isDisplayed())` |
| `console.log(...)` | `System.out.println(...)` |
