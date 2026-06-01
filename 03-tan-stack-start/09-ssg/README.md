# SSG

IMPORTANTE: ahora partimos del ejemplo 07 !!!!

Copiamos del ejemplo 07.

Queremos que la página cargue como un tiro y no depender de la velocidad del Headless CMS

¿Qué podemos hacer? Pregenar la página en HTML y servirla como un archivo estático, esto es lo que suelen hacer muy bien Frameworks como Astro.

Pero aquí en la home tenemos un problema:

- Hay una parte que no cambia nunca.
- Hay otra para que es es la gestión de disponiblidad que si tiene que estar al día.

Vamos a por una solución de compromiso:

- Prerrendizo la parte que no cambia nunca.
- La parte que si cambia la muevo como client only.

Empezamos por generar la página de forma estática:

./vite.config.ts

```diff
const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart(
+    {      
+      prerender: {
+        enabled: true,
+        autoStaticPathsDiscovery: false,
+        crawlLinks: false,
+      },
+      pages: [
+        {
+          path: '/',
+          prerender: {
+            enabled: true,
+            outputPath: '/index.html',
+          },
+        },
+      ],
+   }
    ),
    viteReact(),
  ],
})
```
