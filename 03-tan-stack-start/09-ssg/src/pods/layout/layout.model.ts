// El layout (header/footer) comparte el modelo de contenido con la Home.
// Se reexportan los tipos relevantes para que los componentes del layout
// importen desde aquí y no dependan directamente del pod home.
export type { HeaderSection, FooterSection, NavLink } from "@/pods/home/home.model";
