# React 2026

Material del curso de React impartido en [Lemoncode](https://lemoncode.net/), orientado a aprender a desarrollar aplicaciones modernas con React desde una base sólida hasta la construcción de una aplicación completa usando un metaframework actual.

## Objetivo del curso

El objetivo de este repositorio es servir como guía práctica y material de apoyo para aprender React en la actualidad, entendiendo no solo la API de la librería, sino también los fundamentos necesarios para tomar buenas decisiones de diseño, arquitectura y desarrollo.

A lo largo del curso se trabaja de forma progresiva: primero se adquiere una base sólida de JavaScript y buenas prácticas de desarrollo, después se estudian los fundamentos de React y, finalmente, se construye una aplicación completa con TanStack Start resolviendo problemas habituales en proyectos reales.

## Enfoque del curso

React no se aprende únicamente memorizando hooks o copiando ejemplos. Para desarrollar con criterio es importante comprender antes conceptos como inmutabilidad, funciones puras, composición, gestión del estado, renderizado y separación de responsabilidades.

Además, el curso introduce el uso de herramientas de IA como Claude Code como apoyo al desarrollo, pero siempre desde una premisa clara: para aprovechar bien estas herramientas es necesario tener criterio técnico. La IA puede acelerar el trabajo, pero la calidad del resultado depende de la capacidad del desarrollador para entender, guiar, revisar y corregir lo que se genera.

## Contenidos

### 1. Desarrollo asistido con Claude Code

Introducción al uso de Claude Code en un flujo de desarrollo moderno:

- Cómo plantear tareas a una herramienta de IA.
- Cómo usar IA para explorar, generar y refactorizar código.
- Límites del desarrollo asistido por IA.
- Por qué sigue siendo imprescindible adquirir una buena base técnica.
- Cómo revisar críticamente el código generado.

### 2. Fundamentos de desarrollo

Antes de entrar en React se trabajan conceptos esenciales para escribir código mantenible:

- Inmutabilidad.
- Funciones puras.
- Composición de funciones.
- Separación de responsabilidades.
- Modelado de datos.
- Estado frente a datos derivados.
- Código predecible y fácil de testear.

### 3. Fundamentos de React

Bloque dedicado a comprender React desde sus principios:

- Componentes.
- JSX.
- Props.
- Estado local.
- Eventos.
- Renderizado.
- Hooks.
- Composición de componentes.
- Comunicación entre componentes.
- Listas y renderizado condicional.
- Buenas prácticas para estructurar componentes.

### 4. Aplicaciones modernas con TanStack Start

Una vez asentados los fundamentos, el curso introduce el uso de un metaframework moderno con TanStack Start:

- Estructura de una aplicación con TanStack Start.
- Rutas y navegación.
- Carga de datos.
- Server rendering y client rendering.
- Integración con TanStack Router.
- Gestión de caché.
- Organización de una aplicación real.

### 5. Desarrollo de una aplicación completa

El curso culmina con la construcción de una aplicación completa, aplicando los conceptos anteriores y resolviendo problemas habituales:

- Navegación entre pantallas.
- Validación de formularios.
- Formularios mantenibles.
- Renderizado en servidor y cliente.
- Estrategias de caché.
- Gestión de errores.
- Organización del código.
- Patrones comunes en aplicaciones reales.

## Requisitos previos

Para seguir el curso es recomendable tener conocimientos básicos de:

- HTML.
- CSS.
- JavaScript moderno.
- Uso básico de terminal.
- Git y GitHub.
- Node.js y npm/pnpm/yarn.

No es necesario tener experiencia previa avanzada con React, aunque sí ayuda haber construido alguna interfaz sencilla con JavaScript.

## Estructura del repositorio

La estructura exacta puede evolucionar a lo largo del curso, pero el repositorio está pensado para organizar el material por bloques temáticos, ejemplos y ejercicios prácticos.

```txt
react-2026/
├─ 00-claude-code/
├─ 01-fundamentos-desarrollo/
├─ 02-react-fundamentals/
├─ 03-tanstack-start/
├─ 04-app-completa/
└─ README.md
```

## Cómo usar este repositorio

Puedes utilizar este repositorio de varias formas:

1. Como material de seguimiento durante las clases.
2. Como referencia para repasar conceptos después de cada bloque.
3. Como base para practicar los ejercicios propuestos.
4. Como punto de partida para experimentar con React, TanStack Start y herramientas modernas de desarrollo.

Se recomienda avanzar de forma ordenada, ya que los bloques están diseñados para construir conocimiento de forma progresiva.

## Instalación

Clona el repositorio:

```bash
git clone https://github.com/<usuario-o-organizacion>/react-2026.git
cd react-2026
```

Instala las dependencias del ejemplo o aplicación correspondiente:

```bash
npm install
```

O, si el proyecto usa pnpm:

```bash
pnpm install
```

## Ejecución

Para arrancar el proyecto en modo desarrollo:

```bash
npm run dev
```

O con pnpm:

```bash
pnpm dev
```

Después abre la URL indicada por la terminal, normalmente:

```txt
http://localhost:3000
```

## Tecnologías principales

- React.
- TypeScript.
- TanStack Start.
- TanStack Router.
- Herramientas modernas de desarrollo frontend.
- Claude Code como apoyo al flujo de desarrollo.

## Sobre Lemoncode

[Lemoncode](https://lemoncode.net/) es una comunidad y escuela especializada en formación técnica para desarrolladores, con foco en tecnologías modernas de desarrollo web y buenas prácticas de ingeniería de software.
