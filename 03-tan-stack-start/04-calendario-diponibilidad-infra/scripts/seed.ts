import { MongoClient } from "mongodb";
import { fakerES as faker } from "@faker-js/faker";

const PROPERTY_ID = "villa_001";
const DB_NAME = "calendar-availability";
const RANDOM_BOOKINGS = 25;
const RANDOM_BLOCKS = 5;

type Interval = { start: Date; end: Date };

type CalendarBlock = {
  propertyId: string;
  type: "booking" | "block";
  subtype?: "maintenance" | "owner_use";
  status: "pending" | "confirmed" | "cancelled";
  startDate: Date;
  endDate: Date;
  nights: number;
  guest?: { id: string; name: string; email: string; phone: string };
  occupancy?: { adults: number; children: number; babies: number; pets: number };
  price?: {
    nightlyRate: number;
    cleaningFee: number;
    touristTax: number;
    discount: number;
    subtotal: number;
    total: number;
    currency: "EUR";
  };
  payment?: {
    status: "pending" | "paid" | "refunded";
    method?: "stripe" | "transfer" | "cash";
    transactionId?: string;
    paidAmount: number;
    paidAt?: Date;
  };
  notes?: { internal?: string; guest?: string };
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
};

const addMonths = (d: Date, n: number) => {
  const x = new Date(d);
  x.setUTCMonth(x.getUTCMonth() + n);
  return x;
};

const overlaps = (a: Interval, b: Interval) =>
  a.start < b.end && a.end > b.start;

const overlapsAny = (candidate: Interval, taken: Interval[]) =>
  taken.some((i) => overlaps(candidate, i));

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const weightedPick = <T extends string>(
  weights: Record<T, number>,
): T => {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return key;
  }
  return entries[0][0];
};

const makeGuest = () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    id: `guest_${faker.string.alphanumeric(8)}`,
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number({ style: "international" }),
  };
};

const makeOccupancy = () => ({
  adults: randInt(1, 4),
  children: randInt(0, 2),
  babies: Math.random() < 0.2 ? 1 : 0,
  pets: Math.random() < 0.15 ? 1 : 0,
});

const makePrice = (nights: number, occupancy: { adults: number }) => {
  const nightlyRate = randInt(120, 220);
  const cleaningFee = randInt(30, 60);
  const touristTax = occupancy.adults * 2 * nights;
  const discount = Math.random() < 0.3 ? randInt(10, 50) : 0;
  const subtotal = nightlyRate * nights;
  const total = subtotal + cleaningFee + touristTax - discount;
  return {
    nightlyRate,
    cleaningFee,
    touristTax,
    discount,
    subtotal,
    total,
    currency: "EUR" as const,
  };
};

const buildFixedScenarios = (today: Date): CalendarBlock[] => {
  const blocks: CalendarBlock[] = [];

  // 1. Reserva confirmada y pagada, mes próximo del 15 al 20
  {
    const nextMonth = addMonths(today, 1);
    const start = startOfDay(
      new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), 15)),
    );
    const end = addDays(start, 5);
    const subtotal = 150 * 5;
    blocks.push({
      propertyId: PROPERTY_ID,
      type: "booking",
      status: "confirmed",
      startDate: start,
      endDate: end,
      nights: 5,
      guest: {
        id: "guest_ana_perez",
        name: "Ana Pérez",
        email: "ana.perez@example.com",
        phone: "+34600111222",
      },
      occupancy: { adults: 2, children: 1, babies: 0, pets: 1 },
      price: {
        nightlyRate: 150,
        cleaningFee: 40,
        touristTax: 20,
        discount: 30,
        subtotal,
        total: subtotal + 40 + 20 - 30,
        currency: "EUR",
      },
      payment: {
        status: "paid",
        method: "stripe",
        transactionId: "txn_seed_001",
        paidAmount: subtotal + 40 + 20 - 30,
        paidAt: addDays(today, -3),
      },
      createdAt: addDays(today, -10),
      updatedAt: addDays(today, -3),
    });
  }

  // 2. Reserva pendiente sin pago, finde a ~2 meses vista (sábado→lunes)
  {
    const target = addMonths(today, 2);
    const dayOfWeek = target.getUTCDay();
    const daysToSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const start = startOfDay(addDays(target, daysToSaturday));
    const end = addDays(start, 2);
    blocks.push({
      propertyId: PROPERTY_ID,
      type: "booking",
      status: "pending",
      startDate: start,
      endDate: end,
      nights: 2,
      guest: {
        id: "guest_juan_garcia",
        name: "Juan García",
        email: "juan.garcia@example.com",
        phone: "+34611222333",
      },
      occupancy: { adults: 2, children: 0, babies: 0, pets: 0 },
      price: {
        nightlyRate: 180,
        cleaningFee: 40,
        touristTax: 8,
        discount: 0,
        subtotal: 360,
        total: 408,
        currency: "EUR",
      },
      payment: { status: "pending", paidAmount: 0 },
      createdAt: addDays(today, -1),
      updatedAt: addDays(today, -1),
    });
  }

  // 3. Bloqueo de mantenimiento, esta semana, 3 días
  {
    const start = startOfDay(addDays(today, 1));
    const end = addDays(start, 3);
    blocks.push({
      propertyId: PROPERTY_ID,
      type: "block",
      subtype: "maintenance",
      status: "confirmed",
      startDate: start,
      endDate: end,
      nights: 3,
      notes: { internal: "Sustitución calentador" },
      createdAt: addDays(today, -5),
      updatedAt: addDays(today, -5),
    });
  }

  // 4. Reserva cancelada, dentro de ~3 meses, 4 noches
  {
    const start = startOfDay(addDays(addMonths(today, 3), 4));
    const end = addDays(start, 4);
    blocks.push({
      propertyId: PROPERTY_ID,
      type: "booking",
      status: "cancelled",
      startDate: start,
      endDate: end,
      nights: 4,
      guest: {
        id: "guest_maria_lopez",
        name: "María López",
        email: "maria.lopez@example.com",
        phone: "+34622333444",
      },
      occupancy: { adults: 3, children: 0, babies: 0, pets: 0 },
      price: {
        nightlyRate: 160,
        cleaningFee: 40,
        touristTax: 24,
        discount: 0,
        subtotal: 640,
        total: 704,
        currency: "EUR",
      },
      payment: {
        status: "refunded",
        method: "stripe",
        transactionId: "txn_seed_004",
        paidAmount: 0,
        paidAt: addDays(today, -20),
      },
      createdAt: addDays(today, -25),
      updatedAt: addDays(today, -10),
      cancelledAt: addDays(today, -10),
    });
  }

  return blocks;
};

const tryGenerateInterval = (
  horizon: Interval,
  minNights: number,
  maxNights: number,
  taken: Interval[],
  maxAttempts = 20,
): Interval | null => {
  const horizonDays =
    Math.floor((horizon.end.getTime() - horizon.start.getTime()) / 86400000);
  for (let i = 0; i < maxAttempts; i++) {
    const offset = randInt(0, horizonDays - 1);
    const start = startOfDay(addDays(horizon.start, offset));
    const nights = randInt(minNights, maxNights);
    const end = addDays(start, nights);
    if (end > horizon.end) continue;
    const candidate = { start, end };
    if (!overlapsAny(candidate, taken)) return candidate;
  }
  return null;
};

const buildRandomBookings = (
  today: Date,
  horizon: Interval,
  takenActive: Interval[],
): CalendarBlock[] => {
  const blocks: CalendarBlock[] = [];
  for (let i = 0; i < RANDOM_BOOKINGS; i++) {
    const interval = tryGenerateInterval(horizon, 2, 10, takenActive);
    if (!interval) continue;
    const nights = Math.floor(
      (interval.end.getTime() - interval.start.getTime()) / 86400000,
    );
    const status = weightedPick({
      confirmed: 70,
      pending: 20,
      cancelled: 10,
    } as const);
    const guest = makeGuest();
    const occupancy = makeOccupancy();
    const price = makePrice(nights, occupancy);
    const createdAt = addDays(today, -randInt(1, 60));

    const block: CalendarBlock = {
      propertyId: PROPERTY_ID,
      type: "booking",
      status,
      startDate: interval.start,
      endDate: interval.end,
      nights,
      guest,
      occupancy,
      price,
      payment:
        status === "confirmed"
          ? {
              status: "paid",
              method: faker.helpers.arrayElement([
                "stripe",
                "transfer",
              ] as const),
              transactionId: `txn_${faker.string.alphanumeric(10)}`,
              paidAmount: price.total,
              paidAt: createdAt,
            }
          : status === "pending"
            ? { status: "pending", paidAmount: 0 }
            : {
                status: "refunded",
                method: "stripe",
                transactionId: `txn_${faker.string.alphanumeric(10)}`,
                paidAmount: 0,
                paidAt: createdAt,
              },
      createdAt,
      updatedAt: createdAt,
      ...(status === "cancelled" && {
        cancelledAt: addDays(createdAt, randInt(1, 10)),
      }),
    };

    if (status === "confirmed" || status === "pending") {
      takenActive.push(interval);
    }
    blocks.push(block);
  }
  return blocks;
};

const buildRandomBlocks = (
  today: Date,
  horizon: Interval,
  takenActive: Interval[],
): CalendarBlock[] => {
  const blocks: CalendarBlock[] = [];
  for (let i = 0; i < RANDOM_BLOCKS; i++) {
    const interval = tryGenerateInterval(horizon, 1, 5, takenActive);
    if (!interval) continue;
    const nights = Math.floor(
      (interval.end.getTime() - interval.start.getTime()) / 86400000,
    );
    const subtype = faker.helpers.arrayElement([
      "maintenance",
      "owner_use",
    ] as const);
    const createdAt = addDays(today, -randInt(1, 30));
    blocks.push({
      propertyId: PROPERTY_ID,
      type: "block",
      subtype,
      status: "confirmed",
      startDate: interval.start,
      endDate: interval.end,
      nights,
      notes: {
        internal:
          subtype === "maintenance"
            ? faker.helpers.arrayElement([
                "Limpieza profunda",
                "Pintura",
                "Revisión piscina",
                "Cambio mobiliario",
              ])
            : "Uso del propietario",
      },
      createdAt,
      updatedAt: createdAt,
    });
    takenActive.push(interval);
  }
  return blocks;
};

const main = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Missing MONGO_URI in environment");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    const properties = db.collection("properties");
    const calendarBlocks = db.collection("calendarBlocks");

    await properties.drop().catch(() => {});
    await calendarBlocks.drop().catch(() => {});

    await properties.insertOne({
      _id: PROPERTY_ID as unknown as never,
      name: "Villa Mediterránea",
      address: {
        country: "Spain",
        city: "Málaga",
        street: "Calle del Mar 10",
        postalCode: "29001",
      },
    });

    const today = startOfDay(new Date());
    const horizon: Interval = {
      start: today,
      end: addMonths(today, 6),
    };

    const fixed = buildFixedScenarios(today);
    const takenActive: Interval[] = fixed
      .filter((b) => b.status === "confirmed" || b.status === "pending")
      .map((b) => ({ start: b.startDate, end: b.endDate }));

    const randomBookings = buildRandomBookings(today, horizon, takenActive);
    const randomBlocks = buildRandomBlocks(today, horizon, takenActive);

    const all = [...fixed, ...randomBookings, ...randomBlocks];
    await calendarBlocks.insertMany(all);

    await calendarBlocks.createIndex({
      propertyId: 1,
      status: 1,
      startDate: 1,
      endDate: 1,
    });

    const counts = all.reduce(
      (acc, b) => {
        acc[b.status]++;
        return acc;
      },
      { confirmed: 0, pending: 0, cancelled: 0 } as Record<
        CalendarBlock["status"],
        number
      >,
    );

    console.log(`Properties inserted: 1`);
    console.log(
      `CalendarBlocks inserted: ${all.length} (confirmed: ${counts.confirmed}, pending: ${counts.pending}, cancelled: ${counts.cancelled})`,
    );
    console.log(`Index created: propertyId_1_status_1_startDate_1_endDate_1`);
  } finally {
    await client.close();
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
