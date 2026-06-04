# Importante

Rama 0 skills y plugin front y asegurar que está activo

Arrancar claude e instalar skill de diseño:

Instalar skills de diseño:

```
/plugin marketplace add anthropics/claude-code
```

```
/plugin install frontend-design@claude-plugins-official
```

Copiar también carpeta de skills.

# Prompt

/grill-me Quiero crear un sitio web con:

- Typescript
- TanStack Start
- Tailwind CSS
- Shadcn y componentes específicos que le vengan bien al proyecto, como por ejemplo un selector de fechas de calendario en el que se ven los días con sus ocupaciones y se puede seleccionar un rango.

La idea es que quiero que me generes un diseño de una página que ponga una casa en alquiler vacacional en la costa, en español. La primera página debe presentar la propiedad con un carrusel de fotos, el nombre de la villa, dónde se encuentra, descripción, características —lo que tú veas—, y ahí un calendario de disponibilidad de los típicos que te marcan si está ocupada o no y puedes elegir un rango de fechas. Los colores deben ser mediterráneos, algo que transmita tranquilidad.

Me haces también la segunda página de cuando le das a consultar disponibilidad, donde pides nombre, apellidos, email de contacto, teléfono, rango de fechas —ya seleccionado si se ha seleccionado en la página anterior—, comentarios, y botón de “Informarme”, que simularía el envío de un correo. Una vez que se pinche, se le indica que será contactado por email.

Quiero que use el skill de pods para generar la estructura y que en el pod además estén las Server Functions. La lectura de los datos de la villa debe estar en una Server Function; más adelante usaremos Content Island para leerlo, y debe consumirse en un loader para poder mostrarlo con SSR con una caché adecuada.

El calendario de disponibilidad tiene que estar en otra Server Function y eso tiene que cargarse de forma dinámica usando streaming. Lo mismo: simulamos algo que más adelante tirará de una base de datos. No quiero crear un backend separado; con Server Functions nos podemos apañar. Para los días disponibles usa datos mock y después ya los pasaremos a BBDD.

Las Server Functions mételas dentro del pod que toque y que se llamen del tipo `XXXX.server.ts`.

Sácame también un tematizado que sea compatible con Tailwind y shadcn.

Te paso un prototipo que tengo para que te hagas una idea de lo que quiero:

```jsx
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Waves,
  BedDouble,
  Bath,
  Users,
  Wifi,
  Car,
  Utensils,
  Snowflake,
  CalendarDays,
  ShieldCheck,
  Star,
  ArrowLeft,
  MailCheck,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const photos = [
  {
    title: "Terraza frente al mar",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Salón luminoso",
    url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Dormitorio principal",
    url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Piscina y jardín",
    url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80",
  },
];

const features = [
  { icon: Waves, label: "A 3 min de la playa" },
  { icon: BedDouble, label: "4 dormitorios" },
  { icon: Bath, label: "3 baños completos" },
  { icon: Users, label: "Hasta 8 huéspedes" },
  { icon: Wifi, label: "Wi‑Fi de alta velocidad" },
  { icon: Car, label: "Parking privado" },
  { icon: Utensils, label: "Cocina equipada" },
  { icon: Snowflake, label: "Aire acondicionado" },
];

const occupiedDays = new Set([6, 7, 8, 15, 16, 17, 18, 24, 25, 29]);

export default function VillaMediterraneaLanding() {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selectedStart, setSelectedStart] = useState(10);
  const [selectedEnd, setSelectedEnd] = useState(14);
  const [page, setPage] = useState("home");
  const [sent, setSent] = useState(false);

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  const prevPhoto = () =>
    setPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const nextPhoto = () =>
    setPhotoIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  const handleDayClick = (day) => {
    if (occupiedDays.has(day)) return;
    if (!selectedStart || selectedEnd) {
      setSelectedStart(day);
      setSelectedEnd(null);
    } else if (day < selectedStart) {
      setSelectedStart(day);
    } else {
      const hasOccupiedInside = Array.from(
        { length: day - selectedStart + 1 },
        (_, i) => selectedStart + i,
      ).some((d) => occupiedDays.has(d));
      if (!hasOccupiedInside) setSelectedEnd(day);
    }
  };

  const isInRange = (day) =>
    selectedStart && selectedEnd && day >= selectedStart && day <= selectedEnd;
  const selectedRangeLabel =
    selectedStart && selectedEnd
      ? `${selectedStart} julio — ${selectedEnd} julio`
      : selectedStart
        ? `${selectedStart} julio — selecciona salida`
        : "Selecciona tus fechas";

  if (page === "contact") {
    return (
      <main className="min-h-screen bg-[#F8F3EA] text-[#24423D]">
        <section className="relative overflow-hidden px-5 py-8 md:px-10 lg:py-14">
          <div className="absolute inset-0 bg-gradient-to-br from-[#DCEFE9] via-[#F8F3EA] to-[#F1D6B8]" />
          <div className="absolute left-[-8%] top-[-18%] h-80 w-80 rounded-full bg-[#7FB7A8]/25 blur-3xl" />
          <div className="absolute bottom-[-14%] right-[-10%] h-96 w-96 rounded-full bg-[#DFAE7E]/30 blur-3xl" />

          <div className="relative mx-auto max-w-6xl">
            <Button
              onClick={() => setPage("home")}
              className="mb-7 rounded-full bg-white/70 px-5 text-[#24423D] shadow-sm backdrop-blur hover:bg-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la villa
            </Button>

            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="rounded-[2rem] bg-white/70 p-4 shadow-xl shadow-[#6D8F86]/10 backdrop-blur">
                  <img
                    src={photos[0].url}
                    alt="Villa Cala Serena"
                    className="h-72 w-full rounded-[1.5rem] object-cover"
                  />
                </div>
                <Card className="rounded-[2rem] border-0 bg-white/75 shadow-sm backdrop-blur">
                  <CardContent className="space-y-4 p-7">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C98E5A]">
                      Solicitud de información
                    </p>
                    <h1 className="text-4xl font-semibold tracking-tight text-[#183C38]">
                      Villa Cala Serena
                    </h1>
                    <div className="flex items-center gap-2 text-[#4F6D66]">
                      <MapPin className="h-5 w-5 text-[#C98E5A]" /> Moraira,
                      Costa Blanca · Alicante
                    </div>
                    <div className="rounded-2xl bg-[#EAF4F1] p-5">
                      <p className="text-sm text-[#668078]">
                        Fechas seleccionadas
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[#183C38]">
                        {selectedRangeLabel}
                      </p>
                    </div>
                    <p className="leading-7 text-[#536F68]">
                      Déjanos tus datos y te confirmaremos por email la
                      disponibilidad real, condiciones de reserva y precio final
                      para tu estancia.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
              >
                <Card className="rounded-[2rem] border-0 bg-white shadow-xl shadow-[#6D8F86]/10">
                  <CardContent className="p-7 md:p-9">
                    {!sent ? (
                      <form
                        className="space-y-5"
                        onSubmit={(e) => {
                          e.preventDefault();
                          setSent(true);
                        }}
                      >
                        <div>
                          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#C98E5A]">
                            Contacto
                          </p>
                          <h2 className="text-3xl font-semibold text-[#183C38]">
                            Te informamos de la disponibilidad
                          </h2>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="space-y-2 text-sm font-medium text-[#31544E]">
                            Nombre
                            <input
                              required
                              placeholder="Tu nombre"
                              className="w-full rounded-2xl border border-[#DCEFE9] bg-[#F8F3EA] px-4 py-3 outline-none transition focus:border-[#3F8577] focus:bg-white"
                            />
                          </label>
                          <label className="space-y-2 text-sm font-medium text-[#31544E]">
                            Apellidos
                            <input
                              required
                              placeholder="Tus apellidos"
                              className="w-full rounded-2xl border border-[#DCEFE9] bg-[#F8F3EA] px-4 py-3 outline-none transition focus:border-[#3F8577] focus:bg-white"
                            />
                          </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="space-y-2 text-sm font-medium text-[#31544E]">
                            Email de contacto
                            <input
                              required
                              type="email"
                              placeholder="nombre@email.com"
                              className="w-full rounded-2xl border border-[#DCEFE9] bg-[#F8F3EA] px-4 py-3 outline-none transition focus:border-[#3F8577] focus:bg-white"
                            />
                          </label>
                          <label className="space-y-2 text-sm font-medium text-[#31544E]">
                            Teléfono
                            <input
                              required
                              type="tel"
                              placeholder="+34 600 000 000"
                              className="w-full rounded-2xl border border-[#DCEFE9] bg-[#F8F3EA] px-4 py-3 outline-none transition focus:border-[#3F8577] focus:bg-white"
                            />
                          </label>
                        </div>

                        <label className="space-y-2 text-sm font-medium text-[#31544E]">
                          Rango de fechas
                          <input
                            value={selectedRangeLabel}
                            readOnly
                            className="w-full rounded-2xl border border-[#DCEFE9] bg-[#EAF4F1] px-4 py-3 font-semibold text-[#183C38] outline-none"
                          />
                        </label>

                        <label className="space-y-2 text-sm font-medium text-[#31544E]">
                          Comentarios
                          <textarea
                            rows={5}
                            placeholder="Cuéntanos si viajas con niños, si necesitas cuna, llegada aproximada o cualquier preferencia especial."
                            className="w-full resize-none rounded-2xl border border-[#DCEFE9] bg-[#F8F3EA] px-4 py-3 outline-none transition focus:border-[#3F8577] focus:bg-white"
                          />
                        </label>

                        <Button
                          type="submit"
                          className="w-full rounded-2xl bg-[#C98E5A] py-6 text-base font-semibold text-white hover:bg-[#B77B48]"
                        >
                          <Send className="mr-2 h-5 w-5" /> Informarme
                        </Button>
                        <p className="text-center text-sm text-[#668078]">
                          Al enviar la solicitud no se realiza ningún pago. Solo
                          pedimos tus datos para responderte por email.
                        </p>
                      </form>
                    ) : (
                      <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                        <div className="mb-6 rounded-full bg-[#DCEFE9] p-5 text-[#3F8577]">
                          <MailCheck className="h-12 w-12" />
                        </div>
                        <h2 className="text-4xl font-semibold text-[#183C38]">
                          Solicitud enviada
                        </h2>
                        <p className="mt-4 max-w-md text-lg leading-8 text-[#536F68]">
                          Gracias por tu interés en Villa Cala Serena. Hemos
                          recibido tu consulta y serás contactado por email con
                          la disponibilidad y los detalles de la estancia.
                        </p>
                        <Button
                          onClick={() => {
                            setSent(false);
                            setPage("home");
                          }}
                          className="mt-8 rounded-2xl bg-[#3F8577] px-8 py-6 text-base font-semibold text-white hover:bg-[#337164]"
                        >
                          Volver a la propiedad
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F3EA] text-[#24423D]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#DCEFE9] via-[#F8F3EA] to-[#F1D6B8]" />
        <div className="absolute left-[-10%] top-[-20%] h-80 w-80 rounded-full bg-[#7FB7A8]/25 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-96 w-96 rounded-full bg-[#DFAE7E]/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
              <Star className="h-4 w-4 fill-[#DFAE7E] text-[#DFAE7E]" />
              Villa premium para desconectar junto al Mediterráneo
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-[#183C38] md:text-7xl">
                Villa Cala Serena
              </h1>
              <div className="flex items-center gap-2 text-lg text-[#4F6D66]">
                <MapPin className="h-5 w-5 text-[#C98E5A]" />
                Moraira, Costa Blanca · Alicante
              </div>
              <p className="max-w-2xl text-lg leading-8 text-[#536F68]">
                Una casa luminosa, tranquila y elegante, pensada para vivir la
                costa sin prisas. Disfruta de amaneceres suaves, tardes de
                piscina, cenas al aire libre y calas de aguas turquesa a pocos
                minutos caminando.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/65 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-semibold">8</p>
                <p className="text-sm text-[#668078]">huéspedes</p>
              </div>
              <div className="rounded-2xl bg-white/65 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-semibold">4</p>
                <p className="text-sm text-[#668078]">dormitorios</p>
              </div>
              <div className="rounded-2xl bg-white/65 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-semibold">3</p>
                <p className="text-sm text-[#668078]">baños</p>
              </div>
              <div className="rounded-2xl bg-white/65 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-semibold">220€</p>
                <p className="text-sm text-[#668078]">desde/noche</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <Card className="overflow-hidden rounded-[2rem] border-0 bg-white/70 shadow-2xl shadow-[#6D8F86]/20 backdrop-blur">
              <CardContent className="p-3">
                <div className="relative h-[460px] overflow-hidden rounded-[1.6rem]">
                  <img
                    src={photos[photoIndex].url}
                    alt={photos[photoIndex].title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#24423D] backdrop-blur">
                    {photos[photoIndex].title}
                  </div>
                  <Button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white/80 p-0 text-[#24423D] hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white/80 p-0 text-[#24423D] hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="mt-3 flex justify-center gap-2">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`h-2 rounded-full transition-all ${i === photoIndex ? "w-8 bg-[#3F8577]" : "w-2 bg-[#BCD7D0]"}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[0.9fr_1.1fr] md:px-10 lg:py-16">
        <Card className="rounded-[2rem] border-0 bg-white shadow-sm">
          <CardContent className="space-y-6 p-7">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#C98E5A]">
                Características
              </p>
              <h2 className="text-3xl font-semibold text-[#183C38]">
                Todo preparado para descansar
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl bg-[#F8F3EA] p-4"
                >
                  <div className="rounded-xl bg-[#DCEFE9] p-2 text-[#3F8577]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-[#31544E]">{label}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-[#EAF4F1] p-5 text-[#4F6D66]">
              <div className="mb-2 flex items-center gap-2 font-semibold text-[#24423D]">
                <ShieldCheck className="h-5 w-5 text-[#3F8577]" />
                Reserva tranquila
              </div>
              Check-in flexible, limpieza profesional, atención local y
              recomendaciones personalizadas de playas, restaurantes y rutas
              cercanas.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 bg-white shadow-sm">
          <CardContent className="p-7">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#C98E5A]">
                  <CalendarDays className="h-4 w-4" /> Disponibilidad
                </p>
                <h2 className="text-3xl font-semibold text-[#183C38]">
                  Julio 2026
                </h2>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <i className="h-3 w-3 rounded-full bg-[#DCEFE9]" /> Libre
                </span>
                <span className="flex items-center gap-2">
                  <i className="h-3 w-3 rounded-full bg-[#E8B3A4]" /> Ocupado
                </span>
                <span className="flex items-center gap-2">
                  <i className="h-3 w-3 rounded-full bg-[#3F8577]" /> Selección
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                <div key={d} className="py-2 font-semibold text-[#7C948E]">
                  {d}
                </div>
              ))}
              {days.map((day) => {
                const occupied = occupiedDays.has(day);
                const selected =
                  day === selectedStart ||
                  day === selectedEnd ||
                  isInRange(day);
                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    disabled={occupied}
                    className={`aspect-square rounded-2xl text-sm font-semibold transition-all ${
                      occupied
                        ? "cursor-not-allowed bg-[#F3D6CF] text-[#A96155] line-through"
                        : selected
                          ? "bg-[#3F8577] text-white shadow-lg shadow-[#3F8577]/25"
                          : "bg-[#F1F7F5] text-[#31544E] hover:bg-[#DCEFE9]"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 rounded-3xl bg-[#F8F3EA] p-5">
              <p className="text-sm text-[#668078]">Rango seleccionado</p>
              <p className="mt-1 text-xl font-semibold text-[#183C38]">
                {selectedRangeLabel}
              </p>
              <Button
                onClick={() => setPage("contact")}
                className="mt-4 w-full rounded-2xl bg-[#C98E5A] py-6 text-base font-semibold text-white hover:bg-[#B77B48]"
              >
                Consultar disponibilidad
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
```
