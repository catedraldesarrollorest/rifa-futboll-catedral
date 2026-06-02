# Manual Test Guide: Login Flow

Follow these steps to manually test the complete login flow in your browser.

---

## Setup

1. Deploy the app or run locally:
   ```bash
   python3 -m http.server 8080
   ```

2. Open browser DevTools:
   - **Chrome/Edge:** `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox:** `F12` or `Ctrl+Shift+I`

3. Go to **Console** tab to see all logs

4. Navigate to: `http://localhost:8080/index.html`

---

## Test 1: New User Flow

### Step 1.1 - Initial Page Load
- **Expected:** See "Rifa Futbolera · La Catedral" welcome screen
- **Step name:** step1
- **Console:** Should be clean (no errors)
- ✅ **Action:** Take screenshot of initial page

### Step 1.2 - Enter Email
- **Input:** Use a **NEW email** (e.g., `test-` + random number + `@test.com`)
- **Example:** `test-1234567890@test.com`
- ✅ **Action:** Enter email and click "Continuar"
- **Console Check:** 
  ```
  🔍 Búsqueda de usuario: test-xxx@test.com
  📊 Usuarios encontrados: 0 []
  ✨ NUEVO USUARIO - Creando...
  POST Status: 201 OK
  ✅ Usuario creado: [...]
  ```

### Step 1.3 - Network Screen (step2)
- **Expected:** See "¿Dónde nos seguís?" (Where do you follow us) with social media icons
- **Step name:** step2
- **Console:** Should see:
  ```
  📍 ANTES DE goStep(2)
  📍 rf_previous_vote: null
  📍 DESPUÉS DE goStep(2)
  ```
- ✅ **Action:** Take screenshot of step2
- ⚠️ **Check:** Should NOT see step2b (welcome back screen)

### Step 1.4 - Click "Continuar a votar"
- **Action:** Click the "Continuar a votar →" button
- **Console:** Look for any errors
- **Expected:** Navigate to voting screen
- ✅ **Action:** Take screenshot of step3 (voting)

### Step 1.5 - Vote Screen (step3)
- **Expected:** See match info and voting buttons:
  - Team 1 flag + name (e.g., España)
  - Empate (Draw)
  - Team 2 flag + name (e.g., Argentina)
- **Step name:** step3
- **Actions:**
  - Select one of the teams
  - Enter your name
  - Click "🎯 Enviar mi voto"
- **Console:** Should see:
  ```
  💾 Procesando voto...
  🔍 Buscando voto anterior de: test-xxx@test.com
  ✨ Primer voto
  ➕ Creando primer voto...
  ✅ Voto creado
  🔄 Actualizando estado...
  🎉 Listo
  ```
- ✅ **Action:** Take screenshot of voting screen before clicking submit

### Step 1.6 - Confirmation Screen (step4)
- **Expected:** See confirmation message with:
  - ✨ "¡Suerte, [your name]! 🤞"
  - Your vote (e.g., "Gana España")
  - Your PIN code
- **Step name:** step4
- **Visual:** Confetti animation should appear
- **Console:** Should see confetti and no errors
- ✅ **Action:** Take screenshot of confirmation

---

## Test 2: Duplicate Login Check

### Step 2.1 - Close tab and return
- **Action:** Close the current page
- **Action:** Open `index.html` again (same or new tab)
- **Expected:** Back at step1 (login screen)

### Step 2.2 - Return with same email
- **Action:** Enter the **SAME email** you used in Test 1
- **Click:** "Continuar"
- **Console:** Should see:
  ```
  🔍 Búsqueda de usuario: test-xxx@test.com
  📊 Usuarios encontrados: 1 [...]
  👤 USUARIO EXISTENTE: {...}
  👋 Usuario devolviendo, ya tiene voto: home
  📍 Ir a step 2b (devolviendo con voto)
  ```
- ✅ **Check:** Only **ONE** search query (no duplicates)

### Step 2.3 - Welcome Back Screen (step2b)
- **Expected:** See "¡Bienvenid@!" message
- **Step name:** step2b
- **Content:** Should show your existing vote
- **Buttons:**
  - "Cambiar mi voto →" (to vote again)
  - "Mantener mi voto ✓" (keep existing vote)
- ✅ **Action:** Take screenshot of step2b
- ⚠️ **Verify:** This should only appear if you already voted (not for fresh users)

### Step 2.4 - Click "Mantener mi voto"
- **Action:** Click "Mantener mi voto ✓"
- **Expected:** Go directly to step4 (confirmation)
- **Console:** Should see:
  ```
  🚨 confirmExistingVote() EJECUTADA
  ```
- ✅ **Action:** Take screenshot of final confirmation

---

## Test 3: Return Without Previous Vote

### Step 3.1 - Use a different new email
- **Action:** Log in with a NEW email (e.g., `test-different-123@test.com`)
- **Expected:** See step2 (Redes), NOT step2b
- **Console:** Should show "NUEVO USUARIO" in logs
- ✅ **Verify:** This confirms the logic correctly detects first-time users

### Step 3.2 - Multiple logins with same email
- **Action:** Log in with the SAME email 2-3 times rapidly
- **Check:** Console should show only ONE login query per time
- **Verify:** No duplicate "Búsqueda de usuario" logs for a single login attempt

---

## Console Log Checklist

### ✅ New User Logs (should see in order):
```
🔍 Búsqueda de usuario: [email]
📊 Usuarios encontrados: 0 []
✨ NUEVO USUARIO - Creando...
POST Status: 201 OK
✅ Usuario creado: [...]
🔄 Actualizando estado...
📍 ANTES DE goStep(2)
📍 rf_previous_vote: null
📍 DESPUÉS DE goStep(2)
```

### ✅ Voting Logs (should see in order):
```
💾 Procesando voto...
🔍 Buscando voto anterior de: [email]
✨ Primer voto
➕ Creando primer voto...
✅ Voto creado
🔄 Actualizando estado...
🎉 Listo
```

### ✅ Returning User Logs (should see in order):
```
🔍 Búsqueda de usuario: [email]
📊 Usuarios encontrados: 1 [...]
👤 USUARIO EXISTENTE: {...}
👋 Usuario devolviendo, ya tiene voto: [vote_type]
📍 Ir a step 2b (devolviendo con voto)
```

### ❌ ERROR Logs (should NOT see):
- Duplicate "Búsqueda de usuario" within same login
- "Elemento no encontrado" (missing step elements)
- "Step no encontrado" (invalid step numbers)
- 401/403 Supabase errors

---

## Expected Step Navigation

### New User:
```
step1 → step2 → step3 → step4
```

### Returning User (with vote):
```
step1 → step2b → [step3 or step4]
  ├─ Click "Cambiar mi voto" → step3 → step4
  └─ Click "Mantener mi voto" → step4
```

### Returning User (no vote):
```
step1 → step2 → step3 → step4
```

---

## Success Criteria

✅ **All of these must pass:**

1. **New users see step2, NOT step2b**
   - Fresh email → step2 (Redes)
   - ✓ Verified if you see network social buttons
   - ✗ Failed if you see "¡Bienvenid@!" message

2. **After voting, see step4 with vote details**
   - Vote submitted → step4 (Confirmation)
   - Shows: "¡Suerte, [name]! 🤞"
   - Shows: Your vote (e.g., "Gana España")
   - Shows: Your PIN code

3. **No duplicate logins in console**
   - Each login attempt = ONE "Búsqueda de usuario" log
   - No repeated queries for same email in single login flow
   - Only one "NUEVO USUARIO - Creando..." per new user

4. **Correct step navigation**
   - New user path: 1→2→3→4
   - Returning with vote: 1→2b→3 or 1→2b→4
   - No jumping to wrong steps

---

## Troubleshooting

| Issue | Expected | Check |
|-------|----------|-------|
| Shows step2b for new email | Should show step2 | Email is truly new in Supabase? |
| No step4 after voting | Should see confirmation | Check "✅ Voto creado" in console |
| Duplicate "Búsqueda usuario" logs | Should see once per login | Is there a duplicate form submit? |
| Missing team names | Should see Spain vs Argentina | Check CONFIG values in localStorage |
| Can't proceed from step3 | Need to select team + name | Both fields required before submit |
| Voting closed message | Should say "Votación abierta ✓" | Check match time in CONFIG |

---

## How to Share Results

After testing, note:
- ✅ Which tests passed
- ❌ Which tests failed (with console logs)
- Screenshots of each step (if possible)
- Any console errors or warnings

This helps confirm the navigation flow is working correctly.
