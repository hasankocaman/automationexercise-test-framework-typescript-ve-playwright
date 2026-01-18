import { test, expect } from '@playwright/test';

test.describe('Basic Elements Testleri (Basic Elements Tests)', () => {

    // Her testten önce "Basic Elements" sayfasına git
    test.beforeEach(async ({ page }) => {
        await page.goto('https://hasankocaman.github.io/automationexercise/');

        // Not: "Basic Elements" zaten varsayılan açılış sayfasıdır.
        // Bu yüzden ekstra bir tıklama yapmaya gerek yoktur.
        // Eğer başka tab'larda olsaydık: await page.getByRole('button', { name: 'Basic Elements' }).click();
    });

    test('metin kutusu ile etkilesim ve dogrulama (interact with text input)', async ({ page }) => {
        // 1. Text Input alanını bul ve yaz
        // Selenium: driver.findElement(By.id("text-input")).sendKeys("Playwright");
        // Playwright: page.locator('#text-input').fill('Playwright');
        const inputField = page.locator('#text-input');

        // Görünür olduğundan emin ol (Opsiyonel, Playwright 'fill' yaparken zaten bekler)
        await expect(inputField).toBeVisible();

        // Yazıyı yaz
        await inputField.fill('test');

        // 2. Doğrulama (Verification)
        // Diyelim ki yazdığımız yazı aşağıda bir yerde "You entered: ..." diye çıkıyor.
        // Selenium: Assert.assertEquals(driver.findElement(By.id("result")).getText(), "Playwright Learning");

        // Input'un değeri doğru set edildi mi?
        // Playwright: toHaveValue() assertion'ı input değerini kontrol eder.
        await expect(inputField).toHaveValue('test');
    });

    test('onay kutusu etkilesimleri (checkbox interactions)', async ({ page }) => {
        // Checkbox'ı bul
        // Selenium: WebElement checkbox = driver.findElement(By.id("checkbox-java"));
        // Not: Label'i "Java" olan checkbox'i bulur veya doğrudan ID kullanabiliriz.
        const checkbox = page.locator('#checkbox-java');

        // Tıkla (Check)
        // Selenium: if (!checkbox.isSelected()) checkbox.click();
        // Playwright: check() metodu, eğer zaten seçili değilse seçer. click() ten daha güvenlidir.
        await checkbox.check();

        // Doğrula - Seçili olduğunu kontrol et
        // Selenium: Assert.assertTrue(checkbox.isSelected());
        await expect(checkbox).toBeChecked();

        // İşareti kaldır (Uncheck)
        await checkbox.uncheck();

        // Doğrula - Seçili OLMADIĞINI kontrol et
        // Selenium: Assert.assertFalse(checkbox.isSelected());
        // Playwright: .not.toBeChecked()
        await expect(checkbox).not.toBeChecked();
    });
});
