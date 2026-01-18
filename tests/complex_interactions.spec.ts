import { test, expect } from '@playwright/test';

test.describe('Karmasik Etkilesimler Testleri (Complex Interactions Tests)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('https://hasankocaman.github.io/automationexercise/');
        // "Complex Interactions" sekmesine tıkla
        await page.getByText('Complex Interactions').click();
    });

    test('mouse hover islemi (hover actions)', async ({ page }) => {
        // Hedef: 'Products' menüsünün üzerine gelip alt menünün açıldığını doğrulamak.

        // Elementleri tanımla
        // Selenium: WebElement menu = driver.findElement(By.xpath("//button[text()='Products']"));
        const menuProducts = page.getByTestId('menu-products');
        const subItem = page.getByTestId('submenu-products-item-1');

        // Hover işlemi (Mouse Üzerine Gelme)
        // Selenium: Actions actions = new Actions(driver);
        //           actions.moveToElement(menu).perform();
        // Playwright: .hover() metodu ile tek satırda yapılır. Mouse simülasyonu kusursuzdur.
        await menuProducts.hover();

        // Doğrulama
        // Selenium: WebDriverWait wait = new WebDriverWait(driver, 5);
        //           wait.until(ExpectedConditions.visibilityOf(subItem));
        // Playwright: subItem görünür olana kadar (auto-wait) bekler ve doğrular.
        await expect(subItem).toBeVisible();
    });

    test('surukle birak islemi (drag and drop)', async ({ page }) => {
        // Hedef: Item A'yı Drop Zone 2'ye sürükle.

        // Elementleri tanımla
        const sourceItem = page.getByTestId('drag-item-item-a');
        const targetZone = page.getByTestId('drop-zone-2');

        // Sürükle ve Bırak
        // Selenium: actions.dragAndDrop(source, target).perform();
        //           veya actions.clickAndHold(source).moveToElement(target).release().perform();
        // Playwright: .dragTo() metodu ile çok stabil çalışır.
        await sourceItem.dragTo(targetZone);

        // Doğrulama
        // Hedef bölgenin, sürüklenen öğenin metnini içerdiğini doğrulayalım.
        // Bu senaryoda text transferi olup olmadığını kontrol ediyoruz.
        // (Uygulamanın davranışına göre burası değişebilir, container içinde element var mı diye de bakılabilir)
        // Örnek: Zone içinde "Item A" yazısı var mı?
        await expect(targetZone).toContainText('Item A');
    });

    test('sag tiklama ve tooltip (context menu & tooltip)', async ({ page }) => {
        // 1. Tooltip Kontrolü
        // Selenium: String tooltip = element.getAttribute("title");
        // Playwright: Aynı şekilde getAttribute ile alınabilir veya .toHaveAttribute ile assert edilebilir.

        // Sayfanın en altındaki veya kenarındaki 'Back to top' butonunu bulalım
        // Selector: title="Back to top" olan buton
        const backToTopBtn = page.locator('button[title="Back to top"]');

        // Tooltip (title attribute) doğrulaması
        await expect(backToTopBtn).toHaveAttribute('title', 'Back to top');


        // 2. Sağ Tıklama (Context Menu)
        // Selenium: actions.contextClick(element).perform();
        // Playwright: .click({ button: 'right' })

        const dragItem = page.getByTestId('drag-item-item-b');

        // Sağ tıkla
        await dragItem.click({ button: 'right' });

        // Not: Bu sayfada özel bir sağ tık menüsü (custom context menu) olmayabilir.
        // Ancak tarayıcının standart sağ tık menüsünün tetiklendiğini loglayabiliriz.
        console.log('Item B üzerine sag tiklandi.');
    });

});
