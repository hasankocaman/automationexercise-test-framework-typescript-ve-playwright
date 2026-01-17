import { test, expect } from '@playwright/test';

// 'test' bloğu, TestNG'deki @Test anotasyonuna benzer.
// 'test' fonksiyonu iki parametre alır: testin adı ve asenkron (async) bir fonksiyon.
// { page } fixture'ı, Selenium'daki WebDriver instance'ına benzer, ancak her test için izole edilmiştir.
test('has title', async ({ page }) => {

    // 1. Sayfaya git
    // Selenium: driver.get("https://...");
    // Playwright: playwright.config.ts dosyasında baseURL tanımladığımız için sadece '/' yeterli.
    await page.goto('https://hasankocaman.github.io/automationexercise/');

    // 2. Başlığı doğrula (Assertion)
    // Selenium: Assert.assertEquals(driver.getTitle(), "beklenen başlık");
    // Playwright: expect() fonksiyonu ile "Web-First Assertion" kullanırız.
    // Bu assertions "auto-wait" (otomatik bekleme) özelliğine sahiptir.
    // Yani başlık hemen gelmezse, varsayılan timeout (5sn) boyunca bekler ve yeniden dener.
    // Explicit wait (WebDriverWait) yazmanıza gerek kalmaz!
    await expect(page).toHaveTitle(/Automation Testing Playground/);
});

test('check header visibility', async ({ page }) => {
    await page.goto('https://hasankocaman.github.io/automationexercise/');

    // Locator bulma stratejisi
    // Selenium: By.cssSelector(...) veya By.xpath(...)
    // Playwright: page.locator(...) veya dogrudan css/xpath stringi.
    // CSS Selectorlerde visible text ile arama yapabiliriz: "text=..."
    // veya daha guclu olan getByRole gibi methodlari tercih ederiz.

    // Header'in gorunur oldugunu dogrula
    // Selenium: Assert.assertTrue(element.isDisplayed());
    // React uygulamasi oldugu icin root elementi assert edebiliriz, veya gorunen bir baslik.
    // "Automation Testing Playground" yazisinin gorunur oldugunu dogruluyoruz.
    const header = page.getByText('Automation Testing Playground').first();
    await expect(header).toBeVisible();
});
