import { Outlet, createFileRoute, useLoaderData } from '@tanstack/react-router'
import Footer from '../components/Footer'
import Header from '../components/Header'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

/**
 * Layout de la parte pública (marketing): envuelve las rutas con la chrome de
 * Header/Footer. Las pantallas de `(auth)` quedan fuera de este layout, así que
 * el login se ve limpio, sin la navegación pública.
 *
 * El contenido de Header/Footer lo carga el loader del root (donde también se
 * usa para el `<title>`), así que aquí lo leemos en lugar de volver a pedirlo.
 */
function AppLayout() {
  const { header, footer } = useLoaderData({ from: '__root__' })
  return (
    <>
      <Header content={header} />
      <Outlet />
      <Footer content={footer} />
    </>
  )
}
