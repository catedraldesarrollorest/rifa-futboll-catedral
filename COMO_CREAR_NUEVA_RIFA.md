# ¿Cómo Crear Una Nueva Rifa?

## 🎯 El Problema Que Se Solucionó

**Antes:** Cuando el admin creaba una nueva rifa, los votos VIEJOS seguían apareciendo en Supabase
- Ejemplo: Rifa 1 tenía 50 votos de "España vs Argentina"
- Se creaba Rifa 2 con "Brasil vs México"
- Pero los 50 votos viejos SEGUÍAN en la base de datos
- Los usuarios que votaron en Rifa 1 aparecían como si votaron en Rifa 2

**Ahora:** ✅ Se borra TODO automáticamente
- Cuando creas Nueva Rifa, se borran TODOS los votos viejos
- Se limpia el estado de todos los usuarios
- Cada usuario puede votar FRESH en la nueva rifa
- Aunque el email sea el mismo, es como si fuera nuevo

---

## 📝 Paso a Paso

### Paso 1: Entra al Panel Admin
```
http://localhost:8080/admin.html
```
- Ingresa tu PIN (5555, 5556 o 5557)

### Paso 2: Ve la Sección "Crear Nueva Rifa"
Está **ARRIBA** de "Registrar resultado del partido"

Verás estos campos:
- 🟢 Equipo 1 (Ej: España)
- 🟢 Emoji/Bandera 1 (Ej: 🇪🇸)
- 🔴 Equipo 2 (Ej: Argentina)
- 🔴 Emoji/Bandera 2 (Ej: 🇦🇷)
- 📅 Fecha y hora del partido
- 🎁 Premio (Ej: $50 en consumo)

### Paso 3: Llena los Campos

**Equipo 1:**
```
Brasil
🇧🇷
```

**Equipo 2:**
```
Uruguay
🇺🇾
```

**Fecha:** Hace click en el campo y selecciona fecha/hora

**Premio:** 
```
$100 en consumo
```

### Paso 4: Click en Botón "🎯 Crear Nueva Rifa"

Verás esto:
```
⏳ Creando nueva rifa... (borrando votos anteriores)
```

### Paso 5: Espera a que termine (2-3 segundos)

Verás:
```
✅ ¡Nueva rifa creada! Brasil vs Uruguay · $100 en consumo
```

---

## 🔧 ¿Qué Sucede Detrás?

Cuando haces click en "Crear Nueva Rifa", automáticamente:

1. **Borra TODOS los votos viejos** de la tabla `rifa_votos` en Supabase
   ```
   DELETE FROM rifa_votos WHERE 1=1
   ```

2. **Limpia el estado de usuarios** en la tabla `rifa_usuarios`
   ```
   UPDATE rifa_usuarios SET voto_actual = NULL
   ```

3. **Guarda la nueva configuración** en localStorage:
   - config_team1 = "Brasil"
   - config_team2 = "Uruguay"
   - config_flag1 = "🇧🇷"
   - config_flag2 = "🇺🇾"
   - config_date = fecha/hora
   - config_prize = "$100 en consumo"

4. **Actualiza la interfaz del admin panel**
   - Los equipos en las tarjetas de stats cambian
   - El dropdown de "Resultado final" se actualiza
   - La tabla de votos se vacía (0 votos)

---

## ✅ Lo Que Ves Después

### En el Admin Panel:
- Los nombres de los equipos cambian a "Brasil" y "Uruguay"
- Los cards de stats muestran 0 votos
- El dropdown "Resultado final" dice:
  - "🇧🇷 Gana Brasil"
  - "🤝 Empate"
  - "🇺🇾 Gana Uruguay"

### En la Página de Votación (index.html):
- Los usuarios ven "Brasil vs Uruguay"
- Los usuarios ven la nueva fecha del partido
- Aunque ya hayan votado antes, pueden votar de NUEVO
- Cada voto es para la NUEVA rifa

---

## 📊 Ejemplo Real

### Rifa 1: España vs Argentina
- Usuario: juan@email.com votó "Gana España"
- Usuario: maria@email.com votó "Empate"
- Total: 50 votos en Supabase

### Admin Crea Rifa 2: Brasil vs México
- Click en "🎯 Crear Nueva Rifa"
- Espera a que se complete

**Resultado:**
```
rifa_votos: 0 votos (antes había 50, ahora está VACÍO)
rifa_usuarios: 
  - juan@email.com → voto_actual = NULL (antes tenía "home")
  - maria@email.com → voto_actual = NULL (antes tenía "draw")
```

### Usuario Juan vuelve a la página:
- Ve "Brasil vs México" (NO "España vs Argentina")
- Puede votar de NUEVO
- No aparece su voto anterior

---

## ⚠️ Validaciones

El sistema verifica que llenes TODOS los campos:

```
❌ Si dejas un campo vacío:
"❌ Completa todos los campos"

✅ Si todo está bien:
"✅ ¡Nueva rifa creada! Brasil vs Uruguay · $100 en consumo"
```

---

## 🐛 Troubleshooting

### "Error al crear rifa"
**Problema:** Supabase no responde o hay error en la API

**Solución:**
1. Verifica que tengas internet
2. Verifica que SUPABASE_URL y SUPABASE_KEY sean correctos
3. Intenta de nuevo

**En la consola verás:** `❌ Error: ...`

### Los votos SIGUEN apareciendo después
**Problema:** El DELETE no funcionó bien

**Solución:**
1. Revisa la consola del navegador (F12)
2. Busca: `✅ Votos borrados` o error
3. Si hay error, contacta al desarrollador

### Los equipos no cambian en la página de votación
**Problema:** El localStorage no se actualizó

**Solución:**
1. Recarga la página (F5)
2. Cierra el navegador completamente y abre de nuevo
3. Limpia el caché del navegador

---

## 🎯 Resumen

Para crear una **NUEVA RIFA** sin que persistan votos viejos:

1. Ve al Admin Panel
2. Llena los 6 campos en "Crear Nueva Rifa"
3. Click en "🎯 Crear Nueva Rifa"
4. Espera mensaje de ✅ éxito
5. **LISTO** - Los votos viejos se borraron, usuarios pueden votar fresh

**El problema está RESUELTO.** ✅
