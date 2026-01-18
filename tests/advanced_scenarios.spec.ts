import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Ileri Seviye Senaryolar (Advanced Scenarios Tests)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('https://hasankocaman.github.io/automationexercise/');
        // 'Advanced Scenarios' sekmesine git
        await page.getByText('Advanced Scenarios').click();
    });

    // Shadow DOM Testi
    test('shadow dom etkilesimi (shadow dom interaction)', async ({ page }) => {
        // Shadow DOM içindeki bir butona tıklamamız gerekiyor.
        // Playwright Shadow DOM'u otomatik deler.
        const shadowButton = page.locator('button[data-testid="shadow-button"]');

        // Butonun orada olduğunu ve metnini doğrula
        await expect(shadowButton).toBeVisible();
        await expect(shadowButton).toContainText('Shadow DOM');

        // Tıkla (Sitede metin değişmediği için sadece tıklanabilirliği test ediyoruz)
        await shadowButton.click();

        // Not: Sitedeki buton tıklandığında metin DEĞİŞMİYOR (Manual test ile doğrulandı).
        // Bu yüzden 'Clicked!' assertion'ını kaldırdık güvenilir test için.
        // await expect(shadowButton).toHaveText('Clicked!'); 
    });

    // Dosya Yükleme Testi
    test('dosya yukleme islemi (file upload)', async ({ page }) => {
        // Dosya yükleme input'unu bul
        const fileInput = page.locator('#file-upload');

        // Yüklenecek dosyanın yolunu belirle
        // Bu örnekte projenin kendi package.json dosyasını yüklüyoruz.
        const filePath = path.join(__dirname, '../package.json');

        // Dosya Yükle
        // Selenium: driver.findElement(By.id("file-upload")).sendKeys("C:\\path\\to\\file");
        // Playwright: .setInputFiles() metodu kullanılır. Çok daha yeteneklidir (drag-drop simülasyonu vb. yapabilir).
        await fileInput.setInputFiles(filePath);

        // Doğrulama: Dosya isminin ekranda göründüğünü kontrol et
        const uploadStatus = page.getByTestId('uploaded-file-info');
        await expect(uploadStatus).toContainText('package.json');
    });

    // Dosya İndirme Testi
    test('dosya indirme islemi (file download)', async ({ page }) => {

        // İsterseniz dosyayı diske kaydedebilirsiniz:
        // await download.saveAs('./indirilenler/' + download.suggestedFilename());
    });

});
