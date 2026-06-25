import type { TediColumnDef } from "./table.types";

// ---------------------------------------------------------------------------
// Shared data — mirrors `react/src/tedi/components/content/table/table.stories.tsx`.
// Keep these seeds + Estonian labels aligned so Chromatic comparisons line up.
// ---------------------------------------------------------------------------

interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  salary: number;
  status: "active" | "inactive";
}

const personSeed: Omit<Person, "id">[] = [
  {
    name: "Anna Tamm",
    email: "anna.tamm@example.ee",
    role: "Engineer",
    location: "Tallinn",
    salary: 4200,
    status: "active",
  },
  {
    name: "Jüri Kask",
    email: "juri.kask@example.ee",
    role: "Designer",
    location: "Tartu",
    salary: 3800,
    status: "active",
  },
  {
    name: "Maria Saar",
    email: "maria.saar@example.ee",
    role: "Product",
    location: "Pärnu",
    salary: 4600,
    status: "active",
  },
  {
    name: "Mart Mets",
    email: "mart.mets@example.ee",
    role: "Engineer",
    location: "Tallinn",
    salary: 4100,
    status: "inactive",
  },
  {
    name: "Liis Lepp",
    email: "liis.lepp@example.ee",
    role: "Ops",
    location: "Narva",
    salary: 3600,
    status: "active",
  },
  {
    name: "Kadri Kask",
    email: "kadri.kask@example.ee",
    role: "Engineer",
    location: "Viljandi",
    salary: 4000,
    status: "active",
  },
  {
    name: "Rain Roos",
    email: "rain.roos@example.ee",
    role: "Designer",
    location: "Rakvere",
    salary: 3900,
    status: "inactive",
  },
];

const people: Person[] = Array.from({ length: 28 }, (_, index) => {
  const seed = personSeed[index % personSeed.length];
  const round = Math.floor(index / personSeed.length);
  return {
    ...seed,
    id: String(index + 1),
    name: round === 0 ? seed.name : `${seed.name} ${round + 1}`,
  };
});

const personColumns: TediColumnDef<Person>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "email", header: "Email", accessorKey: "email" },
  { id: "role", header: "Role", accessorKey: "role" },
  { id: "location", header: "Location", accessorKey: "location" },
];

interface Booking {
  id: string;
  dateRange: string;
  hour: string;
  duration: string;
  location: string;
}

const bookingDateRange = "22.03.2029 – 29.03.2029";

const bookings: Booking[] = Array.from({ length: 28 }, (_, index) => ({
  id: String(index + 1),
  dateRange: bookingDateRange,
  hour: "11:14",
  duration: "6 min",
  location: "Harjumaa",
}));

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  location: string;
}

const doctorSeed: Omit<Doctor, "id">[] = [
  {
    name: "Kalle Kask",
    specialty: "Dermatovenereoloog",
    experience: "4 a",
    location: "Tallinn",
  },
  {
    name: "Mari Maasikas",
    specialty: "Kopsuarst",
    experience: "4 a",
    location: "Tallinn",
  },
  {
    name: "Vello Vaarikas",
    specialty: "Kõrva-nina-kurguarst",
    experience: "4 a",
    location: "Tallinn",
  },
];

const doctors: Doctor[] = Array.from({ length: 28 }, (_, index) => ({
  ...doctorSeed[index % doctorSeed.length],
  id: String(index + 1),
}));

type CertStatus = "Kehtiv" | "Kehtetu" | "Aegumas" | "Aegunud";
const CERT_STATUSES: CertStatus[] = ["Kehtiv", "Kehtetu", "Aegumas", "Aegunud"];
const certStatusColor: Record<
  CertStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  Kehtiv: "success",
  Aegumas: "warning",
  Kehtetu: "danger",
  Aegunud: "neutral",
};

interface PersonRecord {
  id: string;
  name: string;
  jobStart: string;
  age: number;
  visits: number;
  status: CertStatus;
}

const filterablePeopleSeed: Omit<PersonRecord, "id">[] = [
  { name: "Mari Maasikas", jobStart: "21.08.2019", age: 25, visits: 6, status: "Kehtiv" },
  { name: "Kalle Kapsapea", jobStart: "14.03.2020", age: 35, visits: 13, status: "Kehtiv" },
  { name: "Mart Mägi", jobStart: "02.01.2018", age: 43, visits: 26, status: "Kehtiv" },
  { name: "Meelis Mets", jobStart: "10.07.2021", age: 64, visits: 26, status: "Kehtetu" },
  { name: "Kadri Kask", jobStart: "30.11.2022", age: 32, visits: 4, status: "Aegumas" },
  { name: "Liis Linn", jobStart: "21.08.2019", age: 21, visits: 13, status: "Aegunud" },
];

const filterablePeople: PersonRecord[] = Array.from({ length: 28 }, (_, index) => {
  const seed = filterablePeopleSeed[index % filterablePeopleSeed.length];
  const round = Math.floor(index / filterablePeopleSeed.length);
  return {
    ...seed,
    id: String(index + 1),
    name: round === 0 ? seed.name : `${seed.name} ${round + 1}`,
  };
});

interface CollapsibleRecord {
  id: string;
  name: string;
  age: number;
  visits: number;
  status: CertStatus;
  subRows?: CollapsibleRecord[];
}

const collapsibleSeed: Omit<CollapsibleRecord, "id" | "subRows">[] = [
  { name: "Mari Maasikas", age: 25, visits: 6, status: "Kehtiv" },
  { name: "Kalle Kapsapea", age: 35, visits: 13, status: "Kehtiv" },
  { name: "Mart Mägi", age: 43, visits: 26, status: "Kehtiv" },
  { name: "Meelis Mets", age: 64, visits: 26, status: "Kehtetu" },
  { name: "Kadri Kask", age: 32, visits: 4, status: "Aegumas" },
  { name: "Liis Linn", age: 21, visits: 13, status: "Aegunud" },
];

const collapsiblePeople: CollapsibleRecord[] = Array.from({ length: 28 }, (_, index) => {
  const seed = collapsibleSeed[index % collapsibleSeed.length];
  const round = Math.floor(index / collapsibleSeed.length);
  const name = round === 0 ? seed.name : `${seed.name} ${round + 1}`;
  const id = String(index + 1);
  const subRows: CollapsibleRecord[] | undefined =
    index % 2 === 0
      ? [
        { id: `${id}-1`, name, age: seed.age, visits: Math.floor(seed.visits / 2), status: "Kehtiv" },
        { id: `${id}-2`, name, age: seed.age, visits: seed.visits - Math.floor(seed.visits / 2), status: "Kehtetu" },
      ]
      : undefined;
  return { ...seed, id, name, ...(subRows ? { subRows } : {}) };
});

interface StickyDoctor extends Doctor {
  personalId: string;
  email: string;
  phone: string;
  room: string;
  nextAvailable: string;
  patientsToday: number;
  rating: string;
}

const stickyDoctorSeed: Omit<StickyDoctor, "id">[] = [
  {
    name: "Kalle Kask",
    personalId: "49504080456",
    specialty: "Dermatovenereoloog",
    experience: "4 a",
    location: "Tallinn",
    email: "kalle.kask@tedi.ee",
    phone: "+372 5123 4567",
    room: "Kabinet 304",
    nextAvailable: "29.03.2029 09:30",
    patientsToday: 12,
    rating: "4.7 / 5",
  },
  {
    name: "Mari Maasikas",
    personalId: "39404080456",
    specialty: "Kopsuarst",
    experience: "4 a",
    location: "Tallinn",
    email: "mari.maasikas@tedi.ee",
    phone: "+372 5234 5678",
    room: "Kabinet 211",
    nextAvailable: "30.03.2029 14:00",
    patientsToday: 9,
    rating: "4.9 / 5",
  },
  {
    name: "Vello Vaarikas",
    personalId: "39403080865",
    specialty: "Kõrva-nina-kurguarst",
    experience: "4 a",
    location: "Tallinn",
    email: "vello.vaarikas@tedi.ee",
    phone: "+372 5345 6789",
    room: "Kabinet 117",
    nextAvailable: "29.03.2029 11:15",
    patientsToday: 14,
    rating: "4.5 / 5",
  },
];

const stickyDoctors: StickyDoctor[] = Array.from({ length: 28 }, (_, index) => ({
  ...stickyDoctorSeed[index % stickyDoctorSeed.length],
  id: String(index + 1),
}));

interface Service {
  id: string;
  service: string;
  doctor: string;
  price: number;
  location: string;
}

const serviceSeed: Omit<Service, "id">[] = [
  { service: "Vaimse tervise nõustamisteenus", doctor: "Pille Paunküla", price: 45.5, location: "Tallinn" },
  { service: "Hematoloogia", doctor: "Kalle Kuusik", price: 89.99, location: "Tallinn" },
  { service: "Ortopeedia", doctor: "Märt Männimets", price: 110, location: "Tallinn" },
  { service: "Dermatoloogia", doctor: "Anna Tamm", price: 75, location: "Tartu" },
  { service: "Kardioloogia", doctor: "Mati Saar", price: 120.5, location: "Pärnu" },
  { service: "Neuroloogia", doctor: "Liis Põld", price: 95.25, location: "Tallinn" },
  { service: "Pediaatria", doctor: "Jaan Lepp", price: 60, location: "Tartu" },
];
const services: Service[] = Array.from({ length: 28 }, (_, index) => ({
  id: String(index + 1),
  ...serviceSeed[index % serviceSeed.length],
}));

type CustomNoteColor = "warning" | "danger" | undefined;
interface CustomDoctor extends Doctor {
  note?: string;
  noteColor?: CustomNoteColor;
}

const customDoctorSeed: Omit<CustomDoctor, "id">[] = [
  {
    name: "Kalle Kask",
    specialty: "Dermatovenereoloog",
    experience: "4 a",
    location: "Tallinn",
    note: "Esineb maksehäireid",
    noteColor: "warning",
  },
  { name: "Mari Maasikas", specialty: "Kopsuarst", experience: "4 a", location: "Tallinn" },
  {
    name: "Vello Vaarikas",
    specialty: "Kõrva-nina-kurguarst",
    experience: "4 a",
    location: "Tallinn",
    note: "Arve tasumata",
    noteColor: "danger",
  },
];

const customDoctors: CustomDoctor[] = Array.from({ length: 28 }, (_, index) => ({
  ...customDoctorSeed[index % customDoctorSeed.length],
  id: String(index + 1),
}));

// ---------------------------------------------------------------------------
// GroupedSelectableRows — person groups (collapsible, one checkbox per group)
// over transactions. Each error is its own row, so Veakood / Vea kirjeldus
// align horizontally; the transaction's checkbox, id and date merge via the
// built-in `groupRowsBy` grouping. Selection, control-column spanning and
// group borders are all built in — no custom selection or border CSS.
// ---------------------------------------------------------------------------
interface TransactionError {
  severity: "error" | "warning";
  code: string;
  description: string;
}

interface ErrorRowRecord {
  id: string;
  // Person group (depth 0) fields.
  person?: string;
  idCode?: string;
  country?: string;
  // Error-row (depth 1) fields — one row per error of every transaction.
  transactionId?: string;
  date?: string;
  txnCodes?: string;
  severity?: "error" | "warning";
  code?: string;
  description?: string;
  subRows?: ErrorRowRecord[];
}

interface SourceTransaction {
  transactionId: string;
  date: string;
  errors: TransactionError[];
}
interface SourcePerson {
  person: string;
  idCode: string;
  country: string;
  transactions: SourceTransaction[];
}

const errorSource: SourcePerson[] = [
  {
    person: "Laura Kassisaba",
    idCode: "49504080254",
    country: "EE",
    transactions: [
      {
        transactionId: "R_3c28f058-5366-44e3-be8b-fdc3a29ddde4",
        date: "10.02.2026",
        errors: [
          {
            severity: "error",
            code: "KR_MVT_06",
            description:
              "Kui väljamakse saaja ei ole EMP riigi maksuresident (Eesti kuulub EMP riikide hulka), siis ei ole maksuvaba tulu (MVT) määramine lubatud.",
          },
          {
            severity: "error",
            code: "Siin on kuvatud veatüübi nimetus",
            description:
              "Väljamakse saajale <isikukood> ei ole võimalik teha väljamakset, kuna konto on suletud.",
          },
          {
            severity: "warning",
            code: "Siin on kuvatud veatüübi nimetus",
            description:
              "Täpsustage tagastamise alust ja proovige tehingut uuesti edastada.",
          },
        ],
      },
      {
        transactionId: "M_3c28f058-5366-44e3-be8b-fdc3a29ddde4",
        date: "10.02.2026",
        errors: [
          {
            severity: "error",
            code: "Siin on kuvatud veatüübi nimetus",
            description:
              "Täpsustage tagastamise alust ja proovige tehingut uuesti edastada.",
          },
        ],
      },
      {
        transactionId: "T_3c28f058-5366-44e3-be8b-fdc3a29ddde4",
        date: "10.02.2026",
        errors: [
          {
            severity: "error",
            code: "Siin on kuvatud veatüübi nimetus",
            description:
              "Täpsustage tagastamise alust ja proovige tehingut uuesti edastada.",
          },
        ],
      },
      {
        transactionId: "R_3c234256-5366-44e3-be8b-fdc3a29ddde4",
        date: "10.02.2026",
        errors: [
          {
            severity: "error",
            code: "Siin on kuvatud veatüübi nimetus",
            description:
              "Väljamakse saajale <isikukood> ei ole võimalik teha väljamakset, kuna konto on suletud.",
          },
        ],
      },
    ],
  },
  {
    person: "Mart Mets",
    idCode: "38501230123",
    country: "EE",
    transactions: [
      {
        transactionId: "R_9f12ab34-5366-44e3-be8b-fdc3a29ddde4",
        date: "11.02.2026",
        errors: [
          {
            severity: "warning",
            code: "Siin on kuvatud veatüübi nimetus",
            description:
              "Täpsustage tagastamise alust ja proovige tehingut uuesti edastada.",
          },
          {
            severity: "error",
            code: "KR_MVT_06",
            description:
              "Kui väljamakse saaja ei ole EMP riigi maksuresident, siis ei ole maksuvaba tulu (MVT) määramine lubatud.",
          },
        ],
      },
      {
        transactionId: "M_9f12ab34-5366-44e3-be8b-fdc3a29ddde4",
        date: "11.02.2026",
        errors: [
          {
            severity: "error",
            code: "Siin on kuvatud veatüübi nimetus",
            description:
              "Väljamakse saajale <isikukood> ei ole võimalik teha väljamakset, kuna konto on suletud.",
          },
        ],
      },
    ],
  },
];

function buildErrorRows(people: SourcePerson[]): ErrorRowRecord[] {
  return people.map((person, pi) => ({
    id: `p${pi}`,
    person: person.person,
    idCode: person.idCode,
    country: person.country,
    subRows: person.transactions.flatMap((txn, ti) => {
      const txnCodes = txn.errors.map((e) => e.code).join(" ");
      return txn.errors.map((err, ei) => ({
        id: `p${pi}-t${ti}-e${ei}`,
        transactionId: txn.transactionId,
        date: txn.date,
        txnCodes,
        severity: err.severity,
        code: err.code,
        description: err.description,
      }));
    }),
  }));
}

const errorRows = buildErrorRows(errorSource);

export {
  people,
  personColumns,
  bookingDateRange,
  bookings,
  doctors,
  CERT_STATUSES,
  certStatusColor,
  filterablePeople,
  collapsiblePeople,
  stickyDoctors,
  services,
  customDoctors,
  errorSource,
  errorRows,
};
export type {
  Person,
  Booking,
  Doctor,
  CertStatus,
  CustomNoteColor,
  PersonRecord,
  CollapsibleRecord,
  StickyDoctor,
  Service,
  CustomDoctor,
  TransactionError,
  ErrorRowRecord,
  SourceTransaction,
  SourcePerson,
};
