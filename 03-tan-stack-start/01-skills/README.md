# Vamos ahora a por los skills que queremos usar

Lo primero vamos a instalar el skill de Claude para Front End:

```bash
/plugin marketplace add anthropics/claude-code
```

```bash
/plugin install frontend-design@claude-plugins-official
```

Ahora vamos a copiar una serie de skills del repositorio de demos de este curso.

Aquí tienes una guía de para qué sirven, y conforme avancemos con el proyecto, iremos tocando alguno.

Lo copiaremos en la ruta del proyecto

```
.claude/skills
```

El único que no vamos a usar es el de "project setup" que a su vez tira de blueprints, y que configuraría nuestro proyecto de una forma concreta.

# Guía de skills — `skills-para-copiar`

Resumen de las 12 skills disponibles en `skills-para-copiar/`. Cada skill es un conjunto de instrucciones reutilizables que el agente carga bajo demanda para guiar una tarea concreta (diseñar, planificar, revisar, implementar, etc.).

> Las skills marcadas como parte de **la cadena PRD** (`grill-me → ui-design → prd-to-plan → prd-to-issues → feature-flow`) se encadenan una tras otra: cada una toma como entrada el output de la anterior.

---

## Mapa rápido por categoría

| Categoría | Skills |
|-----------|--------|
| **Producto / discovery** | `grill-me`, `ui-design` |
| **Planificación** | `prd-to-plan`, `prd-to-issues` |
| **Implementación** | `project-setup`, `feature-flow`, `tdd`, `tanstack-form` |
| **Calidad** | `pr-review`, `triage-issue` |
| **Integraciones / dominio** | `content-island-api-skill` |
| **Meta** | `write-a-skill` |

---

## 1. `grill-me` — Construir un PRD interrogando al usuario

**Para qué sirve:** entrevista relentlessly al usuario sobre una idea o plan hasta llegar a un PRD bien definido. Detecta dos modos:

- **Validation** → el usuario trae un plan estructurado y la skill lo desafía.
- **Co-creation** → el usuario trae una idea vaga y la skill construye el plan juntos vía preguntas socráticas + propuestas con trade-offs.

**Cuándo invocarla:** "quiero hacer un PRD", "necesito que me grilles el plan", "ayúdame a definir requisitos".

**Output:** `./plans/prd-<topic>-<date>.md`

**Encaja en la cadena:** primer paso → siguiente es `ui-design` o `prd-to-plan`.

---

## 2. `ui-design` — Diseñar pantallas y sistema de diseño con Pencil

**Para qué sirve:** diseña pantallas y monta un design system usando Pencil (editor `.pen` integrado en el IDE). Sincroniza tokens entre `tokens.css` (única fuente de verdad) y variables de Pencil. **Regla de oro:** cada elemento usa `$variables`, nunca valores hardcodeados.

**Tres modos automáticos:**
- **Setup** — no existe `designs/` → crea tokens + librería base.
- **Screen design** — diseña una pantalla nueva con los tokens existentes.
- **Evolution** — añade tokens o componentes incrementales.

**Output:** carpeta `designs/` con `tokens.css`, `ui-kit.lib.pen`, `<screen>.pen`, `sitemap.md`.

**Encaja en la cadena:** opcional entre `grill-me` y `prd-to-plan`.

---

## 3. `prd-to-plan` — PRD → plan de fases (tracer bullets)

**Para qué sirve:** convierte un PRD en un plan multi-fase, donde **cada fase es un vertical slice** end-to-end (no horizontal por capas). Cada fase es demoable por sí sola.

**Workflow:** lee el PRD → explora el código → extrae decisiones durables (rutas, schema, modelos) → propone fases con dependencias → etiqueta cada fase como **AFK** (puede ejecutarse sin supervisión) o **HITL** (requiere humano).

**Output:** `./plans/plan-<feature>.md`

**Encaja en la cadena:** entre `grill-me` y `prd-to-issues`.

---

## 4. `prd-to-issues` — Plan → issues de GitHub

**Para qué sirve:** convierte cada fase del plan en un issue independiente de GitHub. Los issues llevan suficiente contexto para implementarse sin releer el plan, pero referencian la fuente.

**Workflow:** lee `./plans/plan-*.md` → confirma fases con usuario → crea issues con `gh issue create` **en orden de dependencias** (bloqueantes primero) → aplica labels `AFK`/`HITL` → muestra grafo final.

**Encaja en la cadena:** último paso antes de empezar a implementar con `feature-flow`.

---

## 5. `project-setup` — Bootstrap de un proyecto desde cero

**Para qué sirve:** workflow interactivo para arrancar proyectos TypeScript. Pregunta:
1. **Modo:** standalone o monorepo.
2. **Preset:** Frontend SPA / Backend API / Library.
3. **Opciones** (solo Frontend): CSS framework, librería de iconos.

Carga blueprints (`.claude/blueprints/`) según las respuestas y genera todo el tooling transversal: tsconfig, Oxlint, Prettier, Husky, ENV reader, `.gitignore`, VSCode settings, Dependabot, scripts npm, `CLAUDE.md`.

**Reglas clave:** siempre versiones latest (con `npm view`), nada de `.ts` en imports, usa subpath imports `#*` nativos.

---

## 6. `feature-flow` — Implementar un issue end-to-end

**Para qué sirve:** orquesta la ejecución completa de un issue de GitHub: sync de la base branch → crea feature branch → implementa con commits pequeños y enfocados → push → abre PR.

**Es un orquestador:** NO contiene reglas de arquitectura ni testing. Carga blueprints según el scope del issue (frontend/backend/full-stack/infra/monorepo).

**Reglas no negociables:**
- Mínimo scope (no añadir nada fuera del issue).
- Commits pequeños con formato `#<NUM>: descripción`.
- Build + tests deben pasar antes del PR.
- Nada de dependencias sin justificar.

**Input:** número o URL de issue. **Output:** PR con `Closes #N`.

---

## 7. `tdd` — Red-Green-Refactor incremental

**Para qué sirve:** guía el ciclo TDD vertical: **un test → mínimo código → siguiente test**. Nunca escribir todos los tests primero y luego todo el código (anti-patrón horizontal).

**Principio:** los tests verifican comportamiento a través de interfaces públicas, no detalles de implementación. "Un buen test se lee como una especificación".

**Cuándo NO aplicar TDD:** schemas Zod, configuración, tipos, barrels, constantes, migraciones, i18n estático, setup de logger/env.

**Mocking:** `vi.spyOn` por defecto, mockear solo en límites del sistema (APIs externas, BD, tiempo). Nunca mockear módulos propios.

---

## 8. `tanstack-form` — Formularios con TanStack Form + Zod

**Para qué sirve:** obliga a usar **TanStack Form + Zod** en todos los formularios de `apps/web`, reutilizando wrappers de `apps/web/src/common/components/forms`.

**Workflow obligatorio:**
1. Schema Zod en `<form>.schema.ts` con `type FormValues = z.infer<...>`.
2. `useForm` con `validators: { onBlur: schema, onSubmit: schema }`.
3. Usar wrappers (`<TextField form={form} name="email" .../>`); si no existen, crear uno siguiendo el patrón de `text-field.component.tsx`.
4. `onSubmitInvalid` → toast roja con DaisyUI.

**Reglas UX/a11y no negociables:** errores solo tras blur/submit, `<p role="alert">`, `aria-invalid`, `aria-describedby`, `<label htmlFor>` real, `noValidate` en el `<form>`.

---

## 9. `pr-review` — Revisión multi-agente de un PR

**Para qué sirve:** lanza **7 agentes expertos en paralelo** sobre el diff de un PR y consolida los hallazgos en un informe estructurado.

**Las 7 lentes:**
| Agente | Foco |
|--------|------|
| Security | Vulnerabilidades, auth, secretos, inyecciones |
| Architecture | Boundaries entre capas, acoplamiento |
| Duplication | Copy-paste, reutilización perdida |
| Testing | Coverage, edge cases, calidad de tests |
| Performance | N+1, memoria, complejidad, escalabilidad |
| Readability | Naming, complejidad, claridad |
| Accessibility | WCAG, semántica, teclado, foco |

**Severidad:** 🔴 Critical / 🟠 Important / 🟡 Suggestion. Output como PR comment con `gh pr comment`.

---

## 10. `triage-issue` — Investigar un bug y crear issue con plan TDD

**Para qué sirve:** investiga primero (codebase, git log, tests, error handling), pregunta después. Encuentra la **causa raíz** y diseña un plan TDD con ciclos RED-GREEN ordenados.

**Workflow:**
1. Capturar problema (UNA pregunta máximo si hace falta).
2. Explorar y diagnosticar.
3. Identificar fix mínimo en la causa raíz.
4. Diseñar plan TDD vertical (un test → un fix → siguiente).
5. Confirmar con usuario → crear issue con `gh issue create`.

**Principio:** "Investigate first, ask later." Mínimas preguntas, máximo diagnóstico.

---

## 11. `content-island-api-skill` — Cliente API de Content Island

**Para qué sirve:** asistente especializado para trabajar con `@content-island/api-client`, **estrictamente** ceñido a la documentación oficial.

**Regla anti-hallucination obligatoria:** si el usuario pregunta algo que NO está en los docs permitidos, debe responder literalmente:
> "I don't know for sure — this is not documented in the official Content Island Client API documentation."

**API permitida:** `createClient`, `getContentList<T>`, `getContent<T>`, `getRawContentList`, `getRawContent`, `mapContentToModel<T>`. Tokens siempre vía `process.env`, nunca hardcoded; prefijo `PREVIEW_` para contenido en borrador.

---

## 12. `write-a-skill` — Crear nuevas skills

**Para qué sirve:** meta-skill para crear más skills con la estructura correcta y **progressive disclosure** (cargar el mínimo, diferir detalles a ficheros compañeros).

**Estructura estándar:**
```
skill-name/
├── SKILL.md       ≤100 líneas — instrucciones principales
├── reference.md   (opcional) — reglas detalladas, config
├── examples.md    (opcional) — escenarios con código
└── scripts/       (opcional) — utilidades deterministas
```

**Secciones obligatorias en SKILL.md:** frontmatter (`name`, `description`), Core Principle, Dependencies, MANDATORY RULES, Verification Checklist, Uncontemplated Scenarios.

**Clave:** el `description` del frontmatter es lo único que el agente ve al decidir qué skill cargar → debe ser preciso, en tercera persona, con triggers/keywords naturales.

---

## La cadena completa de discovery → entrega

```
        grill-me            ←  idea / plan vago
           ↓
        (PRD)
           ↓
   [opcional] ui-design     ←  diseñar pantallas
           ↓
       prd-to-plan          ←  fases tracer-bullet
           ↓
      prd-to-issues         ←  issues en GitHub
           ↓
      feature-flow          ←  implementar issue
           ↓                    + tdd
       pr-review            ←  revisar PR antes de merge
```

Y en paralelo, según necesidad:

- **`project-setup`** cuando arrancas un proyecto nuevo.
- **`triage-issue`** cuando aparece un bug → genera issue → vuelve al flujo con `feature-flow`.
- **`tanstack-form`** cuando el issue toca formularios en `apps/web`.
- **`content-island-api-skill`** cuando hay que consumir el CMS.
- **`write-a-skill`** cuando detectas un patrón repetitivo que merece su propia skill.
