# Configurar tabla rifa_config en Supabase

## 🎯 ¿Qué Necesitas Hacer?

La aplicación ahora guarda la configuración de la rifa en **Supabase** en lugar de localStorage. Necesitas crear una tabla llamada `rifa_config` con los datos de la rifa actual.

## 📝 Opción 1: Ejecutar SQL en Supabase Dashboard (RECOMENDADO)

### Paso 1: Abre Supabase Dashboard
```
https://app.supabase.com
```
- Inicia sesión con tu cuenta
- Selecciona tu proyecto

### Paso 2: Abre el SQL Editor
- En el menú izquierdo, busca "SQL Editor"
- O accede directamente: https://app.supabase.com/project/[PROJECT_ID]/sql/new

### Paso 3: Copia y Pega Este SQL

```sql
-- Crear tabla rifa_config
CREATE TABLE IF NOT EXISTS public.rifa_config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  team1 TEXT NOT NULL DEFAULT 'España',
  team2 TEXT NOT NULL DEFAULT 'Argentina',
  flag1 TEXT NOT NULL DEFAULT '🇪🇸',
  flag2 TEXT NOT NULL DEFAULT '🇦🇷',
  match_date TIMESTAMP WITH TIME ZONE,
  prize TEXT NOT NULL DEFAULT '$50 en consumo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración inicial
INSERT INTO public.rifa_config (id, team1, team2, flag1, flag2, match_date, prize)
VALUES (1, 'España', 'Argentina', '🇪🇸', '🇦🇷', NOW(), '$50 en consumo')
ON CONFLICT (id) DO NOTHING;

-- Habilitar Row Level Security
ALTER TABLE public.rifa_config ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Allow public read" ON public.rifa_config
  FOR SELECT USING (true);

-- Permitir actualización autenticada
CREATE POLICY "Allow public write" ON public.rifa_config
  FOR ALL USING (true);
```

### Paso 4: Haz Click en "Run" o Presiona Ctrl+Enter

✅ Deberías ver: "Query executed successfully"

---

## ✅ Verificar que Funcionó

1. En Supabase Dashboard, ve a **Table Editor**
2. En el menú izquierdo busca la tabla `rifa_config`
3. Deberías ver 1 registro con:
   - team1: "España"
   - team2: "Argentina"
   - flag1: "🇪🇸"
   - flag2: "🇦🇷"
   - prize: "$50 en consumo"

---

## 🔧 ¿Qué Pasó?

La tabla `rifa_config` ahora guarda:
- **team1, team2** - Nombres de los equipos
- **flag1, flag2** - Emojis/banderas
- **match_date** - Fecha y hora del partido
- **prize** - El premio de la rifa

Cuando el **admin crea una nueva rifa**, estos datos se actualizan automáticamente en Supabase.

Cuando los **usuarios cargan la página**, la app lee estos datos de Supabase y los muestra dinámicamente.

---

## 🚀 Ahora La App Funcionará Así:

1. **Admin panel** → Admin ingresa datos de nueva rifa
2. Click "Crear Nueva Rifa" → Se actualiza `rifa_config` en Supabase
3. **Página de votación** → Lee datos de `rifa_config` y los muestra

**Ventajas:**
✅ La configuración está centralizada en Supabase
✅ No se pierde si el usuario limpia el cache
✅ Todos ven la misma rifa (no importa el dispositivo)
✅ Se actualiza en tiempo real cuando el admin crea nueva rifa

---

## 📲 Acceder a Supabase

Si necesitas la URL de tu proyecto Supabase, busca en el código:

```javascript
// En index.html o admin.html
const SUPABASE_URL = 'https://tigbtwqwfwcqdfwlndkf.supabase.co';
```

El proyecto ID es: **tigbtwqwfwcqdfwlndkf**

Dashboard: `https://app.supabase.com/projects`

---

## ⚠️ Si Algo Falla

### Error: "Relation does not exist"
**Solución:** La tabla no fue creada. Verifica que el SQL se ejecutó sin errores.

### Error: "Permission denied"
**Solución:** Las políticas RLS no están bien configuradas. Verifica que permitiste "Allow public write".

### Config no se actualiza
**Solución:** 
1. Recarga la página (F5)
2. Abre consola (F12)
3. Busca: `✅ Configuración cargada de Supabase`
4. Si no está, está usando localStorage como respaldo

---

## 💡 Próximos Pasos

Después de crear la tabla:

1. **Prueba en Admin Panel:**
   - Ve a `admin.html`
   - Ingresa PIN (5555)
   - En "Crear Nueva Rifa" ingresa nuevos datos
   - Click "Crear Nueva Rifa"
   - Verifica que dice: `✅ Configuración guardada en Supabase`

2. **Prueba en Página de Votación:**
   - Abre `index.html` en una pestaña nueva
   - Recarga la página (F5)
   - Verifica que los nombres de equipos cambien dinámicamente

3. **Prueba en Otro Navegador:**
   - Abre la app en Chrome, Firefox, Safari, etc.
   - Todos deberían ver la MISMA configuración

**Si todo funciona = ¡LISTO!** 🎉
