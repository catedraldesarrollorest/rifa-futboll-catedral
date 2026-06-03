# Migración: Email → Teléfono en rifa_usuarios

## 🎯 ¿Qué Necesitas Hacer?

La aplicación ahora usa **números de teléfono cubanos** en lugar de emails para identificar usuarios. Debes actualizar la tabla `rifa_usuarios` en Supabase.

## 📝 Pasos para Migrar en Supabase Dashboard

### Paso 1: Abre Supabase Dashboard
```
https://app.supabase.com
```
- Inicia sesión con tu cuenta
- Selecciona tu proyecto

### Paso 2: Abre el SQL Editor
- En el menú izquierdo, busca "SQL Editor"
- O accede directamente: https://app.supabase.com/project/tigbtwqwfwcqdfwlndkf/sql/new

### Paso 3: Copia y Pega Este SQL

**OPCIÓN A: Migración Conservadora (Mantener datos de email)**

Si quieres mantener los emails como respaldo mientras migras:

```sql
-- === TABLA: rifa_usuarios ===
-- Paso 1: Agregar columna phone si no existe
ALTER TABLE public.rifa_usuarios 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Paso 2: Agregar constraint UNIQUE a phone
ALTER TABLE public.rifa_usuarios 
ADD CONSTRAINT rifa_usuarios_phone_key UNIQUE(phone);

-- Paso 3: Remover constraint UNIQUE de email (pero mantener la columna)
ALTER TABLE public.rifa_usuarios 
DROP CONSTRAINT IF EXISTS rifa_usuarios_email_key;

-- === TABLA: rifa_votos ===
-- Paso 4: Agregar columna phone a rifa_votos
ALTER TABLE public.rifa_votos 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Paso 5: Remover constraint UNIQUE de email en rifa_votos (si existe)
ALTER TABLE public.rifa_votos 
DROP CONSTRAINT IF EXISTS rifa_votos_email_key;
```

**OPCIÓN B: Migración Directa (Eliminar email y usar solo phone)**

```sql
-- === TABLA: rifa_usuarios ===
-- Paso 1: Agregar columna phone
ALTER TABLE public.rifa_usuarios 
ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;

-- Paso 2: Eliminar columna email
ALTER TABLE public.rifa_usuarios 
DROP COLUMN IF EXISTS email CASCADE;

-- === TABLA: rifa_votos ===
-- Paso 3: Agregar columna phone a rifa_votos
ALTER TABLE public.rifa_votos 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Paso 4: Eliminar columna email de rifa_votos
ALTER TABLE public.rifa_votos 
DROP COLUMN IF EXISTS email CASCADE;
```

### Paso 4: Haz Click en "Run" o Presiona Ctrl+Enter

✅ Deberías ver: "Query executed successfully"

---

## ✅ Verificar que Funcionó

1. En Supabase Dashboard, ve a **Table Editor**
2. En el menú izquierdo busca la tabla `rifa_usuarios`
3. Deberías ver:
   - ✅ Nueva columna: `phone` (TEXT, UNIQUE)
   - ✅ Sin columna `email` (o con email si usaste Opción A)

---

## 🔧 Validación de Números de Teléfono Cubanos

La aplicación ahora valida que el teléfono tenga formato cubano:

**Formato válido:** `+5358867972`

Desglose:
- `+53` = Código de país (Cuba)
- `5` o `8` = Código de área (móvil)
- `8 dígitos` = El número

**Ejemplos válidos:**
- +5358867972
- +5352123456
- +5385555555

**Ejemplos inválidos:**
- 5358867972 (falta el +)
- +5358867 (muy corto)
- +53 358867972 (espacios)

---

## ⚠️ Estructura Final de las Tablas

Después de la migración, las tablas deben verse así:

### rifa_usuarios

```
Columnas:
- id (BIGINT, PRIMARY KEY)
- phone (TEXT, UNIQUE) ← NUEVA
- pin (TEXT)
- activo (BOOLEAN)
- voto_actual (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Nota:** La columna `email` se elimina con Opción B, o se mantiene sin UNIQUE con Opción A.

### rifa_votos

```
Columnas:
- id (BIGINT, PRIMARY KEY)
- phone (TEXT) ← NUEVA
- nombre (TEXT)
- voto (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Nota:** La columna `email` se elimina con Opción B, o se mantiene con Opción A.

---

## 🚀 Después de Migrar

1. **Prueba en Votación:**
   - Abre `index.html`
   - Ingresa teléfono: `+5358867972`
   - Deberías logearte sin problemas

2. **Comprueba la Validación:**
   - Intenta ingresar un formato inválido
   - Deberías ver: "Formato inválido. Usa: +5358867972"

3. **Prueba en Otro Navegador:**
   - El mismo teléfono debe reconocerse como usuario devolviendo
   - Deberías ver tu voto anterior

---

## 💾 Cambios en el Código

El código en `index.html` ha sido actualizado:

- ✅ Input de email → Input de teléfono
- ✅ Validación de email → Validación cubana de teléfono
- ✅ localStorage `rf_user_email` → `rf_user_phone`
- ✅ Queries de Supabase: `email=eq.` → `phone=eq.`

---

## ⚠️ Si Algo Falla

### Error: "Duplicate key"
**Solución:** Ya existe un usuario con ese teléfono. Usa uno diferente.

### Error: "Relation does not exist"
**Solución:** La migración SQL no se ejecutó. Verifica que no hay errores en SQL Editor.

### Validación rechaza teléfono válido
**Solución:** El formato debe ser exactamente `+53` + `5/8` + `8 dígitos`.

---

## 📲 Ejemplo de Prueba

```
1. Abre index.html
2. Ingresa: +5358867972
3. Click "Continuar →"
4. Deberías ver "✨ NUEVO USUARIO" en consola
5. Si lo haces de nuevo con el mismo número: "👤 USUARIO EXISTENTE"
```

---

## 💡 Próximos Pasos

Después de aplicar esta migración:

1. **Recarga la página** (F5)
2. **Abre la consola** (F12)
3. **Prueba login** con teléfono cubano
4. **Verifica en Supabase** que se creó el registro con `phone` en lugar de `email`

**Si todo funciona = ¡LISTO!** 🎉
