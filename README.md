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

---

# Selenium Java ve Playwright TypeScript Locator Karşılaştırması

Selenium ve Playwright'taki locator stratejilerini detaylıca karşılaştıralım.

## 1. Örnek HTML Kodları

Önce üzerinde çalışacağımız örnek HTML sayfasını görelim:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Sayfası</title>
</head>
<body>
    <!-- ID ile -->
    <input id="username" type="text" placeholder="Kullanıcı Adı">
    
    <!-- Name ile -->
    <input name="password" type="password" placeholder="Şifre">
    
    <!-- Class ile -->
    <button class="login-button primary-btn">Giriş Yap</button>
    
    <!-- CSS Selector ile -->
    <div class="user-info">
        <span class="user-name">Ahmet Yılmaz</span>
        <span class="user-email">ahmet@example.com</span>
    </div>
    
    <!-- XPath için -->
    <ul class="menu">
        <li><a href="/home">Ana Sayfa</a></li>
        <li><a href="/products">Ürünler</a></li>
        <li><a href="/contact">İletişim</a></li>
    </ul>
    
    <!-- Text içeriği ile -->
    <button>Kaydet</button>
    <button>İptal</button>
    
    <!-- Data attribute ile -->
    <div data-testid="user-profile" data-user-id="12345">
        <h2>Profil Bilgileri</h2>
    </div>
    
    <!-- Dinamik elementler -->
    <table id="products-table">
        <tr>
            <td>Ürün 1</td>
            <td>100 TL</td>
            <td><button class="buy-btn">Satın Al</button></td>
        </tr>
        <tr>
            <td>Ürün 2</td>
            <td>200 TL</td>
            <td><button class="buy-btn">Satın Al</button></td>
        </tr>
    </table>
</body>
</html>
```

## 2. Selenium Java - Locator Stratejileri

### 2.1 Temel Locator Yöntemleri

```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class SeleniumLocators {
    
    WebDriver driver = new ChromeDriver();
    
    // 1. ID ile locator
    public void findById() {
        WebElement usernameInput = driver.findElement(By.id("username"));
        usernameInput.sendKeys("test@example.com");
    }
    
    // 2. Name ile locator
    public void findByName() {
        WebElement passwordInput = driver.findElement(By.name("password"));
        passwordInput.sendKeys("123456");
    }
    
    // 3. ClassName ile locator
    public void findByClassName() {
        WebElement loginButton = driver.findElement(By.className("login-button"));
        loginButton.click();
    }
    
    // 4. CSS Selector ile locator
    public void findByCssSelector() {
        // Tek class
        WebElement userName = driver.findElement(By.cssSelector(".user-name"));
        
        // Birden fazla class
        WebElement loginBtn = driver.findElement(By.cssSelector(".login-button.primary-btn"));
        
        // Parent > Child
        WebElement userEmail = driver.findElement(By.cssSelector(".user-info > .user-email"));
        
        // Attribute selector
        WebElement userProfile = driver.findElement(By.cssSelector("[data-testid='user-profile']"));
        
        // ID + Class kombinasyonu
        WebElement element = driver.findElement(By.cssSelector("#username.input-field"));
    }
    
    // 5. XPath ile locator
    public void findByXPath() {
        // Absolute XPath (tavsiye edilmez)
        WebElement element1 = driver.findElement(By.xpath("/html/body/div[1]/input"));
        
        // Relative XPath (önerilen)
        WebElement username = driver.findElement(By.xpath("//input[@id='username']"));
        
        // Text içeriği ile
        WebElement saveButton = driver.findElement(By.xpath("//button[text()='Kaydet']"));
        
        // Contains ile
        WebElement element2 = driver.findElement(By.xpath("//button[contains(text(), 'Giriş')]"));
        
        // Attribute ile
        WebElement profile = driver.findElement(By.xpath("//div[@data-testid='user-profile']"));
        
        // Parent-Child ilişkisi
        WebElement email = driver.findElement(By.xpath("//div[@class='user-info']/span[@class='user-email']"));
        
        // Index ile (dikkatli kullanın)
        WebElement secondProduct = driver.findElement(By.xpath("(//button[@class='buy-btn'])[2]"));
    }
    
    // 6. Link Text ile (sadece <a> tagları için)
    public void findByLinkText() {
        WebElement homeLink = driver.findElement(By.linkText("Ana Sayfa"));
        homeLink.click();
    }
    
    // 7. Partial Link Text ile
    public void findByPartialLinkText() {
        WebElement productsLink = driver.findElement(By.partialLinkText("Ürün"));
        productsLink.click();
    }
    
    // 8. Tag Name ile
    public void findByTagName() {
        WebElement button = driver.findElement(By.tagName("button"));
        // Birden fazla element
        List<WebElement> allButtons = driver.findElements(By.tagName("button"));
    }
}
```

## 3. Playwright TypeScript - Locator Stratejileri

### 3.1 Temel Locator Yöntemleri

```typescript
import { test, expect, Page, Locator } from '@playwright/test';

test.describe('Playwright Locators', () => {
    
    let page: Page;
    
    test.beforeEach(async ({ page: testPage }) => {
        page = testPage;
        await page.goto('http://example.com');
    });
    
    // 1. Role-based locator (Playwright'ın önerdiği yöntem - en güçlü)
    test('Role-based locators', async () => {
        // Button rolü
        await page.getByRole('button', { name: 'Giriş Yap' }).click();
        await page.getByRole('button', { name: /Kaydet/i }).click(); // Regex ile
        
        // Textbox rolü
        await page.getByRole('textbox', { name: 'Kullanıcı Adı' }).fill('test@example.com');
        
        // Link rolü
        await page.getByRole('link', { name: 'Ana Sayfa' }).click();
        
        // Heading rolü
        const heading = page.getByRole('heading', { name: 'Profil Bilgileri' });
    });
    
    // 2. Text içeriği ile locator (çok kullanışlı)
    test('Text-based locators', async () => {
        // Tam metin
        await page.getByText('Kaydet').click();
        
        // Kısmi metin
        await page.getByText('Giriş', { exact: false }).click();
        
        // Regex ile
        await page.getByText(/ana sayfa/i).click();
    });
    
    // 3. Label ile locator (form alanları için ideal)
    test('Label-based locators', async () => {
        await page.getByLabel('Kullanıcı Adı').fill('ahmet');
        await page.getByLabel('Şifre').fill('123456');
    });
    
    // 4. Placeholder ile locator
    test('Placeholder-based locators', async () => {
        await page.getByPlaceholder('Kullanıcı Adı').fill('test');
        await page.getByPlaceholder(/şifre/i).fill('password');
    });
    
    // 5. Test ID ile locator (en güvenilir - önerilen)
    test('Test ID locators', async () => {
        await page.getByTestId('user-profile').click();
        
        const userName = await page.getByTestId('user-profile').textContent();
    });
    
    // 6. CSS Selector ile
    test('CSS Selector locators', async () => {
        // ID
        await page.locator('#username').fill('test');
        
        // Class
        await page.locator('.login-button').click();
        
        // Birden fazla class
        await page.locator('.login-button.primary-btn').click();
        
        // Attribute
        await page.locator('[data-user-id="12345"]').click();
        
        // Kombinasyon
        await page.locator('div.user-info > span.user-name').textContent();
        
        // Nth child
        await page.locator('.buy-btn >> nth=1').click(); // İkinci eleman
    });
    
    // 7. XPath ile (gerekmedikçe kullanmayın)
    test('XPath locators', async () => {
        await page.locator('xpath=//input[@id="username"]').fill('test');
        await page.locator('xpath=//button[text()="Kaydet"]').click();
        await page.locator('xpath=//div[@data-testid="user-profile"]').click();
    });
    
    // 8. Filtering (Playwright'a özgü güçlü özellik)
    test('Filtering locators', async () => {
        // Text içeren butonları filtrele
        await page.getByRole('button').filter({ hasText: 'Kaydet' }).click();
        
        // Belirli bir child elementi olan divleri bul
        await page.locator('div').filter({ has: page.locator('.user-name') }).click();
        
        // Belirli text içermeyen elementler
        await page.getByRole('button').filter({ hasNotText: 'İptal' }).click();
    });
    
    // 9. Chaining (Zincirleme)
    test('Chaining locators', async () => {
        // Parent'tan child'a
        const userInfo = page.locator('.user-info');
        await userInfo.locator('.user-email').click();
        
        // Daha kompleks
        await page
            .locator('.user-info')
            .locator('.user-name')
            .filter({ hasText: 'Ahmet' })
            .click();
    });
});
```

## 4. Proje Yapısı ve Locator Yönetimi

### 4.1 Selenium Java - Page Object Model

**Proje Yapısı:**
```
src/
├── main/
│   └── java/
│       └── pages/
│           ├── BasePage.java
│           ├── LoginPage.java
│           └── ProductsPage.java
└── test/
    └── java/
        └── tests/
            ├── LoginTest.java
            └── ProductsTest.java
```

**LoginPage.java (Locatorlar burada saklanır):**
```java
package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPage {
    
    private WebDriver driver;
    
    // Yöntem 1: By objesi olarak tanımlama (daha esnek)
    private By usernameInput = By.id("username");
    private By passwordInput = By.name("password");
    private By loginButton = By.cssSelector(".login-button.primary-btn");
    private By errorMessage = By.xpath("//div[@class='error-message']");
    
    // Constructor
    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }
    
    // Kullanım metodları
    public void enterUsername(String username) {
        driver.findElement(usernameInput).sendKeys(username);
    }
    
    public void enterPassword(String password) {
        driver.findElement(passwordInput).sendKeys(password);
    }
    
    public void clickLoginButton() {
        driver.findElement(loginButton).click();
    }
    
    public String getErrorMessage() {
        return driver.findElement(errorMessage).getText();
    }
    
    // Tüm işlemi birleştiren metod
    public void login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLoginButton();
    }
}
```

**LoginPage.java (PageFactory ile - alternatif):**
```java
package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPageWithPageFactory {
    
    private WebDriver driver;
    
    // Yöntem 2: @FindBy annotation ile (PageFactory pattern)
    @FindBy(id = "username")
    private WebElement usernameInput;
    
    @FindBy(name = "password")
    private WebElement passwordInput;
    
    @FindBy(css = ".login-button.primary-btn")
    private WebElement loginButton;
    
    @FindBy(xpath = "//div[@class='error-message']")
    private WebElement errorMessage;
    
    // Birden fazla element
    @FindBy(tagName = "button")
    private List<WebElement> allButtons;
    
    // Constructor
    public LoginPageWithPageFactory(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this); // PageFactory başlatılıyor
    }
    
    // Kullanım metodları
    public void enterUsername(String username) {
        usernameInput.sendKeys(username);
    }
    
    public void enterPassword(String password) {
        passwordInput.sendKeys(password);
    }
    
    public void clickLoginButton() {
        loginButton.click();
    }
    
    public void login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLoginButton();
    }
}
```

**LoginTest.java (Test sınıfı):**
```java
package tests;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.LoginPage;

public class LoginTest {
    
    private WebDriver driver;
    private LoginPage loginPage;
    
    @BeforeMethod
    public void setup() {
        driver = new ChromeDriver();
        driver.get("http://example.com/login");
        loginPage = new LoginPage(driver); // Page object oluşturuluyor
    }
    
    @Test
    public void testSuccessfulLogin() {
        // Locatorlar page object içinde, test temiz kalıyor
        loginPage.login("ahmet@example.com", "123456");
        
        // Assertion
        // Assert.assertTrue(driver.getCurrentUrl().contains("dashboard"));
    }
    
    @Test
    public void testInvalidLogin() {
        loginPage.login("wrong@example.com", "wrongpass");
        
        String error = loginPage.getErrorMessage();
        // Assert.assertEquals(error, "Geçersiz kullanıcı adı veya şifre");
    }
    
    @AfterMethod
    public void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
```

### 4.2 Playwright TypeScript - Page Object Model

**Proje Yapısı:**
```
project/
├── pages/
│   ├── base.page.ts
│   ├── login.page.ts
│   └── products.page.ts
├── tests/
│   ├── login.spec.ts
│   └── products.spec.ts
└── playwright.config.ts
```

**login.page.ts (Locatorlar burada saklanır):**
```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
    
    readonly page: Page;
    
    // Locatorları readonly property olarak tanımlama (önerilen)
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    
    constructor(page: Page) {
        this.page = page;
        
        // Locatorları constructor'da başlatma
        // Playwright'ın önerdiği yöntemler (role, testId, label)
        this.usernameInput = page.getByPlaceholder('Kullanıcı Adı');
        this.passwordInput = page.getByPlaceholder('Şifre');
        this.loginButton = page.getByRole('button', { name: 'Giriş Yap' });
        this.errorMessage = page.getByTestId('error-message');
        
        // Alternatif: CSS selector ile
        // this.usernameInput = page.locator('#username');
        // this.passwordInput = page.locator('[name="password"]');
        // this.loginButton = page.locator('.login-button');
    }
    
    // Navigation
    async goto() {
        await this.page.goto('http://example.com/login');
    }
    
    // Actions
    async enterUsername(username: string) {
        await this.usernameInput.fill(username);
    }
    
    async enterPassword(password: string) {
        await this.passwordInput.fill(password);
    }
    
    async clickLogin() {
        await this.loginButton.click();
    }
    
    // Combined action
    async login(username: string, password: string) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
    }
    
    // Getters
    async getErrorMessage(): Promise<string | null> {
        return await this.errorMessage.textContent();
    }
    
    // Validations
    async isErrorVisible(): Promise<boolean> {
        return await this.errorMessage.isVisible();
    }
}
```

**products.page.ts (Daha karmaşık örnek):**
```typescript
import { Page, Locator } from '@playwright/test';

export class ProductsPage {
    
    readonly page: Page;
    readonly productsTable: Locator;
    readonly searchInput: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.productsTable = page.locator('#products-table');
        this.searchInput = page.getByPlaceholder('Ürün ara...');
    }
    
    // Dinamik locator - parametreye göre ürün bulma
    getProductByName(productName: string): Locator {
        return this.page.getByRole('row').filter({ hasText: productName });
    }
    
    // Dinamik locator - index'e göre satın al butonu
    getBuyButtonByIndex(index: number): Locator {
        return this.page.locator('.buy-btn').nth(index);
    }
    
    // Kompleks locator - ürün adına göre fiyat bulma
    async getProductPrice(productName: string): Promise<string | null> {
        const row = this.getProductByName(productName);
        const priceCell = row.locator('td').nth(1); // İkinci hücre
        return await priceCell.textContent();
    }
    
    // Ürün satın alma
    async buyProduct(productName: string) {
        const row = this.getProductByName(productName);
        const buyButton = row.getByRole('button', { name: 'Satın Al' });
        await buyButton.click();
    }
    
    // Tüm ürünleri sayma
    async getProductCount(): Promise<number> {
        const rows = this.productsTable.locator('tr');
        return await rows.count();
    }
}
```

**login.spec.ts (Test dosyası):**
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Login Tests', () => {
    
    let loginPage: LoginPage;
    
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page); // Page object oluşturuluyor
        await loginPage.goto();
    });
    
    test('Başarılı giriş yapabilmeli', async ({ page }) => {
        // Locatorlar page object içinde kullanılıyor
        await loginPage.login('ahmet@example.com', '123456');
        
        // Assertion
        await expect(page).toHaveURL(/.*dashboard/);
    });
    
    test('Hatalı giriş yapıldığında hata mesajı göstermeli', async () => {
        await loginPage.login('wrong@example.com', 'wrongpass');
        
        // Error message kontrolü
        await expect(loginPage.errorMessage).toBeVisible();
        const errorText = await loginPage.getErrorMessage();
        expect(errorText).toContain('Geçersiz');
    });
    
    test('Boş alanlarla giriş yapılamamalı', async () => {
        await loginPage.clickLogin();
        
        // Form validation kontrolü
        await expect(loginPage.usernameInput).toHaveAttribute('required');
    });
});
```

**products.spec.ts (Daha karmaşık test):**
```typescript
import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/products.page';

test.describe('Products Tests', () => {
    
    let productsPage: ProductsPage;
    
    test.beforeEach(async ({ page }) => {
        productsPage = new ProductsPage(page);
        await page.goto('http://example.com/products');
    });
    
    test('Belirli bir ürünü satın alabilmeli', async () => {
        await productsPage.buyProduct('Ürün 1');
        
        // Sepet sayfasına yönlendirildi mi kontrol
        // await expect(page).toHaveURL(/.*cart/);
    });
    
    test('Ürün fiyatı doğru görüntülenmeli', async () => {
        const price = await productsPage.getProductPrice('Ürün 1');
        expect(price).toBe('100 TL');
    });
    
    test('Toplam ürün sayısı doğru olmalı', async () => {
        const count = await productsPage.getProductCount();
        expect(count).toBe(2);
    });
});
```

## 5. Locator Seçimi İçin En İyi Pratikler

### Selenium Java - Öncelik Sırası:
1. **ID** - En hızlı ve güvenilir
2. **Name** - Özellikle form elementleri için
3. **Data-testid** (CSS Selector) - Test için özel attributelar
4. **CSS Selector** - Esnek ve hızlı
5. **XPath** - Son çare olarak

### Playwright TypeScript - Öncelik Sırası:
1. **getByRole()** - Accessibility odaklı, en güvenilir
2. **getByTestId()** - Test için özel attributelar
3. **getByLabel()** - Form elementleri için
4. **getByPlaceholder()** - Input alanları için
5. **getByText()** - Text içeriği için
6. **CSS Selector** - Gerektiğinde
7. **XPath** - Mümkünse kaçının

## Özet Karşılaştırma

| Özellik | Selenium Java | Playwright TypeScript |
|---------|---------------|----------------------|
| **Locator Tanımlama** | By objesi veya @FindBy | Locator objesi |
| **En İyi Yöntem** | ID, CSS Selector | getByRole, getByTestId |
| **Dinamik Locator** | Daha fazla kod gerekir | Filter ve chaining ile kolay |
| **Okunabilirlik** | Orta seviye | Çok yüksek |
| **Performans** | İyi | Mükemmel (auto-waiting) |
| **Bakım Kolaylığı** | Page Object ile iyi | Daha kolay |

Playwright'ın modern yaklaşımı daha okunabilir ve bakımı kolay testler yazmanızı sağlar, ancak Selenium'un yaygın kullanımı ve olgunluğu da önemli avantajlardır.

## 🚀 Özet: Java Geliştiricisi İçin Sözlük

| TypeScript/Playwright | Java/Selenium |
| :--- | :--- |
| `npm install` | `mvn clean install` |
| `playwright.config.ts` | `testng.xml` |
| `spec.ts` dosyası | `Test` Class |
| `test('name', ...)` | `@Test public void name()...` |
| `await page.goto(...)` | `driver.get(...)` |
| `await expect(loc).toBeVisible()` | `Assert.assertTrue(elem.isDisplayed())` |
| `console.log(...)` | `System.out.println(...)` |
