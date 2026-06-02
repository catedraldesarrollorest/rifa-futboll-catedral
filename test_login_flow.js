const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testLoginFlow() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Clear storage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const screenshotDir = '/tmp/screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  let screenshotNum = 1;
  const takeScreenshot = async (name) => {
    const filename = path.join(screenshotDir, `${screenshotNum.toString().padStart(2, '0')}-${name}.png`);
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`✅ Screenshot: ${filename}`);
    screenshotNum++;
  };

  try {
    console.log('\n🔍 Step 1: Navigate to app');
    await page.goto('http://localhost:8080/index.html');
    await page.waitForLoadState('networkidle');
    await takeScreenshot('01-initial-page');

    console.log('\n🔍 Step 2: Check initial step (should be step1)');
    const currentStep = await page.evaluate(() => {
      const active = document.querySelector('.steps-container .step.active');
      return active ? active.id : 'none';
    });
    console.log(`   Current step: ${currentStep}`);
    if (currentStep !== 'step1') {
      console.error(`   ❌ ERROR: Expected step1, got ${currentStep}`);
    }

    console.log('\n🔍 Step 3: Enter new user email');
    const testEmail = `test-${Date.now()}@test.com`;
    console.log(`   Using email: ${testEmail}`);

    // Enable console logging
    let consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      console.log(`   Console: ${msg.text()}`);
    });

    await page.fill('input[placeholder="ejemplo@email.com"]', testEmail);
    await takeScreenshot('02-email-entered');

    console.log('\n🔍 Step 4: Click "Continuar" button');
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(2000);
    await takeScreenshot('03-after-continuar');

    console.log('\n🔍 Step 5: Check current step (should be step2 for new user)');
    const stepAfterLogin = await page.evaluate(() => {
      const active = document.querySelector('.steps-container .step.active');
      return active ? active.id : 'none';
    });
    console.log(`   Current step: ${stepAfterLogin}`);

    const isStep2 = stepAfterLogin === 'step2';
    const isStep2b = stepAfterLogin === 'step2b';

    if (isStep2) {
      console.log(`   ✅ CORRECT: New user seeing step2 (redes)`);
    } else if (isStep2b) {
      console.log(`   ❌ ERROR: New user seeing step2b (should be step2)`);
    } else {
      console.log(`   ❌ ERROR: Unexpected step: ${stepAfterLogin}`);
    }

    console.log('\n🔍 Step 6: Check console for duplicate login messages');
    const duplicateLogins = consoleLogs.filter(log => log.includes('login') || log.includes('usuario encontrado') || log.includes('usuario creado'));
    console.log(`   Total login-related logs: ${duplicateLogins.length}`);
    duplicateLogins.forEach(log => console.log(`   - ${log}`));

    if (isStep2) {
      console.log('\n🔍 Step 7: Proceed to voting (click next button in step2)');
      const nextBtn = await page.$('button:has-text("Siguiente")');
      if (nextBtn) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
        await takeScreenshot('04-after-step2-next');

        const stepAfterStep2 = await page.evaluate(() => {
          const active = document.querySelector('.steps-container .step.active');
          return active ? active.id : 'none';
        });
        console.log(`   Current step after clicking next: ${stepAfterStep2}`);
      }

      console.log('\n🔍 Step 8: Select a team to vote for (step3)');
      const teamButtons = await page.$$('[data-action="selectTeam"]');
      console.log(`   Found ${teamButtons.length} team buttons`);

      if (teamButtons.length > 0) {
        await teamButtons[0].click();
        await page.waitForTimeout(1000);
        await takeScreenshot('05-team-selected');

        console.log('\n🔍 Step 9: Check if confirmation dialog appears');
        const confirmDialog = await page.$('.modal-vote-confirm');
        if (confirmDialog) {
          console.log(`   Modal found`);
          await takeScreenshot('06-confirm-dialog');

          console.log('\n🔍 Step 10: Click confirm button');
          const confirmBtn = await page.$('button:has-text("Confirmar")');
          if (confirmBtn) {
            await confirmBtn.click();
            await page.waitForTimeout(2000);
            await takeScreenshot('07-after-confirm');

            console.log('\n🔍 Step 11: Check final step (should be step4)');
            const finalStep = await page.evaluate(() => {
              const active = document.querySelector('.steps-container .step.active');
              return active ? active.id : 'none';
            });
            console.log(`   Current step: ${finalStep}`);

            if (finalStep === 'step4') {
              console.log(`   ✅ CORRECT: Showing step4 (confirmation)`);
            } else {
              console.log(`   ❌ ERROR: Expected step4, got ${finalStep}`);
            }

            console.log('\n🔍 Step 12: Check vote details in confirmation');
            const voteDetails = await page.evaluate(() => {
              const step4 = document.querySelector('#step4');
              if (!step4) return 'Step4 not found';
              return step4.innerText;
            });
            console.log(`   Vote confirmation shows:\n${voteDetails}`);
            await takeScreenshot('08-final-confirmation');
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
    console.log('\n✅ Test completed. Screenshots saved to:', screenshotDir);
  }
}

testLoginFlow();
