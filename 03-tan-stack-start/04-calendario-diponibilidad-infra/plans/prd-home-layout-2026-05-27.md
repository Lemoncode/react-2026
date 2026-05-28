# PRD: Layout completo de la página Home (Villa)

**Date**: 2026-05-27
**Mode**: co-creation (híbrido — mock como referencia + decisiones abiertas)
**Status**: completed

## Problem Statement

La página Home solo renderiza un `<h1>` con `villaName`. Hay que montar el **layout/HTML completo y responsive** de la landing de la villa, leyendo textos e imágenes desde Content Island (modelo y server function ya existen), usando Tailwind v4 y componentes shadcn donde aplique. El calendario de disponibilidad es un **paso 2** (placeholder ahora).

### Descubierto en la exploración del codebase

- **Stack**: TanStack Start + React 19, Tailwind v4 (`@tailwindcss/vite`), shadcn (style `radix-nova`, baseColor `neutral`, cssVariables), lucide-react. Solo `button` y `dropdown-menu` instalados como shadcn.
- **Tema propio ya montado** en `src/styles.css`: sistema "isla/mar" con variables CSS (`--sea-ink`, `--sea-ink-soft`, `--lagoon`, `--lagoon-deep`, `--palm`, `--sand`, `--foam`, `--surface`, `--line`, `--kicker`…), fuentes **Fraunces** (display, clase `.display-title`) + **Manrope** (sans), **light/dark mode** con `ThemeToggle` y script anti-flash en `__root.tsx`. Utilidades listas: `.page-wrap`, `.island-shell`, `.feature-card`, `.island-kicker`, `.rise-in`, `.nav-link`.
- **Header y Footer globales** en `__root.tsx` son **boilerplate de TanStack** (texto "TanStack Start", links a Docs/GitHub) y **no leen de Content Island**.
- **Modelo Content Island** (`src/pods/home/home.model.ts`) — `FullMainPage` agrupa:
  - `headerSection`: `logo: Media`, `villaName`, `navigationLinks: NavLink[]`
  - `heroSection`: `starText`, `title`, `location`, `"description "` (⚠️ con espacio final), `featuresSummary: HeroSummaryFeature[]` (`name`/`value`), `Pictures: Picture[]` (`picture: Media` + `description`)
  - `featureSection`: `topTitle`, `mainTitle`, `features: Feature[]` (`type: FeatureType` + `text`), `bookingInfo`
  - `availabilitySection`: `topTitle`, `freeLabel`, `BusyLabel`, `selectionLabel`, `rangeSelectedTopTitle`, `rangeSelectedMainTitle`, `CheckAvailabilityLabel`
  - `footerSection`: `copyRight`, `privacyPolicy: NavLink`
  - `FeatureType` = `"beach" | "bathrooms" | "bedrooms" | "guests" | "wifi" | "kitchen" | "parking" | "aircon"`
- **`Media`** (confirmado en `@content-island/api-client`): `{ name: string; url: string }`.
- **Server fn** `getHomePageContent` (`home.server.ts`): `getContent<FullMainPageVm>({ contentType: "FullMainPage", includeRelatedContent: "all" })` → mapper passthrough. Loader en `routes/index.tsx`.
- El mock aportado (villa "Cala Serena") **coincide con el dominio real**; sirve de referencia visual, no de implementación literal.

## User Stories

1. Como visitante, quiero ver un **hero** con nombre, ubicación, descripción y un resumen de capacidades de la villa, para entender la oferta de un vistazo.
2. Como visitante, quiero un **carrusel de fotos** navegable (flechas + dots, swipe en móvil), para explorar la propiedad.
3. Como visitante, quiero ver la **lista de características** con iconos, para saber qué incluye la villa.
4. Como visitante en móvil, quiero que **todo se adapte** a mi pantalla, para navegar cómodamente.
5. Como visitante, quiero ver la sección de **disponibilidad** con el mes actual y una leyenda, aunque el calendario aún no sea interactivo, para anticipar cómo reservaré.
6. Como visitante, quiero un **header** con logo, nombre y navegación, y un **footer** con copyright y política de privacidad, coherentes en todas las páginas.
7. Como visitante, quiero poder alternar **claro/oscuro** y que la Home respete mi preferencia, para leer cómodamente.
8. Como editor de contenido, quiero que **textos e imágenes** de la Home vengan de Content Island, para actualizarlos sin tocar código.

## Product / UX Decisions

- **Theming**: mapear el mock al **tema isla existente** (variables CSS) — porque mantiene **dark mode** y el `ThemeToggle` operativos; la villa conserva la identidad mar/isla del proyecto en vez de la paleta arena/teal/terracota solo-claro del mock.
- **Header/Footer**: **reescribir** los boilerplate de TanStack para que consuman Content Island (`headerSection` / `footerSection`) — es el propósito del modelo. Viven en el **layout principal** (`__root.tsx`), separados del pod Home. El `ThemeToggle` se mantiene en el header.
- **CTA "Consultar disponibilidad"** (`CheckAvailabilityLabel`): **placeholder no-op** por ahora (botón estilado sin acción real) — coherente con "el calendario es el paso 2".
- **Carrusel**: **shadcn Carousel** (idiomático, accesible, swipe en móvil) — encaja con "usa shadcn donde aplique".
- **Sección de disponibilidad**: **card completa + slot vacío** — se construye todo el chrome (topTitle, mes+año actual, leyenda con `freeLabel`/`BusyLabel`/`selectionLabel`, caja de rango con `rangeSelectedTopTitle`/`rangeSelectedMainTitle`, botón CTA) y donde irá la rejilla, una caja marcada "calendario próximamente". La card se ve terminada y el hueco del calendario queda evidente.
- **Animaciones**: **solo CSS existente** (`.rise-in`, `tw-animate-css`) para entradas sutiles — cero dependencias nuevas; se descarta `framer-motion`.

## Technical Decisions

- **Fetch de datos**:
  - **Layout** (`__root.tsx`): **consultas separadas** para header y footer — `getContent<HeaderSection>({ contentType: "HeaderSection" })` y `getContent<FooterSection>({ contentType: "FooterSection" })` (server fns nuevas, p.ej. `getHeaderContent` / `getFooterContent`), consumidas en el loader del root.
  - **Home** (`routes/index.tsx`): se **mantiene** `getHomePageContent` (FullMainPage) tal cual; el pod Home **solo renderiza** hero/features/availability e ignora header/footer de esa respuesta. (Trade-off aceptado: header/footer viajan duplicados/ignorados en la respuesta de FullMainPage.)
- **Estructura de ficheros**:
  ```
  src/pods/home/
    home.pod.tsx            (compone las secciones)
    components/
      hero.component.tsx
      photo-carousel.component.tsx
      features.component.tsx
      availability.component.tsx
  src/components/
    Header.tsx              (recableado a CI)
    Footer.tsx              (recableado a CI)
  ```
- **shadcn a instalar**: `card` y `carousel` (añade dependencia `embla-carousel-react`). `button` ya existe.
- **Mapeo `FeatureType` → icono lucide**: `beach→Waves`, `bedrooms→BedDouble`, `bathrooms→Bath`, `guests→Users`, `wifi→Wifi`, `kitchen→Utensils`, `parking→Car`, `aircon→Snowflake`. Objeto lookup; fallback neutro si llega un type no contemplado.
- **Mes actual**: calculado en el **loader (servidor)** con `new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })`, primera letra capitalizada — evita mismatch de hidratación SSR/cliente.
- **Campo `"description "`**: acceso por corchetes `heroSection["description "]` (el nombre del campo en CI lleva espacio final).
- **Imágenes**: `src={media.url}`; `alt` del logo = `villaName`, `alt` de cada foto = `picture.description`.
- **Carrusel**: client component (estado de embla); el resto de secciones pueden ser server-rendered. `photoIndex`/dots gestionados por el API de embla de shadcn Carousel.
- **Estilado**: clases Tailwind con variables del tema (`bg-[var(--surface)]`, `text-[var(--sea-ink)]`, `border-[var(--line)]`, acento `var(--lagoon-deep)`) reutilizando utilidades existentes (`.island-shell`, `.feature-card`, `.island-kicker`, `.page-wrap`).

## Testing Decisions

- **Mapeo `FeatureType`→icono**: unit test del lookup (cada type devuelve el icono esperado + fallback).
- **Cálculo del mes actual**: unit test del helper de formateo es-ES con fecha fija (capitalización correcta).
- **Render de secciones**: integración ligera (Testing Library) — dado un `FullMainPageVm` mock, el pod Home pinta hero/features/availability con los textos correctos y el carrusel con N fotos.
- **Acceso a `"description "`**: cubierto por el test de render del hero (verifica que el texto aparece pese al espacio en el nombre de campo).
- **No testear ahora**: interactividad del calendario (no existe), comportamiento de swipe de embla (librería de terceros), animaciones CSS.

## Out of Scope

- **Calendario de disponibilidad interactivo** (selección de rango, días ocupados, conexión a servicio) — paso 2.
- **Formulario / página de contacto** (el mock lo tenía; no hay modelo CI para ello).
- **Acción real del CTA** "Consultar disponibilidad" (queda no-op).
- **i18n / multi-idioma** (modelo es solo `"es"`).
- **Edición de contenido en CI** (solo lectura).

## Discarded Alternatives

- **Copiar la paleta hardcodeada del mock**: descartado — rompería el dark mode existente y dejaría el `ThemeToggle` sin efecto en Home.
- **Nueva paleta del mock en variables con versión dark**: descartado por ahora — más trabajo del necesario; el tema isla ya da identidad coherente.
- **Split completo de la fetch de Home por sección**: descartado — obligaba a refactor de model/vm/mapper/server; se prioriza cambio mínimo manteniendo FullMainPage.
- **Carrusel propio con useState / grid estático**: descartado — shadcn Carousel da accesibilidad y swipe sin reinventar.
- **`framer-motion`**: descartado — dependencia y peso JS extra cuando ya hay animaciones CSS.
- **Header/Footer estáticos o dejarlos como boilerplate**: descartado — el modelo CI existe precisamente para alimentarlos.

## Assumptions

- Los content types `HeaderSection` y `FooterSection` son consultables por separado vía `getContent({ contentType })` (entradas únicas por tipo).
- `Media.url` es una URL directamente usable en `<img src>` (sin transformaciones obligatorias).
- `heroSection.featuresSummary` (pares `name`/`value`) alimenta las cajas-resumen del hero (equivalente a "8 huéspedes / 4 dormitorios…" del mock).
- El nombre de campo `"description "` con espacio final es real en CI (tal como está tipado) y no un error a corregir en el modelo.
- Las fotos del carrusel (`Pictures`) tienen al menos 1 elemento.

## Risks

- **Campo `"description "` con espacio**: frágil ante un futuro renombrado del campo en CI; conviene aislar el acceso en el mapper/VM para no esparcir el corchete por la UI.
- **Datos duplicados en FullMainPage**: header/footer se traen en la respuesta de Home aunque no se usen; impacto menor de payload, aceptado.
- **`Media` sin `width`/`height`**: posible CLS (layout shift) al cargar imágenes; mitigar con `aspect-ratio`/contenedores de tamaño fijo en hero/carrusel.
- **Listas vacías desde CI** (`features`, `Pictures`, `navigationLinks`): la UI debe degradar con elegancia (no romper si llega `[]`).
- **shadcn `radix-nova` + tema isla**: los componentes shadcn usan variables `--primary`/`--card`… (neutral). Hay que asegurar que Card/Carousel encajen visualmente con el tema isla (posible override de clases).

## Open Points

- [ ] Confirmar que `HeaderSection`/`FooterSection` se consultan por `contentType` (vs requerir `id`).
- [ ] Definir layout responsive fino del hero (orden imagen/texto en móvil) siguiendo el mock.
- [ ] Estado de carga/error de los loaders (skeletons vs nada) — no decidido.
- [ ] Texto/diseño exacto del placeholder "calendario próximamente".

## Next Steps

- [ ] Ejecutar `prd-to-plan` para crear las fases de implementación (tracer bullets: layout estático → datos CI → carrusel → placeholder disponibilidad).
- [ ] Tras el plan, `prd-to-issues` para generar issues en GitHub.
- [ ] Instalar shadcn `card` y `carousel` como primer paso técnico.
- [ ] Paso 2 (futuro): calendario de disponibilidad interactivo conectado a servicio.
