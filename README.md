# Chidori · web del congreso

Sitio público que se abre escaneando el QR del póster. Muestra las mediciones
que estén marcadas como públicas y el protocolo de medición. Bilingüe ES/EN.

Es un proyecto separado de la app de escritorio, pero lee la **misma base de
Supabase**.

## Puesta en marcha

```bash
cp .env.example .env.local     # completar con los valores del proyecto Supabase
npm install
npm run dev
```

Sin `.env.local` el sitio igual levanta y avisa qué falta, en vez de quedar en
blanco.

> **Instalar y buildear siempre desde macOS.** Esta carpeta se ve también desde
> un Linux a través del puente de Claude. Si `npm install` corre del lado Linux,
> los binarios nativos de Vite quedan compilados para Linux y `npm run dev` falla
> en la Mac con "Cannot find native binding". Se arregla con
> `rm -rf node_modules package-lock.json && npm install` en la Mac.

## Antes de que se vean datos

Correr `sql/web_publica.sql` en Supabase → SQL Editor. Crea:

- `sessions.is_public` y `sessions.is_featured` (la curaduría)
- las vistas `public_sessions`, `public_measurements`, `public_session_events`
  y `public_field_definitions`, que son **lo único** que ve un visitante anónimo
- la policy que deja publicar solo a `superadmin`

El final del archivo tiene tres consultas de auditoría. Conviene leer el
resultado de las tres antes de imprimir el QR.

## Elegir qué se publica

`/admin` — no está linkeado desde ningún lado. Se entra con el mismo usuario y
contraseña de la app de escritorio. Dos botones por sesión:

- **Publicada** — aparece en el sitio
- **Portada** — es la Figura 1 del inicio (excluyente: al marcar una se baja la anterior)

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Portada: hero, cifras, Figura 1 y lista de mediciones |
| `/sesion/:id` | Una sesión: gráfico, condiciones y tabla de eventos |
| `/protocolo` | Metodología, cadena de medición, instrumentación |
| `/admin` | Panel de publicación |

## Banco de pruebas del gráfico

El contenedor donde se desarrolla no llega a Supabase, así que el gráfico no
se puede ver con datos reales desde ahí. `test.html` + `src/test-chart.jsx`
montan el componente con una sesión sintética que tiene la física real: basal
61,4 Ω, llenado de −1,28 Ω/h, ruido σ = 0,010 Ω y un artefacto de movimiento
de +4,33 Ω a los 40 minutos.

```bash
npx vite build --config vite.test.config.mjs   # queda en dist-test/
```

Sirve para revisar la escala del eje, la lectura del cursor y el
comportamiento en pantallas angostas sin tocar datos de pacientes.

## Decisiones que vale la pena conocer

**El eje Y nunca arranca en cero.** La señal de llenado es de ~1,28 Ω/h sobre
una basal de decenas de ohm. Forzar el cero la convertiría en una línea recta.

**Se grafican las dos series.** En gris la cruda a ~4 Hz, en color la mediana
móvil de 60 s. Mostrar solo la tendencia escondería los artefactos de
movimiento, que son el problema real del instrumento; mostrar solo la cruda
haría ilegible la señal.

**La decimación es LTTB, no un muestreo cada N.** Un muestreo uniforme se comería
justo los picos de movimiento. LTTB conserva la forma.

**Los números no están hardcodeados.** Sujetos, sesiones y eventos se calculan
sobre lo que esté publicado. Las specs de instrumentación salen del firmware
(`Chidori_ESP32C3_WiFiManager.ino`) y de `signal.js`.

## Deploy

Vercel, framework Vite. Cargar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
en Project Settings → Environment Variables. `vercel.json` ya tiene el rewrite
de SPA.
