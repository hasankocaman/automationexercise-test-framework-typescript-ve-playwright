# Playwright vs Selenium: Proje Yapısı ve Mimari Karşılaştırması

Bu proje, Java ve Selenium geçmişine sahip otomasyon mühendislerinin Playwright ve TypeScript dünyasına kolayca adapte olabilmesi için hazırlanmıştır. 

## 📂 Klasör ve Dosya Yapısı

| Dosya/Klasör | Java/Maven Karşılığı | Açıklama |
| :--- | :--- | :--- |
| `package.json` | `pom.xml` | Projenin kimliği. Kütüphaneleri (dependencies) ve komutları (scripts) tutar. |
| `package-lock.json` | (Dependency Tree) | Kütüphane versiyonlarını kilitler, herkesin aynı versiyonu kullanmasını sağlar. |
| `node_modules/` | Maven Libraries | İndirilen kütüphanelerin fiziksel deposudur. Git'e atılmaz. |
| `playwright.config.ts`| `testng.xml` | Test konfigürasyonu (Tarayıcı, Paralel Koşum, Video, URL vb.). |
| `tests/` | `src/test/java` | Test senaryolarının (`.spec.ts`) bulunduğu klasör. |
| `tests/homepage.spec.ts`| `HomepageTest.java` | Örnek bir test dosyası. |

## 🏗 Mimari Farklılıklar (Önemli!)

### 1. Bağlantı Protokolü (WebDriver vs DevTools)
*   **Selenium:** `WebDriver` protokolü ile HTTP istekleri üzerinden tarayıcıyla konuşur (Yavaş, aracı var).
*   **Playwright:** `WebSocket` üzerinden tarayıcıyla **doğrudan** konuşur (Hızlı, aracı yok, Network kontrolü var).

### 2. Bekleme Stratejisi (Sync vs Async & Auto-Wait)
*   **Selenium:** Senkrondur. `Thread.sleep` veya `WebDriverWait` ile manuel bekleme gerekir.
*   **Playwright:** Asenkrondur (`await`). **Auto-Wait** özelliği sayesinde elementin hazır olmasını (görünürlük, tıklanabilirlik) otomatik bekler.

### 3. İzolasyon (Browser Context)
*   **Selenium:** Tek browser instance'ı paylaşılır (Cookie çakışması riski).
*   **Playwright:** **Browser Context** kullanır. Tek tarayıcı içinde her test için milisaniyeler içinde izole, tertemiz bir "Incognito" oturumu açar.

---

## 🛠 Son Yapılan Değişiklikler ve Hata Giderme Günlüğü (Troubleshooting Log)

Proje geliştirilirken karşılaştığımız test hatalarını ve bunları nasıl adım adım çözdüğümüzü aşağıda bulabilirsin. Bu, gerçek dünyada karşılaşacağın senaryolara örnektir.

### Vaka 1: Dosya Yükleme (File Upload) Hatası

**Durum:** `tests/advanced_scenarios.spec.ts` dosyasında dosya yükleme testi yazdık.
**Hata:** Test, yükleme sonrası başarı mesajını bulamadığı için fail oldu.
**Beklenti:** `[data-testid="upload-status"]` elementinde dosya isminin yazması.
**Gerçekleşen:** Playwright bu elementi bulamadı (Timeout).

**Nasıl Çözdük? (Adım Adım):**
1.  **Analiz:** Siteye manuel olarak veya Browser Subagent (yardımcı robot) ile gittik.
2.  **Keşif:** Dosya yükledikten sonra çıkan yeşil başarı mesajına sağ tıklayıp "İncele" (Inspect) dedik.
3.  **Farkındalık:** Elementin `data-testid` değerinin bizim tahmin ettiğimiz gibi `upload-status` DEĞİL, **`uploaded-file-info`** olduğunu gördük.
4.  **Düzeltme:** Test dosyasındaki locator'ı `page.getByTestId('uploaded-file-info')` olarak güncelledik.
5.  **Sonuç:** Test geçti (Passed).

### Vaka 2: Shadow DOM Metin Kontrolü Hatası

**Durum:** Shadow DOM içindeki butona tıklama testi.
**Hata:** Test, butona tıkladıktan sonra metnin "Clicked!" olarak değişmesini beklediği için fail oldu.
**Beklenti:** `await expect(button).toHaveText('Clicked!')` satırının geçmesi.
**Gerçekleşen:** Buton metni değişmedi, hala "Click Me..." yazıyordu.

**Nasıl Çözdük? (Adım Adım):**
1.  **Şüphe:** Acaba buton tıklanmıyor mu? Yoksa tıklanıyor ama metin mi değişmiyor?
2.  **Kontrol:** Siteye gidip butona tıkladık.
3.  **Farkındalık:** Butonun aslında sadece *tıklanabilir* bir demo butonu olduğunu, tıklandığında üzerindeki yazının DEĞİŞMEDİĞİNİ fark ettik. Test senaryomuz, sitenin gerçek davranışıyla uyuşmuyordu.
4.  **Düzeltme:** Hatalı olan `toHaveText('Clicked!')` assertion'ını kaldırdık. Yerine butonun görünür olduğunu ve tıklanabildiğini doğrulayan adımlar ekledik.
5.  **Sonuç:** Test, sitenin gerçek davranışına uygun hale geldi ve geçti.

---

## 🔍 Playwright ile Locator Nasıl Alınır? (Basit Rehber)

Bir elementi test kodunda bulmak için (Locate etmek) şu stratejiyi izleriz:

### Senaryo: "Advanced Scenarios" butonuna tıklamak istiyorum.

**Adım 1: Elementi İncele**
Tarayıcıda bonuna sağ tıkla -> **İncele (Inspect)** de.

**Adım 2: HTML Koduna Bak**
Şöyle bir kod gördüğünü varsayalım:
```html
<button id="adv-btn" class="nav-btn" data-testid="advanced-tab">
    Advanced Scenarios
</button>
```

**Adım 3: Strateji Seçimi (Öncelik Sırasına Göre)**

1.  **Playwright'ın Favorisi (Kullanıcı Odaklı):**
    Eğer elementte belirgin bir yazı varsa, en kolayı budur.
    ```typescript
    await page.getByText('Advanced Scenarios').click();
    ```

2.  **Test ID (Varsa En Sağlamı):**
    Geliştiriciler `data-testid` eklediyse, bu test için özeldir ve değişme ihtimali azdır.
    ```typescript
    await page.getByTestId('advanced-tab').click();
    ```

3.  **Role (Erişilebilirlik Odaklı):**
    Buton, Link, Başlık gibi roller üzerinden gitmek.
    ```typescript
    await page.getByRole('button', { name: 'Advanced Scenarios' }).click();
    ```

4.  **CSS Selector (Klasik Yöntem):**
    ID veya Class üzerinden gitmek.
    *   ID ile: `page.locator('#adv-btn')`
    *   Class ile: `page.locator('.nav-btn')` (Dikkat: Birden fazla elementte aynı class olabilir!)

5.  **XPath (Son Çare):**
    Çok karmaşık ve kırılgan olabilir, mecbur kalmadıkça önermeyiz.
    ```typescript
    page.locator('//button[text()="Advanced Scenarios"]')
    ```

### Özet Tablo

| HTML Özelliği | Playwright Komutu | Not |
| :--- | :--- | :--- |
| `data-testid="submit"` | `getByTestId('submit')` | **En Tavsiye Edilen** |
| `<button>Kaydet</button>` | `getByRole('button', { name: 'Kaydet' })` | Çok Sağlam |
| `<div>Hoşgeldiniz</div>` | `getByText('Hoşgeldiniz')` | Basit ve Hızlı |
| `id="user-name"` | `locator('#user-name')` | Standart |
| `placeholder="Adınız"` | `getByPlaceholder('Adınız')` | Inputlar için harika |

## 🚀 Özet: Java Geliştiricisi İçin Sözlük

| TypeScript/Playwright | Java/Selenium |
| :--- | :--- |
| `npm install` | `mvn clean install` |
| `playwright.config.ts` | `testng.xml` |
| `spec.ts` dosyası | `Test` Class |
| `test('name', ...)` | `@Test` method |
| `await page.goto(...)` | `driver.get(...)` |
| `await expect(loc).toBeVisible()` | `Assert.assertTrue(elem.isDisplayed())` |
| `console.log(...)` | `System.out.println(...)` |
