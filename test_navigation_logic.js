#!/usr/bin/env node

/**
 * Navigation Logic Validator
 *
 * Validates the step navigation logic without requiring a browser.
 * Tests:
 * 1. Steps array indices are correct
 * 2. Navigation functions map to correct steps
 * 3. Logic flow for new vs returning users
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║        Login Flow Navigation Logic Validator              ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Read the HTML file
const htmlFile = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlFile, 'utf8');

// Extract steps array
const stepsMatch = html.match(/const steps = \[(.*?)\];/s);
if (!stepsMatch) {
  console.error('❌ Could not find steps array');
  process.exit(1);
}

const stepsStr = stepsMatch[1];
const steps = eval(`[${stepsStr}]`);

console.log('📋 Steps Array:');
steps.forEach((step, idx) => {
  console.log(`   Index ${idx}: ${step}`);
});

// Validate steps
const tests = [
  {
    name: 'Step indices are correct',
    test: () => {
      const correct = (
        steps[0] === null &&
        steps[1] === 'step1' &&
        steps[2] === 'step2' &&
        steps[3] === 'step2b' &&
        steps[4] === 'step3' &&
        steps[5] === 'step4'
      );
      return correct ? '✅' : '❌';
    }
  },
  {
    name: 'goStep(2) navigates to "step2" (networks)',
    test: () => {
      return steps[2] === 'step2' ? '✅' : '❌';
    }
  },
  {
    name: 'goStep(3) navigates to "step2b" (welcome back)',
    test: () => {
      return steps[3] === 'step2b' ? '✅' : '❌';
    }
  },
  {
    name: 'goStep(4) navigates to "step3" (voting)',
    test: () => {
      return steps[4] === 'step3' ? '✅' : '❌';
    }
  },
  {
    name: 'goStep(5) navigates to "step4" (confirmation)',
    test: () => {
      return steps[5] === 'step4' ? '✅' : '❌';
    }
  }
];

console.log('\n🔍 Step Index Tests:\n');
const stepsTests = tests.map(t => {
  const result = t.test();
  console.log(`${result} ${t.name}`);
  return result === '✅';
});

// Check for goStep calls in the code
console.log('\n🔍 Navigation Function Calls:\n');

const navigationChecks = [
  {
    description: 'NEW USER → goStep(2)',
    pattern: /if\(users\.length === 0\)[\s\S]*?goStep\(2\)/,
    description: 'New user navigation'
  },
  {
    description: 'RETURNING USER (with vote) → goStep(\'step2b\')',
    pattern: /if\(user\.voto_actual\)[\s\S]*?goStep\('step2b'\)/,
    description: 'Returning user with vote navigation'
  },
  {
    description: 'RETURNING USER (no vote) → goStep(2)',
    pattern: /} else \{[\s\S]*?console\.log\('📍 Ir a step 2 \(devolviendo sin voto\)'\)[\s\S]*?goStep\(2\)/,
    description: 'Returning user without vote navigation'
  },
  {
    description: 'VOTE SUBMIT → goStep(5)',
    pattern: /async function submitVote[\s\S]*?goStep\(5\)/,
    description: 'Vote submission navigation'
  },
  {
    description: 'CONFIRM EXISTING → goStep(5)',
    pattern: /function confirmExistingVote[\s\S]*?goStep\(5\)/,
    description: 'Confirm existing vote navigation'
  }
];

const navTests = navigationChecks.map(check => {
  const found = check.pattern.test(html);
  const result = found ? '✅' : '❌';
  console.log(`${result} ${check.description}`);
  console.log(`   Pattern: ${check.pattern}`);
  return found;
});

// Check console logging
console.log('\n🔍 Console Logging Tests:\n');

const logChecks = [
  { pattern: /console\.log\('🔍 Búsqueda de usuario:'/, desc: 'User search log' },
  { pattern: /console\.log\('✨ NUEVO USUARIO/, desc: 'New user log' },
  { pattern: /console\.log\('👤 USUARIO EXISTENTE/, desc: 'Returning user log' },
  { pattern: /console\.log\('👋 Usuario devolviendo/, desc: 'Welcome back log' },
  { pattern: /console\.log\('💾 Procesando voto/, desc: 'Vote submission log' },
  { pattern: /console\.log\('✅ Voto/, desc: 'Vote success log' }
];

const logTests = logChecks.map(check => {
  const found = check.pattern.test(html);
  const result = found ? '✅' : '❌';
  console.log(`${result} ${check.desc}`);
  return found;
});

// Check localStorage cleanup
console.log('\n🔍 Storage Cleanup Tests:\n');

const storageChecks = [
  { pattern: /localStorage\.removeItem\('rf_user_id'\)/, desc: 'Clear user ID' },
  { pattern: /localStorage\.removeItem\('rf_user_email'\)/, desc: 'Clear user email' },
  { pattern: /localStorage\.removeItem\('rf_previous_vote'\)/, desc: 'Clear previous vote' },
  { pattern: /localStorage\.removeItem\('rf_isReturning'\)/, desc: 'Clear returning flag' }
];

const storageTests = storageChecks.map(check => {
  const found = check.pattern.test(html);
  const result = found ? '✅' : '❌';
  console.log(`${result} ${check.desc}`);
  return found;
});

// Check form submission prevention
console.log('\n🔍 Duplicate Prevention Tests:\n');

const preventionChecks = [
  { pattern: /e\.preventDefault\(\)/, desc: 'Form preventDefault in handleLogin' }
];

const preventionTests = preventionChecks.map(check => {
  const found = check.pattern.test(html);
  const result = found ? '✅' : '❌';
  console.log(`${result} ${check.desc}`);
  return found;
});

// Summary
const allTests = [
  ...stepsTests,
  ...navTests,
  ...logTests,
  ...storageTests,
  ...preventionTests
];

const passCount = allTests.filter(t => t).length;
const totalCount = allTests.length;

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log(`║                    SUMMARY                               ║`);
console.log(`║  Tests Passed: ${passCount}/${totalCount}` + ' '.repeat(totalCount.toString().length > 1 ? 48 - totalCount.toString().length : 49) + '║');

if (passCount === totalCount) {
  console.log('║  Result: ✅ ALL TESTS PASSED                             ║');
} else {
  console.log(`║  Result: ⚠️  ${totalCount - passCount} test(s) failed` + ' '.repeat(48 - (totalCount - passCount).toString().length) + '║');
}

console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Requirements checklist
console.log('📋 Requirements Checklist:\n');
console.log(`${stepsTests[0] ? '✅' : '❌'} Requirement 1: New users see step2 (redes), not step2b`);
console.log(`${navTests[0] ? '✅' : '❌'}   └─ Verified: NEW USER calls goStep(2)`);

console.log(`${navTests[3] ? '✅' : '❌'} Requirement 2: After voting, show step4 (confirmation)`);
console.log(`${navTests[3] ? '✅' : '❌'}   └─ Verified: submitVote() calls goStep(5) → step4`);

console.log(`${logTests.filter(t => t).length === logTests.length ? '✅' : '❌'} Requirement 3: Console logging for duplicate detection`);
logChecks.forEach((check, idx) => {
  console.log(`${logTests[idx] ? '✅' : '❌'}   └─ ${check.desc}`);
});

console.log(`⚠️  Requirement 4: Screenshots (cannot be generated without browser)`);

// Exit with proper code
process.exit(passCount === totalCount ? 0 : 1);
