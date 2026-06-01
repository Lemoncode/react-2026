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

Si hacemos un build podemos ver que tenemos en `.output/public/index.html` el HTML generado.

Pero tenemo un problema y es que la disopniblidad si la quiero en tiempo real ¿Qué podemos hacer? Pues mover esa parte a un componente client only.

Para ello quitamos del hompe page la parte de disponibilidad y la movemos a un componente client only.

_./src/routes/index.tsx_

```diff
import { createFileRoute } from "@tanstack/react-router";
import { getHomePageContent } from "@/pods/home/home.api";
import { getAvailabilityByMonth } from "@/pods/home/availability.api";
import { Home } from "@/pods/home";

export const Route = createFileRoute("/")({
  loader: async () => {
-    const now = new Date();
-    const [content, availability] = await Promise.all([
-      getHomePageContent(),
-      getAvailabilityByMonth({
-        data: {
-          month: now.getMonth() + 1,
-          year: now.getFullYear(),
-          monthsAhead: 1,
-        },
-      }),
-    ]);
-    return { content, availability };
+   const content = await getHomePageContent();
+    return { content };
  },
  component: App,
});

function App() {
-  const { content, availability } = Route.useLoaderData();
+  const { content } = Route.useLoaderData();
-  return <Home content={content} availability={availability} />;
+  return <Home content={content} />;
}
```

