"use client";

import {
  ClerkProvider,
  SignInButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Bell,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Home,
  Heart,
  Link2,
  LocateFixed,
  MapPin,
  Minus,
  Move,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRoundPen,
  Users,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type View = "home" | "directory" | "connections" | "profile";

export type Profile = {
  id: string;
  clerk_user_id: string;
  full_name: string;
  photo_url: string | null;
  photo_zoom?: number | null;
  photo_position_x?: number | null;
  photo_position_y?: number | null;
  bio: string | null;
  cohort: string;
  birth_date: string | null;
  city: string | null;
  country: string | null;
  profession: string | null;
  linkedin_url: string | null;
  instagram_url?: string | null;
  hobbies?: string | null;
  address?: string | null;
  enrolled_by_id: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileDraft = Pick<
  Profile,
  | "full_name"
  | "photo_url"
  | "photo_zoom"
  | "photo_position_x"
  | "photo_position_y"
  | "bio"
  | "cohort"
  | "birth_date"
  | "city"
  | "country"
  | "profession"
  | "linkedin_url"
  | "instagram_url"
  | "hobbies"
  | "address"
  | "enrolled_by_id"
>;

export type NexoConfig = {
  clerkPublishableKey: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
};

const coreDemoProfiles: Profile[] = [
  {
    id: "a1",
    clerk_user_id: "demo_piero",
    full_name: "Piero Gutiérrez",
    photo_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=85",
    bio: "Construyo productos digitales con propósito y conecto personas que quieren hacer una diferencia.",
    cohort: "Promoción 2018",
    birth_date: "1997-04-12",
    city: "Lima",
    country: "Perú",
    profession: "Product Designer",
    linkedin_url: "https://www.linkedin.com",
    enrolled_by_id: "a2",
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-08-07T00:00:00Z",
  },
  {
    id: "a2",
    clerk_user_id: "demo_valeria",
    full_name: "Valeria Mendoza",
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=85",
    bio: "Mentora, estratega y eterna aprendiz. Creo en las comunidades que se cuidan y crecen juntas.",
    cohort: "Promoción 2016",
    birth_date: "1995-09-21",
    city: "Arequipa",
    country: "Perú",
    profession: "Estratega de marca",
    linkedin_url: "https://www.linkedin.com",
    enrolled_by_id: null,
    created_at: "2026-05-12T00:00:00Z",
    updated_at: "2026-08-08T00:00:00Z",
  },
  {
    id: "a3",
    clerk_user_id: "demo_mateo",
    full_name: "Mateo Salazar",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=85",
    bio: "Emprendedor social enfocado en educación, tecnología y oportunidades para jóvenes.",
    cohort: "Promoción 2019",
    birth_date: "1998-02-03",
    city: "Cusco",
    country: "Perú",
    profession: "Fundador de EdTech",
    linkedin_url: null,
    enrolled_by_id: "a1",
    created_at: "2026-07-19T00:00:00Z",
    updated_at: "2026-08-06T00:00:00Z",
  },
  {
    id: "a4",
    clerk_user_id: "demo_ines",
    full_name: "Inés Rojas",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=85",
    bio: "Arquitecta y urbanista. Trabajo para que nuestras ciudades se sientan más humanas.",
    cohort: "Promoción 2018",
    birth_date: "1997-12-19",
    city: "Lima",
    country: "Perú",
    profession: "Arquitecta",
    linkedin_url: "https://www.linkedin.com",
    enrolled_by_id: "a1",
    created_at: "2026-06-22T00:00:00Z",
    updated_at: "2026-08-04T00:00:00Z",
  },
  {
    id: "a5",
    clerk_user_id: "demo_lucia",
    full_name: "Lucía Barrenechea",
    photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=85",
    bio: "Médica e investigadora. Me mueve traducir la ciencia en decisiones que mejoran vidas.",
    cohort: "Promoción 2015",
    birth_date: "1994-06-08",
    city: "Trujillo",
    country: "Perú",
    profession: "Investigadora clínica",
    linkedin_url: null,
    enrolled_by_id: "a2",
    created_at: "2026-05-28T00:00:00Z",
    updated_at: "2026-08-03T00:00:00Z",
  },
  {
    id: "a6",
    clerk_user_id: "demo_tomas",
    full_name: "Tomás Vega",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=85",
    bio: "Ingeniero de software, músico de fin de semana y mentor de nuevos talentos.",
    cohort: "Promoción 2020",
    birth_date: "1999-11-14",
    city: "Medellín",
    country: "Colombia",
    profession: "Software Engineer",
    linkedin_url: "https://www.linkedin.com",
    enrolled_by_id: "a3",
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-08T00:00:00Z",
  },
  {
    id: "a7",
    clerk_user_id: "demo_camila",
    full_name: "Camila Núñez",
    photo_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=85",
    bio: "Abogada de impacto y facilitadora. Las mejores ideas empiezan con una buena conversación.",
    cohort: "Promoción 2017",
    birth_date: "1996-01-25",
    city: "Quito",
    country: "Ecuador",
    profession: "Abogada",
    linkedin_url: null,
    enrolled_by_id: "a2",
    created_at: "2026-06-10T00:00:00Z",
    updated_at: "2026-08-02T00:00:00Z",
  },
  {
    id: "a8",
    clerk_user_id: "demo_sebastian",
    full_name: "Sebastián León",
    photo_url: null,
    bio: "Economista interesado en finanzas inclusivas, aprendizaje continuo y proyectos con impacto regional.",
    cohort: "Promoción 2021",
    birth_date: "2000-05-30",
    city: "Lima",
    country: "Perú",
    profession: "Analista de inversiones",
    linkedin_url: "https://www.linkedin.com",
    enrolled_by_id: "a4",
    created_at: "2026-08-05T00:00:00Z",
    updated_at: "2026-08-07T00:00:00Z",
  },
];

const demoExpansionSeeds = [
  ["Renata Torres", "Promoción 2015", "Consultora de innovación", "Lima", "Perú"],
  ["Diego Paredes", "Promoción 2015", "Director creativo", "Bogotá", "Colombia"],
  ["Mariana Costa", "Promoción 2015", "Emprendedora social", "Santiago", "Chile"],
  ["Felipe Andrade", "Promoción 2015", "Ingeniero civil", "Quito", "Ecuador"],
  ["Alejandra Vidal", "Promoción 2016", "Psicóloga organizacional", "Lima", "Perú"],
  ["Nicolás Cárdenas", "Promoción 2016", "Product Manager", "Medellín", "Colombia"],
  ["Sofía Delgado", "Promoción 2016", "Periodista", "Buenos Aires", "Argentina"],
  ["Joaquín Reyes", "Promoción 2016", "Arquitecto", "Arequipa", "Perú"],
  ["Daniela Cabrera", "Promoción 2017", "Diseñadora de servicios", "Lima", "Perú"],
  ["Andrés Molina", "Promoción 2017", "Científico de datos", "Monterrey", "México"],
  ["Elena Fuentes", "Promoción 2017", "Gestora cultural", "Cusco", "Perú"],
  ["Gabriel Paz", "Promoción 2017", "Abogado corporativo", "Santiago", "Chile"],
  ["Martina Robles", "Promoción 2018", "UX Researcher", "Lima", "Perú"],
  ["Samuel Herrera", "Promoción 2018", "Consultor estratégico", "Ciudad de México", "México"],
  ["Paula Navarro", "Promoción 2018", "Fotógrafa documental", "Quito", "Ecuador"],
  ["Emilio Vargas", "Promoción 2019", "Ingeniero biomédico", "Lima", "Perú"],
  ["Antonia Flores", "Promoción 2019", "Fundadora de ONG", "Bogotá", "Colombia"],
  ["Rodrigo Silva", "Promoción 2019", "Especialista en growth", "Montevideo", "Uruguay"],
  ["Isabella Castro", "Promoción 2019", "Médica residente", "Trujillo", "Perú"],
  ["Bruno Acosta", "Promoción 2020", "Desarrollador móvil", "Lima", "Perú"],
  ["Emma Villanueva", "Promoción 2020", "Analista de políticas", "Bogotá", "Colombia"],
  ["Lorenzo Méndez", "Promoción 2020", "Productor musical", "Buenos Aires", "Argentina"],
  ["Julieta Campos", "Promoción 2020", "Ingeniera ambiental", "Arequipa", "Perú"],
  ["Thiago Morales", "Promoción 2021", "Analista financiero", "Lima", "Perú"],
  ["Valentina Soto", "Promoción 2021", "Diseñadora industrial", "Santiago", "Chile"],
  ["Franco Lozano", "Promoción 2021", "Emprendedor fintech", "Medellín", "Colombia"],
  ["Mía Espinoza", "Promoción 2021", "Comunicadora digital", "Piura", "Perú"],
  ["Lucas Benavides", "Promoción 2022", "Machine Learning Engineer", "Lima", "Perú"],
  ["Catalina Arias", "Promoción 2022", "Bióloga marina", "Guayaquil", "Ecuador"],
  ["Matías Aguilar", "Promoción 2022", "Estratega de producto", "Bogotá", "Colombia"],
  ["Amelia Ramos", "Promoción 2022", "Curadora de arte", "Ciudad de México", "México"],
  ["Benjamín Prieto", "Promoción 2022", "Fundador de climate tech", "Lima", "Perú"],
] as const;

const additionalDemoProfiles: Profile[] = demoExpansionSeeds.map((seed, index) => ({
  id: `a${index + 9}`,
  clerk_user_id: `demo_member_${index + 9}`,
  full_name: seed[0],
  photo_url: index % 3 === 0 ? `https://i.pravatar.cc/320?img=${index + 9}` : null,
  bio: `Parte de ${seed[1]}. Me interesa compartir aprendizajes, abrir oportunidades y mantener viva esta comunidad.`,
  cohort: seed[1],
  birth_date: `${1994 + (index % 9)}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 24) + 1).padStart(2, "0")}`,
  city: seed[3],
  country: seed[4],
  profession: seed[2],
  linkedin_url: index % 2 === 0 ? "https://www.linkedin.com" : null,
  enrolled_by_id: `a${(index % 8) + 1}`,
  created_at: `2026-07-${String((index % 27) + 1).padStart(2, "0")}T00:00:00Z`,
  updated_at: "2026-08-08T00:00:00Z",
}));

const demoProfiles: Profile[] = [...coreDemoProfiles, ...additionalDemoProfiles].map((profile) => ({
  ...profile,
  cohort: legacyCohortToLima(profile.cohort),
}));

const emptyDraft: ProfileDraft = {
  full_name: "",
  photo_url: "",
  photo_zoom: 1,
  photo_position_x: 50,
  photo_position_y: 50,
  bio: "",
  cohort: "",
  birth_date: "",
  city: "",
  country: "",
  profession: "",
  linkedin_url: "",
  instagram_url: "",
  hobbies: "",
  address: "",
  enrolled_by_id: null,
};

function normalizePhotoUrl(value?: string | null) {
  const url = value?.trim();
  if (!url) return null;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/) ?? url.match(/[?&]id=([^&]+)/);
  if (driveMatch) return `https://lh3.googleusercontent.com/d/${driveMatch[1]}=w1200`;
  if (url.includes("dropbox.com") && url.includes("dl=0")) return url.replace("dl=0", "raw=1");
  return url;
}

function legacyCohortToLima(value: string) {
  const legacyYear = value.match(/^Promoción\s+(20\d{2})$/i);
  if (!legacyYear) return value;
  return `Lima ${Number(legacyYear[1]) - 1817}`;
}

function normalizeCohort(value: string) {
  const trimmed = value.trim();
  if (/^\d{3}$/.test(trimmed)) return `Lima ${trimmed}`;
  const limaMatch = trimmed.match(/^lima\s*(\d{3})$/i);
  if (limaMatch) return `Lima ${limaMatch[1]}`;
  return legacyCohortToLima(trimmed);
}

function isValidCohort(value: string) {
  return /^Lima\s+\d{3}$/i.test(normalizeCohort(value));
}

function clampPhotoValue(value: number | null | undefined, min: number, max: number, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

function formatBirthDate(value: string | null) {
  if (!value) return "Sin especificar";
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function Avatar({ profile, size = "medium" }: { profile: Profile; size?: "small" | "medium" | "large" | "hero" }) {
  const photoUrl = normalizePhotoUrl(profile.photo_url);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const photoStyle: CSSProperties = {
    objectPosition: `${clampPhotoValue(profile.photo_position_x, 0, 100, 50)}% ${clampPhotoValue(profile.photo_position_y, 0, 100, 50)}%`,
    transform: `scale(${clampPhotoValue(profile.photo_zoom, 1, 2, 1)})`,
  };
  return (
    <div className={`avatar avatar-${size}`} aria-label={`Foto de ${profile.full_name}`}>
      {photoUrl && failedUrl !== photoUrl ? (
        // Profile photos are user-provided remote URLs, so a fixed image loader is not available.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" style={photoStyle} onError={() => setFailedUrl(photoUrl)} />
      ) : (
        <span>{initials(profile.full_name)}</span>
      )}
    </div>
  );
}

function createSupabase(config: NexoConfig, getToken: () => Promise<string | null>): SupabaseClient | null {
  if (!config.supabaseUrl || !config.supabasePublishableKey) return null;
  return createClient(config.supabaseUrl, config.supabasePublishableKey, {
    accessToken: async () => getToken(),
  });
}

function useProfiles(userId: string, config: NexoConfig, getToken?: () => Promise<string | null>) {
  const live = Boolean(config.supabaseUrl && config.supabasePublishableKey && getToken);
  const [profiles, setProfiles] = useState<Profile[]>(demoProfiles);
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState<string | null>(null);
  const client = useMemo(
    () => (getToken ? createSupabase(config, getToken) : null),
    [config, getToken],
  );

  const refresh = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    const { data, error: queryError } = await client
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) {
      setError("No pudimos cargar el directorio. Revisa la conexión con Supabase.");
    } else if (data) {
      setProfiles(data as Profile[]);
      setError(null);
    }
    setLoading(false);
  }, [client]);

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, [refresh]);

  const saveProfile = useCallback(
    async (draft: ProfileDraft, current?: Profile) => {
      const now = new Date().toISOString();
      const record: Profile = {
        id: current?.id ?? crypto.randomUUID(),
        clerk_user_id: userId,
        ...draft,
        photo_url: normalizePhotoUrl(draft.photo_url),
        photo_zoom: clampPhotoValue(draft.photo_zoom, 1, 2, 1),
        photo_position_x: clampPhotoValue(draft.photo_position_x, 0, 100, 50),
        photo_position_y: clampPhotoValue(draft.photo_position_y, 0, 100, 50),
        bio: draft.bio || null,
        cohort: normalizeCohort(draft.cohort),
        birth_date: draft.birth_date || null,
        city: draft.city || null,
        country: draft.country || null,
        profession: draft.profession || null,
        linkedin_url: draft.linkedin_url || null,
        instagram_url: draft.instagram_url || null,
        hobbies: draft.hobbies || null,
        address: draft.address || null,
        enrolled_by_id: draft.enrolled_by_id || null,
        created_at: current?.created_at ?? now,
        updated_at: now,
      };

      if (client) {
        const { data, error: saveError } = await client
          .from("profiles")
          .upsert(record, { onConflict: "clerk_user_id" })
          .select()
          .single();
        if (saveError) throw saveError;
        await refresh();
        return data as Profile;
      }

      setProfiles((previous) => {
        const exists = previous.some((profile) => profile.clerk_user_id === userId);
        return exists
          ? previous.map((profile) => (profile.clerk_user_id === userId ? record : profile))
          : [record, ...previous];
      });
      return record;
    },
    [client, refresh, userId],
  );

  return { profiles, loading, error, live, saveProfile };
}

export default function NexoApp({ config }: { config: NexoConfig }) {
  if (config.clerkPublishableKey) {
    return (
      <ClerkProvider
        publishableKey={config.clerkPublishableKey}
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        appearance={{
          variables: { colorPrimary: "#e36b52", colorText: "#182b3a", borderRadius: "0.65rem" },
        }}
      >
        <ClerkExperience config={config} />
      </ClerkProvider>
    );
  }

  return <DemoExperience />;
}

function ClerkExperience({ config }: { config: NexoConfig }) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn || !userId) {
    return (
      <Landing
        action={
          <SignInButton mode="modal">
            <button className="primary-button" type="button">
              Iniciar sesión <ArrowRight size={17} />
            </button>
          </SignInButton>
        }
      />
    );
  }

  return (
    <Workspace
      userId={userId}
      userName={user?.fullName ?? user?.firstName ?? "Miembro"}
      userImage={user?.imageUrl}
      getToken={getToken}
      config={config}
      accountControl={<UserButton />}
    />
  );
}

function DemoExperience() {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return (
      <Landing
        isDemo
        action={
          <button className="primary-button" type="button" onClick={() => setEntered(true)}>
            Explorar la demo <ArrowRight size={17} />
          </button>
        }
      />
    );
  }

  return (
    <Workspace
      userId="demo_piero"
      userName="Piero Gutiérrez"
      userImage={demoProfiles[0].photo_url ?? undefined}
      config={{ clerkPublishableKey: "", supabaseUrl: "", supabasePublishableKey: "" }}
      accountControl={<button className="demo-avatar" onClick={() => setEntered(false)} aria-label="Salir de la demo">PG</button>}
    />
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Brand />
      <div className="loading-pulse" />
    </div>
  );
}

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`brand ${inverse ? "brand-inverse" : ""}`}>
      <span className="brand-mark">N</span>
      <span>Nexo</span>
    </div>
  );
}

function Landing({ action, isDemo = false }: { action: React.ReactNode; isDemo?: boolean }) {
  return (
    <main className="landing">
      <header className="landing-header">
        <Brand />
        <div className="landing-header-actions">
          {isDemo && <span className="demo-note">Modo demostración</span>}
          {action}
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> Tu comunidad, más cerca</span>
          <h1>Las historias que nos <em>conectan.</em></h1>
          <p>
            Descubre a las personas detrás de cada promoción, conoce sus caminos
            y entiende cómo crece tu red.
          </p>
          <div className="hero-actions">
            {action}
            <span className="privacy-line"><ShieldCheck size={16} /> Una red privada y segura</span>
          </div>
        </div>

        <div className="network-preview" aria-label="Vista previa de la red de conexiones">
          <div className="network-ring ring-one" />
          <div className="network-ring ring-two" />
          <div className="connection-line line-one" />
          <div className="connection-line line-two" />
          <div className="preview-node node-main">
            <Avatar profile={demoProfiles[0]} size="hero" />
            <div><strong>Piero</strong><span>Lima 201</span></div>
          </div>
          <div className="preview-node node-top">
            <Avatar profile={demoProfiles[1]} size="medium" />
            <div><strong>Valeria</strong><span>Te enroló</span></div>
          </div>
          <div className="preview-node node-right">
            <Avatar profile={demoProfiles[2]} size="medium" />
            <div><strong>Mateo</strong><span>Enrolado por ti</span></div>
          </div>
          <div className="preview-node node-bottom">
            <Avatar profile={demoProfiles[3]} size="small" />
            <div><strong>Inés</strong></div>
          </div>
          <div className="preview-label"><Users size={15} /> 40 personas conectadas</div>
        </div>
      </section>

      <section className="landing-features">
        <article><span>01</span><h2>Tu historia</h2><p>Comparte quién eres, tu promoción y el camino que estás construyendo.</p></article>
        <article><span>02</span><h2>Tu comunidad</h2><p>Encuentra personas por promoción, profesión o lugar.</p></article>
        <article><span>03</span><h2>Tu conexión</h2><p>Visualiza quién te enroló y a quiénes has sumado a la red.</p></article>
      </section>
    </main>
  );
}

function Workspace({
  userId,
  userName,
  userImage,
  getToken,
  config,
  accountControl,
}: {
  userId: string;
  userName: string;
  userImage?: string;
  getToken?: () => Promise<string | null>;
  config: NexoConfig;
  accountControl: React.ReactNode;
}) {
  const { profiles, loading, error, live, saveProfile } = useProfiles(userId, config, getToken);
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [cohort, setCohort] = useState("Todas");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentProfile = profiles.find((profile) => profile.clerk_user_id === userId);
  const displayProfile = currentProfile ?? (live ? {
    id: "",
    clerk_user_id: userId,
    full_name: userName,
    photo_url: userImage ?? null,
    photo_zoom: 1,
    photo_position_x: 50,
    photo_position_y: 50,
    bio: null,
    cohort: "",
    birth_date: null,
    city: null,
    country: null,
    profession: null,
    linkedin_url: null,
    instagram_url: null,
    hobbies: null,
    address: null,
    enrolled_by_id: null,
    created_at: "",
    updated_at: "",
  } : {
    ...demoProfiles[0],
    clerk_user_id: userId,
    full_name: userName,
    photo_url: userImage ?? demoProfiles[0].photo_url,
  });

  const shouldOnboard = live && !loading && !currentProfile;

  const cohorts = useMemo(
    () => ["Todas", ...Array.from(new Set(profiles.map((profile) => profile.cohort))).sort()],
    [profiles],
  );
  const filtered = profiles.filter((profile) => {
    const haystack = `${profile.full_name} ${profile.profession ?? ""} ${profile.city ?? ""} ${profile.cohort}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (cohort === "Todas" || profile.cohort === cohort);
  });

  const navigate = (next: View) => {
    setView(next);
    setMobileNav(false);
    if (next === "profile") setSelected(displayProfile);
  };

  if (live && loading) return <LoadingScreen />;

  if (shouldOnboard) {
    return (
      <ProfileOnboarding
        profile={displayProfile}
        profiles={profiles}
        accountControl={accountControl}
        onSave={(draft) => saveProfile(draft)}
      />
    );
  }

  return (
    <div className={`workspace ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand inverse />
          <button className="sidebar-collapse-button" type="button" onClick={() => setSidebarCollapsed(true)} aria-label="Contraer barra lateral">
            <PanelLeftClose size={18} />
          </button>
        </div>
        <nav aria-label="Navegación principal">
          <NavButton icon={<Home />} label="Inicio" active={view === "home"} onClick={() => navigate("home")} />
          <NavButton icon={<Users />} label="Directorio" active={view === "directory"} onClick={() => navigate("directory")} />
          <NavButton icon={<Network />} label="Conexiones" active={view === "connections"} onClick={() => navigate("connections")} />
          <NavButton icon={<UserRoundPen />} label="Mi perfil" active={view === "profile"} onClick={() => navigate("profile")} />
        </nav>
        <div className="sidebar-card">
          <div className="mini-orbit"><span /><span /><span /></div>
          <strong>Haz crecer la red</strong>
          <p>Invita a alguien de tu comunidad a formar parte.</p>
          <button type="button"><UserPlus size={16} /> Invitar persona</button>
        </div>
        <div className="sidebar-footer">
          <span className={`status-dot ${live ? "status-live" : ""}`} />
          {live ? "Conectado a Supabase" : "Datos de demostración"}
        </div>
      </aside>
      {mobileNav && <button className="nav-backdrop" aria-label="Cerrar menú" onClick={() => setMobileNav(false)} />}

      <div className="main-shell">
        <header className="topbar">
          <button className="mobile-brand" type="button" onClick={() => setMobileNav(true)} aria-label="Abrir menú"><Brand /></button>
          <button className="sidebar-reopen" type="button" onClick={() => setSidebarCollapsed(false)} aria-label="Expandir barra lateral">
            <span className="brand-mark">N</span>
            <PanelLeftOpen size={16} />
          </button>
          <label className="global-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar personas, promociones..." />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Notificaciones"><Bell size={19} /><span /></button>
            <div className="account-summary">
              <div><strong>{firstName(displayProfile.full_name)}</strong><span>{displayProfile.cohort}</span></div>
              {accountControl}
            </div>
          </div>
        </header>

        <main className={`content ${view === "connections" ? "content-connections" : ""}`}>
          {error && <div className="error-banner">{error}</div>}
          {view === "home" && (
            <Dashboard
              profile={displayProfile}
              profiles={profiles}
              loading={loading}
              onOpen={setSelected}
              onDirectory={() => setView("directory")}
              onConnections={() => setView("connections")}
            />
          )}
          {view === "directory" && (
            <Directory profiles={filtered} cohorts={cohorts} cohort={cohort} query={query} onQuery={setQuery} onCohort={setCohort} onOpen={setSelected} />
          )}
          {view === "connections" && <Connections profile={displayProfile} profiles={profiles} onOpen={setSelected} />}
          {view === "profile" && (
            <MyProfile profile={displayProfile} profiles={profiles} onEdit={() => setEditing(true)} onOpen={setSelected} />
          )}
        </main>
      </div>

      {selected && (
        <ProfilePanel
          profile={selected}
          profiles={profiles}
          isOwn={selected.clerk_user_id === userId}
          onClose={() => setSelected(null)}
          onOpen={setSelected}
          onEdit={() => { setSelected(null); setEditing(true); }}
        />
      )}
      {editing && (
        <ProfileEditor
          profile={currentProfile ?? displayProfile}
          profiles={profiles}
          onClose={() => setEditing(false)}
          onSave={async (draft) => { await saveProfile(draft, currentProfile); setEditing(false); }}
        />
      )}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return <button className={active ? "active" : ""} onClick={onClick} type="button">{icon}<span>{label}</span></button>;
}

function Dashboard({ profile, profiles, loading, onOpen, onDirectory, onConnections }: {
  profile: Profile;
  profiles: Profile[];
  loading: boolean;
  onOpen: (profile: Profile) => void;
  onDirectory: () => void;
  onConnections: () => void;
}) {
  const enrolled = profiles.filter((candidate) => candidate.enrolled_by_id === profile.id);
  const mentor = profiles.find((candidate) => candidate.id === profile.enrolled_by_id);
  const recent = profiles.filter((candidate) => candidate.id !== profile.id).slice(0, 4);

  return (
    <div className="dashboard page-enter">
      <div className="welcome-row">
        <div><span className="page-kicker">Sábado, 8 de agosto</span><h1>Hola, {firstName(profile.full_name)} <span>✦</span></h1><p>Hay nuevas historias esperando ser descubiertas en tu comunidad.</p></div>
        <button className="secondary-button" type="button" onClick={onDirectory}>Explorar directorio <ArrowUpRight size={17} /></button>
      </div>

      <section className="stats-grid">
        <article className="stat-card stat-primary"><div className="stat-icon"><Users /></div><span>Personas en la red</span><strong>{loading ? "—" : profiles.length}</strong><small><b>+8</b> este mes</small><div className="stat-decoration">N</div></article>
        <article className="stat-card"><div className="stat-icon coral"><Network /></div><span>Tus conexiones</span><strong>{enrolled.length + (mentor ? 1 : 0)}</strong><small>{enrolled.length} enroladas por ti</small></article>
        <article className="stat-card"><div className="stat-icon sage"><BookOpen /></div><span>Promociones</span><strong>{new Set(profiles.map((item) => item.cohort)).size}</strong><small>2015 — 2022</small></article>
      </section>

      <section className="dashboard-grid">
        <div className="section-card people-section">
          <div className="section-heading"><div><span className="section-label">DESCUBRE</span><h2>Personas de tu comunidad</h2></div><button type="button" onClick={onDirectory}>Ver todas <ChevronRight size={16} /></button></div>
          <div className="people-grid">
            {recent.map((person) => <ProfileCard key={person.id} profile={person} onClick={() => onOpen(person)} />)}
          </div>
        </div>

        <div className="section-card connection-summary">
          <div className="section-heading"><div><span className="section-label">TU NEXO</span><h2>Tu conexión</h2></div><button type="button" onClick={onConnections}><ArrowUpRight size={17} /></button></div>
          <div className="connection-portrait">
            {mentor && <button className="connection-person mentor-person" onClick={() => onOpen(mentor)}><Avatar profile={mentor} size="medium" /><span>{firstName(mentor.full_name)}</span><small>Te enroló</small></button>}
            <div className="vertical-link top-link" />
            <button className="connection-person self-person" onClick={() => onOpen(profile)}><Avatar profile={profile} size="large" /><span>Tú</span></button>
            <div className="branch-link" />
            <div className="enrolled-row">
              {enrolled.slice(0, 3).map((person) => <button key={person.id} className="connection-person" onClick={() => onOpen(person)}><Avatar profile={person} size="small" /><span>{firstName(person.full_name)}</span></button>)}
            </div>
          </div>
          <button className="text-button" type="button" onClick={onConnections}>Ver mapa completo <ArrowRight size={15} /></button>
        </div>
      </section>
    </div>
  );
}

function ProfileCard({ profile, onClick }: { profile: Profile; onClick: () => void }) {
  return (
    <button className="profile-card" type="button" onClick={onClick}>
      <Avatar profile={profile} size="large" />
      <div className="profile-card-copy"><span className="cohort-pill">{profile.cohort.replace("Promoción ", "PROM. ")}</span><h3>{profile.full_name}</h3><p>{profile.profession ?? "Miembro de la comunidad"}</p>{profile.city && <small><MapPin size={13} /> {profile.city}, {profile.country}</small>}</div>
      <span className="card-arrow"><ArrowUpRight size={16} /></span>
    </button>
  );
}

function Directory({ profiles, cohorts, cohort, query, onQuery, onCohort, onOpen }: {
  profiles: Profile[];
  cohorts: string[];
  cohort: string;
  query: string;
  onQuery: (value: string) => void;
  onCohort: (value: string) => void;
  onOpen: (profile: Profile) => void;
}) {
  return (
    <div className="directory page-enter">
      <div className="page-heading"><div><span className="page-kicker">NUESTRA COMUNIDAD</span><h1>Directorio de personas</h1><p>Conoce las historias, experiencias y caminos que forman nuestra red.</p></div><div className="member-count"><span>{profiles.length}</span> resultados</div></div>
      <div className="directory-tools">
        <label><Search size={18} /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Nombre, profesión o ciudad" /></label>
        <div className="cohort-filter" role="group" aria-label="Filtrar por promoción">
          {cohorts.map((item) => <button type="button" key={item} className={cohort === item ? "active" : ""} onClick={() => onCohort(item)}>{item}</button>)}
        </div>
      </div>
      {profiles.length ? <div className="directory-grid">{profiles.map((profile) => <ProfileCard key={profile.id} profile={profile} onClick={() => onOpen(profile)} />)}</div> : <div className="empty-state"><CircleUserRound size={36} /><h2>No encontramos coincidencias</h2><p>Prueba con otro nombre, profesión o promoción.</p></div>}
    </div>
  );
}

type NetworkRelation = "self" | "mentor" | "child" | "sibling" | "grandchild";

type NetworkPoint = {
  profile: Profile;
  relation: NetworkRelation;
  x: number;
  y: number;
  delay: number;
};

type NetworkEdge = {
  from: NetworkPoint;
  to: NetworkPoint;
  tone: "primary" | "secondary";
};

function buildLivingNetwork(profile: Profile, profiles: Profile[]) {
  const points: NetworkPoint[] = [{ profile, relation: "self", x: 0, y: 0, delay: 0 }];
  const edges: NetworkEdge[] = [];
  const mentor = profiles.find((person) => person.id === profile.enrolled_by_id);
  const directChildren = profiles.filter((person) => person.enrolled_by_id === profile.id);

  let mentorPoint: NetworkPoint | undefined;
  if (mentor) {
    mentorPoint = { profile: mentor, relation: "mentor", x: 0, y: -285, delay: 1 };
    points.push(mentorPoint);
    edges.push({ from: mentorPoint, to: points[0], tone: "primary" });

    const siblings = profiles.filter(
      (person) => person.enrolled_by_id === mentor.id && person.id !== profile.id,
    );
    siblings.slice(0, 3).forEach((person, index) => {
      const side = index % 2 === 0 ? 1 : -1;
      const point: NetworkPoint = {
        profile: person,
        relation: "sibling",
        x: side * (390 + Math.floor(index / 2) * 170),
        y: -105 + Math.floor(index / 2) * 125,
        delay: index + 2,
      };
      points.push(point);
      edges.push({ from: mentorPoint as NetworkPoint, to: point, tone: "secondary" });
    });
  }

  directChildren.slice(0, 4).forEach((person, index, list) => {
    const gap = 330;
    const point: NetworkPoint = {
      profile: person,
      relation: "child",
      x: (index - (list.length - 1) / 2) * gap,
      y: 285,
      delay: index + 3,
    };
    points.push(point);
    edges.push({ from: points[0], to: point, tone: "primary" });

    profiles
      .filter((candidate) => candidate.enrolled_by_id === person.id)
      .slice(0, 2)
      .forEach((grandchild, grandchildIndex) => {
        const grandchildPoint: NetworkPoint = {
          profile: grandchild,
          relation: "grandchild",
          x: point.x + (grandchildIndex === 0 ? 0 : 160),
          y: 535,
          delay: index + grandchildIndex + 5,
        };
        points.push(grandchildPoint);
        edges.push({ from: point, to: grandchildPoint, tone: "secondary" });
      });
  });

  return { points, edges, mentor, directChildren };
}

function LivingEdge({ edge, index }: { edge: NetworkEdge; index: number }) {
  const dx = edge.to.x - edge.from.x;
  const dy = edge.to.y - edge.from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const style = {
    "--edge-left": `calc(50% + ${edge.from.x}px)`,
    "--edge-top": `calc(50% + ${edge.from.y}px)`,
    "--edge-width": `${distance}px`,
    "--edge-angle": `${angle}deg`,
    "--edge-delay": `${index * -0.85}s`,
  } as CSSProperties;

  return (
    <div className={`living-edge edge-${edge.tone}`} style={style} aria-hidden="true">
      <span className="edge-energy" />
      <span className="edge-energy edge-energy-two" />
    </div>
  );
}

function LivingNode({ point, onOpen }: { point: NetworkPoint; onOpen: (profile: Profile) => void }) {
  const relationLabel: Record<NetworkRelation, string> = {
    self: "TÚ",
    mentor: "TE ENROLÓ",
    child: "ENROLADO POR TI",
    sibling: "MISMA RAMA",
    grandchild: "SIGUIENTE GENERACIÓN",
  };
  const style = {
    "--node-left": `calc(50% + ${point.x}px)`,
    "--node-top": `calc(50% + ${point.y}px)`,
    "--node-delay": `${point.delay * 90}ms`,
    "--float-delay": `${point.delay * -0.7}s`,
  } as CSSProperties;

  return (
    <button
      className={`living-node living-node-${point.relation}`}
      style={style}
      type="button"
      onClick={() => onOpen(point.profile)}
    >
      <span className="node-aura"><i /><i /><i /></span>
      <Avatar profile={point.profile} size={point.relation === "self" ? "hero" : "large"} />
      <span className="living-node-relation">{relationLabel[point.relation]}</span>
      <strong>{point.profile.full_name}</strong>
      <small>{point.profile.profession ?? point.profile.cohort}</small>
      <span className="living-node-cohort">{point.profile.cohort}</span>
    </button>
  );
}

type CohortGroup = {
  cohort: string;
  members: Profile[];
  x: number;
  y: number;
  color: string;
};

function buildCohortGroups(profiles: Profile[]): CohortGroup[] {
  const positions = [
    [-445, -205], [-150, -225], [150, -225], [445, -205],
    [-445, 205], [-150, 225], [150, 225], [445, 205],
  ];
  const colors = ["#ef745b", "#e8a65b", "#a4bb91", "#72a9a1", "#7095bd", "#9b86bd", "#c67f9f", "#db8a70"];
  const grouped = new Map<string, Profile[]>();
  profiles.forEach((person) => grouped.set(person.cohort, [...(grouped.get(person.cohort) ?? []), person]));

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 8)
    .map(([cohort, members], index) => ({
      cohort,
      members,
      x: positions[index][0],
      y: positions[index][1],
      color: colors[index],
    }));
}

function CohortGalaxy({
  profiles,
  selectedCohort,
  onSelectCohort,
  onOpen,
}: {
  profiles: Profile[];
  selectedCohort: string | null;
  onSelectCohort: (cohort: string) => void;
  onOpen: (profile: Profile) => void;
}) {
  const groups = useMemo(() => buildCohortGroups(profiles), [profiles]);

  return (
    <>
      <div className="cohort-bridge bridge-top" />
      <div className="cohort-bridge bridge-bottom" />
      <div className="cohort-bridge bridge-center" />
      {groups.map((group, groupIndex) => {
        const selected = selectedCohort === group.cohort;
        const dimmed = selectedCohort !== null && !selected;
        const clusterStyle = {
          "--cluster-left": `calc(50% + ${group.x}px)`,
          "--cluster-top": `calc(50% + ${group.y}px)`,
          "--cluster-color": group.color,
          "--cluster-delay": `${groupIndex * 85}ms`,
        } as CSSProperties;

        return (
          <section
            key={group.cohort}
            className={`cohort-cluster ${selected ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""}`}
            style={clusterStyle}
            aria-label={`${group.cohort}, ${group.members.length} personas`}
          >
            <button className="cohort-cluster-center" type="button" onClick={() => onSelectCohort(group.cohort)}>
              <span>Promoción</span>
              <strong>{group.cohort.replace("Promoción ", "")}</strong>
              <small>{group.members.length} personas</small>
            </button>
            <div className="cluster-orbit-ring" />
            {group.members.slice(0, 7).map((member, memberIndex, members) => {
              const angle = (Math.PI * 2 * memberIndex) / members.length - Math.PI / 2;
              const radius = selected ? 94 : 78;
              const memberStyle = {
                "--member-x": `${Math.cos(angle) * radius}px`,
                "--member-y": `${Math.sin(angle) * radius}px`,
                "--member-delay": `${groupIndex * -0.45 - memberIndex * 0.2}s`,
              } as CSSProperties;
              return (
                <button
                  className="cohort-member"
                  key={member.id}
                  style={memberStyle}
                  type="button"
                  title={`${member.full_name} · ${member.profession ?? group.cohort}`}
                  onClick={() => onOpen(member)}
                >
                  <Avatar profile={member} size="small" />
                  <span>{firstName(member.full_name)}</span>
                </button>
              );
            })}
          </section>
        );
      })}
    </>
  );
}

function Connections({ profile, profiles, onOpen }: { profile: Profile; profiles: Profile[]; onOpen: (profile: Profile) => void }) {
  const network = useMemo(() => buildLivingNetwork(profile, profiles), [profile, profiles]);
  const cohortGroups = useMemo(() => buildCohortGroups(profiles), [profiles]);
  const [networkMode, setNetworkMode] = useState<"lineage" | "cohorts">("cohorts");
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.82);
  const [pan, setPan] = useState({ x: 0, y: 35 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const resetView = () => {
    setZoom(0.82);
    setPan({ x: 0, y: 35 });
  };
  const changeMode = (mode: "lineage" | "cohorts") => {
    setNetworkMode(mode);
    setSelectedCohort(null);
    resetView();
  };
  const adjustZoom = (amount: number) => setZoom((current) => Math.min(1.35, Math.max(0.55, current + amount)));
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".living-node, .cohort-cluster, .network-controls, .network-story-card, .network-mode-switch")) return;
    dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.panX + event.clientX - dragRef.current.x,
      y: dragRef.current.panY + event.clientY - dragRef.current.y,
    });
  };
  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  return (
    <div className="connections-page living-connections page-enter">
      <section
        className={`living-canvas ${dragging ? "is-dragging" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={(event) => adjustZoom(event.deltaY > 0 ? -0.06 : 0.06)}
        aria-label="Mapa interactivo de conexiones"
      >
        <div className="living-grid" />
        <div className="ambient-glow glow-coral" />
        <div className="ambient-glow glow-sage" />
        <div className="ambient-particle particle-one" />
        <div className="ambient-particle particle-two" />
        <div className="ambient-particle particle-three" />

        <header className="living-header">
          <div>
            <span className="living-kicker"><Sparkles size={13} /> {networkMode === "lineage" ? "TU CONSTELACIÓN" : "NUESTRA COMUNIDAD"}</span>
            <h1>{networkMode === "lineage" ? <>Tu árbol está <em>vivo.</em></> : <><em>40 personas</em>, 8 promociones.</>}</h1>
            {networkMode === "lineage" && <p>Arrastra para explorar · usa la rueda para acercarte · selecciona una persona para conocer su historia.</p>}
          </div>
          <div className="living-count"><strong>{networkMode === "lineage" ? network.points.length : profiles.length}</strong><span>personas en<br />{networkMode === "lineage" ? "tu linaje" : "la comunidad"}</span></div>
        </header>

        <div className="network-mode-switch" role="group" aria-label="Agrupar conexiones">
          <button type="button" className={networkMode === "lineage" ? "active" : ""} onClick={() => changeMode("lineage")}><Network size={14} /> Mi linaje</button>
          <button type="button" className={networkMode === "cohorts" ? "active" : ""} onClick={() => changeMode("cohorts")}><Users size={14} /> Por promociones <span>{cohortGroups.length}</span></button>
        </div>

        <div className="network-controls" aria-label="Controles del mapa">
          <button type="button" onClick={() => adjustZoom(0.12)} aria-label="Acercar"><Plus size={17} /></button>
          <button type="button" onClick={() => adjustZoom(-0.12)} aria-label="Alejar"><Minus size={17} /></button>
          <button type="button" onClick={resetView} aria-label="Centrar mapa"><LocateFixed size={17} /></button>
          <span><Move size={14} /> {Math.round(zoom * 100)}%</span>
        </div>

        <div
          className="living-world"
          style={{
            "--network-pan-x": `${pan.x}px`,
            "--network-pan-y": `${pan.y}px`,
            "--network-scale": zoom,
          } as CSSProperties}
        >
          {networkMode === "lineage" ? (
            <>
              <div className="world-orbit orbit-one" />
              <div className="world-orbit orbit-two" />
              <div className="world-orbit orbit-three" />
              {network.edges.map((edge, index) => <LivingEdge key={`${edge.from.profile.id}-${edge.to.profile.id}`} edge={edge} index={index} />)}
              {network.points.map((point) => <LivingNode key={point.profile.id} point={point} onOpen={onOpen} />)}
            </>
          ) : (
            <CohortGalaxy profiles={profiles} selectedCohort={selectedCohort} onSelectCohort={(value) => setSelectedCohort((current) => current === value ? null : value)} onOpen={onOpen} />
          )}
        </div>

        {networkMode === "lineage" && (
          <aside className="network-story-card">
            <span>Tu impacto</span>
            <strong>{network.directChildren.length}</strong>
            <p>{network.directChildren.length === 1 ? "persona llegó" : "personas llegaron"} a Nexo directamente gracias a ti.</p>
            <div className="story-avatars">
              {network.directChildren.slice(0, 4).map((person) => <Avatar key={person.id} profile={person} size="small" />)}
              <i>+</i>
            </div>
          </aside>
        )}

        <div className="living-legend">
          <span><i className="legend-coral" /> {networkMode === "lineage" ? "Conexión directa" : "Promoción seleccionada"}</span>
          <span><i className="legend-sage" /> {networkMode === "lineage" ? "Rama extendida" : "Órbitas de personas"}</span>
          <span className="drag-hint"><Move size={13} /> Arrastra el lienzo</span>
        </div>
      </section>
    </div>
  );
}

function MyProfile({ profile, profiles, onEdit, onOpen }: { profile: Profile; profiles: Profile[]; onEdit: () => void; onOpen: (profile: Profile) => void }) {
  const mentor = profiles.find((person) => person.id === profile.enrolled_by_id);
  const enrolled = profiles.filter((person) => person.enrolled_by_id === profile.id);
  return (
    <div className="my-profile page-enter">
      <div className="profile-cover"><div className="cover-pattern" /><button className="edit-profile-button" onClick={onEdit}><UserRoundPen size={17} /> Editar perfil</button></div>
      <div className="profile-main-card">
        <Avatar profile={profile} size="hero" />
        <div className="identity"><span className="cohort-pill">{profile.cohort}</span><h1>{profile.full_name}</h1><p>{profile.profession}</p><div><span><MapPin size={15} /> {profile.city}, {profile.country}</span><span><CalendarDays size={15} /> {formatBirthDate(profile.birth_date)}</span></div></div>
      </div>
      <div className="profile-content-grid">
        <section className="section-card profile-about"><span className="section-label">SOBRE MÍ</span><h2>Mi historia</h2><p>{profile.bio || "Aún no has agregado una descripción."}</p><div className="profile-detail-list">{profile.hobbies && <span><Heart size={15} /> {profile.hobbies}</span>}{profile.address && <span><MapPin size={15} /> {profile.address}</span>}</div><div className="profile-social-links">{profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer"><Link2 size={16} /> Perfil profesional <ArrowUpRight size={15} /></a>}{profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noreferrer"><AtSign size={16} /> Instagram <ArrowUpRight size={15} /></a>}</div></section>
        <section className="section-card profile-links"><span className="section-label">CONEXIONES</span><h2>Mi nexo</h2>{mentor && <ConnectionListItem label="Me enroló" profile={mentor} onClick={() => onOpen(mentor)} />}{enrolled.map((person) => <ConnectionListItem key={person.id} label="Enrolado por mí" profile={person} onClick={() => onOpen(person)} />)}</section>
      </div>
    </div>
  );
}

function ConnectionListItem({ label, profile, onClick }: { label: string; profile: Profile; onClick: () => void }) {
  return <button className="connection-list-item" onClick={onClick}><Avatar profile={profile} size="small" /><div><span>{label}</span><strong>{profile.full_name}</strong></div><ChevronRight size={17} /></button>;
}

function ProfilePanel({ profile, profiles, isOwn, onClose, onOpen, onEdit }: { profile: Profile; profiles: Profile[]; isOwn: boolean; onClose: () => void; onOpen: (profile: Profile) => void; onEdit: () => void }) {
  const mentor = profiles.find((person) => person.id === profile.enrolled_by_id);
  const enrolled = profiles.filter((person) => person.enrolled_by_id === profile.id);
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <aside className="profile-panel" role="dialog" aria-modal="true" aria-label={`Perfil de ${profile.full_name}`}>
        <button className="close-button" onClick={onClose} aria-label="Cerrar perfil"><X /></button>
        <div className="panel-hero"><div className="panel-pattern" /><Avatar profile={profile} size="hero" /></div>
        <div className="panel-body">
          <span className="cohort-pill">{profile.cohort}</span>
          <h2>{profile.full_name}</h2>
          <p className="panel-role">{profile.profession ?? "Miembro de la comunidad"}</p>
          <div className="panel-meta">{profile.city && <span><MapPin /> {profile.city}, {profile.country}</span>}<span><CalendarDays /> {formatBirthDate(profile.birth_date)}</span></div>
          <div className="panel-about"><span className="section-label">SU HISTORIA</span><p>{profile.bio || "Esta persona todavía no ha compartido su descripción."}</p><div className="profile-detail-list">{profile.hobbies && <span><Heart size={15} /> {profile.hobbies}</span>}{profile.address && <span><MapPin size={15} /> {profile.address}</span>}</div></div>
          {profile.linkedin_url && <a className="panel-link" href={profile.linkedin_url} target="_blank" rel="noreferrer"><Link2 size={16} /> Ver perfil profesional <ArrowUpRight size={15} /></a>}
          {profile.instagram_url && <a className="panel-link" href={profile.instagram_url} target="_blank" rel="noreferrer"><AtSign size={16} /> Ver Instagram <ArrowUpRight size={15} /></a>}
          <div className="panel-connections"><div className="section-heading"><div><span className="section-label">CONEXIONES</span><h3>Su nexo</h3></div><Network size={20} /></div>{mentor && <ConnectionListItem label="Le enroló" profile={mentor} onClick={() => onOpen(mentor)} />}{enrolled.map((person) => <ConnectionListItem key={person.id} label="Enrolado por esta persona" profile={person} onClick={() => onOpen(person)} />)}{!mentor && !enrolled.length && <p className="muted-copy">Todavía no tiene conexiones registradas.</p>}</div>
          {isOwn && <button className="primary-button full-button" onClick={onEdit}><UserRoundPen size={17} /> Editar mi perfil</button>}
        </div>
      </aside>
    </div>
  );
}

type DraftUpdater = (field: keyof ProfileDraft, value: ProfileDraft[keyof ProfileDraft]) => void;

const limaCohortOptions = Array.from({ length: 61 }, (_, index) => `Lima ${180 + index}`);

function CohortInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <>
      <input list="lima-cohorts" value={value} onChange={(event) => onChange(event.target.value)} onBlur={(event) => onChange(normalizeCohort(event.target.value))} placeholder="Lima 200" />
      <datalist id="lima-cohorts">{limaCohortOptions.map((cohort) => <option key={cohort} value={cohort} />)}</datalist>
    </>
  );
}

function ProfilePhotoEditor({ profile, draft, update }: { profile: Profile; draft: ProfileDraft; update: DraftUpdater }) {
  const previewUrl = normalizePhotoUrl(draft.photo_url);
  const previewProfile: Profile = {
    ...profile,
    full_name: draft.full_name || profile.full_name,
    photo_url: previewUrl,
    photo_zoom: draft.photo_zoom,
    photo_position_x: draft.photo_position_x,
    photo_position_y: draft.photo_position_y,
  };
  const resetFrame = () => {
    update("photo_zoom", 1);
    update("photo_position_x", 50);
    update("photo_position_y", 50);
  };

  return (
    <div className="photo-editor-block">
      <div className="photo-field">
        <div className="photo-preview-wrap"><Avatar profile={previewProfile} size="hero" /><small>Vista previa</small></div>
        <label><Camera size={16} /><span>Enlace público de tu foto</span><input type="url" value={draft.photo_url ?? ""} onChange={(event) => update("photo_url", event.target.value)} placeholder="https://drive.google.com/file/d/…" />{previewUrl && <a href={previewUrl} target="_blank" rel="noreferrer">Comprobar imagen directa <ArrowUpRight size={13} /></a>}</label>
      </div>
      <PhotoLinkGuide />
      {previewUrl && (
        <div className="photo-adjustment">
          <header><div><strong>Ajustar encuadre</strong><span>Mueve el foco y acerca la imagen hasta que se vea bien.</span></div><button type="button" onClick={resetFrame}>Recentrar</button></header>
          <div className="photo-sliders">
            <label><span>Zoom <b>{clampPhotoValue(draft.photo_zoom, 1, 2, 1).toFixed(2)}×</b></span><input type="range" min="1" max="2" step="0.05" value={clampPhotoValue(draft.photo_zoom, 1, 2, 1)} onChange={(event) => update("photo_zoom", Number(event.target.value))} /></label>
            <label><span>Posición horizontal</span><input type="range" min="0" max="100" value={clampPhotoValue(draft.photo_position_x, 0, 100, 50)} onChange={(event) => update("photo_position_x", Number(event.target.value))} /></label>
            <label><span>Posición vertical</span><input type="range" min="0" max="100" value={clampPhotoValue(draft.photo_position_y, 0, 100, 50)} onChange={(event) => update("photo_position_y", Number(event.target.value))} /></label>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoLinkGuide() {
  return (
    <details className="photo-link-guide">
      <summary><Camera size={15} /> ¿Cómo obtengo un enlace para mi foto?<ChevronDown size={15} /></summary>
      <div>
        <ol>
          <li>Sube tu foto a Google Drive, Dropbox, Imgur o Cloudinary.</li>
          <li>Activa el acceso público: en Drive elige <strong>“Cualquier persona con el enlace”</strong>.</li>
          <li>Copia el enlace de Drive, pégalo arriba y ajusta el encuadre.</li>
        </ol>
        <p>Nexo convierte el enlace compartido de Drive en una imagen directa. Si la vista previa no aparece, vuelve a comprobar que el acceso general sea público.</p>
      </div>
    </details>
  );
}

function ProfilePicker({
  profiles,
  profileId,
  value,
  onChange,
}: {
  profiles: Profile[];
  profileId?: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedProfile = profiles.find((person) => person.id === value);
  const options = profiles
    .filter((person) => person.id !== profileId)
    .filter((person) => `${person.full_name} ${person.cohort} ${person.profession ?? ""} ${person.city ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()))
    .slice(0, 12);

  const choose = (next: string | null) => {
    onChange(next);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={`profile-picker ${open ? "picker-open" : ""}`}>
      <button className="profile-picker-trigger" type="button" onClick={() => setOpen((current) => !current)} aria-haspopup="listbox" aria-expanded={open}>
        {selectedProfile ? (
          <><Avatar profile={selectedProfile} size="small" /><span><strong>{selectedProfile.full_name}</strong><small>{selectedProfile.cohort} · {selectedProfile.profession || selectedProfile.city || "Miembro de Nexo"}</small></span></>
        ) : (
          <><span className="picker-empty-avatar"><Users size={17} /></span><span><strong>Nadie / No aplica</strong><small>Selecciona solo si alguien te invitó a la red</small></span></>
        )}
        <ChevronDown className="picker-chevron" size={17} />
      </button>
      {open && (
        <div className="profile-picker-popover">
          <label className="picker-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, promoción o profesión…" /></label>
          <div className="picker-options" role="listbox">
            <button className={`picker-option ${!value ? "selected" : ""}`} type="button" role="option" aria-selected={!value} onClick={() => choose(null)}>
              <span className="picker-empty-avatar"><Users size={16} /></span><span><strong>Nadie / No aplica</strong><small>No llegué por invitación de otra persona</small></span>{!value && <Check size={17} />}
            </button>
            {options.map((person) => (
              <button className={`picker-option ${value === person.id ? "selected" : ""}`} key={person.id} type="button" role="option" aria-selected={value === person.id} onClick={() => choose(person.id)}>
                <Avatar profile={person} size="small" />
                <span><strong>{person.full_name}</strong><small>{person.cohort} · {person.profession || person.city || "Miembro de Nexo"}</small></span>
                {value === person.id && <Check size={17} />}
              </button>
            ))}
            {!options.length && <p className="picker-no-results">No encontramos a alguien con esa búsqueda.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileOnboarding({
  profile,
  profiles,
  accountControl,
  onSave,
}: {
  profile: Profile;
  profiles: Profile[];
  accountControl: React.ReactNode;
  onSave: (draft: ProfileDraft) => Promise<Profile | void>;
}) {
  const [draft, setDraft] = useState<ProfileDraft>({ ...emptyDraft, ...profile });
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const update: DraftUpdater = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const continueTo = (next: number) => {
    if (step === 1 && (!draft.full_name.trim() || !isValidCohort(draft.cohort))) {
      setMessage("Completa tu nombre y usa el formato de promoción Lima 200.");
      return;
    }
    setMessage(null);
    setStep(next);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.full_name.trim() || !isValidCohort(draft.cohort)) {
      setStep(1);
      setMessage("Completa tu nombre y usa el formato de promoción Lima 200.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try { await onSave(draft); } catch { setMessage("No pudimos crear tu perfil. Revisa tu conexión e inténtalo de nuevo."); setSaving(false); }
  };

  return (
    <main className="onboarding-shell">
      <header className="onboarding-topbar"><Brand /><div><span>Tu cuenta está protegida</span>{accountControl}</div></header>
      <div className="onboarding-layout">
        <aside className="onboarding-intro">
          <span className="section-label">BIENVENIDO A NEXO</span>
          <h1>Construyamos tu lugar en la red.</h1>
          <p>Antes de mostrarte la comunidad, necesitamos conocerte un poco. Podrás modificar todo después.</p>
          <div className="onboarding-steps" aria-label="Progreso del perfil">
            {["Tu identidad", "Sobre ti", "Tu conexión"].map((label, index) => {
              const number = index + 1;
              return <div className={`${step === number ? "active" : ""} ${step > number ? "complete" : ""}`} key={label}><i>{step > number ? <Check size={14} /> : number}</i><span><strong>{label}</strong><small>{number === 1 ? "Nombre, foto y promoción" : number === 2 ? "Historia e intereses" : "Personas y redes"}</small></span></div>;
            })}
          </div>
        </aside>

        <section className="onboarding-card">
          <form onSubmit={submit}>
            <header><span>PASO {step} DE 3</span><h2>{step === 1 ? "Empecemos por ti" : step === 2 ? "Cuéntanos quién eres" : "Conecta tu historia"}</h2><p>{step === 1 ? "Esta información te identificará en el directorio." : step === 2 ? "Ayuda a que otras personas encuentren puntos en común contigo." : "Completa el origen de tu conexión y tus canales públicos."}</p></header>

            {step === 1 && <div className="onboarding-step-panel step-enter">
              <ProfilePhotoEditor profile={profile} draft={draft} update={update} />
              <div className="form-grid onboarding-fields">
                <Field label="Nombre completo" required><input value={draft.full_name} onChange={(event) => update("full_name", event.target.value)} placeholder="Tu nombre y apellido" /></Field>
                <Field label="Promoción" required><CohortInput value={draft.cohort} onChange={(value) => update("cohort", value)} /></Field>
                <Field label="Fecha de nacimiento"><input type="date" value={draft.birth_date ?? ""} onChange={(event) => update("birth_date", event.target.value)} /></Field>
                <Field label="Profesión u ocupación"><input value={draft.profession ?? ""} onChange={(event) => update("profession", event.target.value)} placeholder="Diseñador, emprendedora…" /></Field>
              </div>
            </div>}

            {step === 2 && <div className="onboarding-step-panel step-enter"><div className="form-grid onboarding-fields">
              <Field label="Ciudad"><input value={draft.city ?? ""} onChange={(event) => update("city", event.target.value)} placeholder="Lima" /></Field>
              <Field label="País"><input value={draft.country ?? ""} onChange={(event) => update("country", event.target.value)} placeholder="Perú" /></Field>
              <Field label="Dirección o zona"><input value={draft.address ?? ""} onChange={(event) => update("address", event.target.value)} placeholder="Miraflores, Lima" /><small>Comparte solo una referencia que quieras hacer pública.</small></Field>
              <Field label="Hobbies e intereses"><input value={draft.hobbies ?? ""} onChange={(event) => update("hobbies", event.target.value)} placeholder="Fotografía, running, lectura…" /></Field>
              <Field label="Tu descripción" wide><textarea rows={5} maxLength={320} value={draft.bio ?? ""} onChange={(event) => update("bio", event.target.value)} placeholder="Cuéntanos brevemente quién eres, qué haces y qué te inspira." /><small>{draft.bio?.length ?? 0}/320</small></Field>
            </div></div>}

            {step === 3 && <div className="onboarding-step-panel step-enter"><div className="form-grid onboarding-fields">
              <div className="field field-wide"><span>¿Quién te enroló?</span><ProfilePicker profiles={profiles} profileId={profile.id} value={draft.enrolled_by_id} onChange={(value) => update("enrolled_by_id", value)} /></div>
              <Field label="LinkedIn o portafolio"><input type="url" value={draft.linkedin_url ?? ""} onChange={(event) => update("linkedin_url", event.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
              <Field label="Instagram"><input type="url" value={draft.instagram_url ?? ""} onChange={(event) => update("instagram_url", event.target.value)} placeholder="https://instagram.com/tu_usuario" /></Field>
            </div><div className="onboarding-ready"><Sparkles size={21} /><div><strong>Tu perfil está listo para nacer.</strong><p>Al guardarlo podrás explorar el directorio, abrir perfiles y visualizar todas tus conexiones.</p></div></div></div>}

            {message && <p className="form-message">{message}</p>}
            <footer>
              {step > 1 ? <button className="ghost-button" type="button" onClick={() => continueTo(step - 1)}>Atrás</button> : <span />}
              {step < 3 ? <button className="primary-button" type="button" onClick={() => continueTo(step + 1)}>Continuar <ArrowRight size={17} /></button> : <button className="primary-button" type="submit" disabled={saving}><Save size={17} /> {saving ? "Creando tu perfil…" : "Entrar a Nexo"}</button>}
            </footer>
          </form>
        </section>
      </div>
    </main>
  );
}

function ProfileEditor({ profile, profiles, onClose, onSave }: { profile: Profile; profiles: Profile[]; onClose: () => void; onSave: (draft: ProfileDraft) => Promise<void> }) {
  const [draft, setDraft] = useState<ProfileDraft>({ ...emptyDraft, ...profile });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const update: DraftUpdater = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.full_name.trim() || !isValidCohort(draft.cohort)) { setMessage("Completa tu nombre y usa el formato de promoción Lima 200."); return; }
    setSaving(true);
    setMessage(null);
    try { await onSave(draft); } catch { setMessage("No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo."); setSaving(false); }
  };
  return (
    <div className="overlay editor-overlay" role="presentation">
      <section className="profile-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <header><div><span className="section-label">TU INFORMACIÓN</span><h2 id="editor-title">Editar perfil</h2><p>Comparte lo esencial para que tu comunidad pueda conocerte.</p></div><button className="close-button" onClick={onClose} aria-label="Cerrar editor"><X /></button></header>
        <form onSubmit={submit}>
          <ProfilePhotoEditor profile={profile} draft={draft} update={update} />
          <div className="form-grid">
            <Field label="Nombre completo" required><input value={draft.full_name} onChange={(event) => update("full_name", event.target.value)} placeholder="Tu nombre y apellido" /></Field>
            <Field label="Promoción" required><CohortInput value={draft.cohort} onChange={(value) => update("cohort", value)} /></Field>
            <Field label="Fecha de nacimiento"><input type="date" value={draft.birth_date ?? ""} onChange={(event) => update("birth_date", event.target.value)} /></Field>
            <Field label="Profesión u ocupación"><input value={draft.profession ?? ""} onChange={(event) => update("profession", event.target.value)} placeholder="Diseñador, emprendedora..." /></Field>
            <Field label="Ciudad"><input value={draft.city ?? ""} onChange={(event) => update("city", event.target.value)} placeholder="Lima" /></Field>
            <Field label="País"><input value={draft.country ?? ""} onChange={(event) => update("country", event.target.value)} placeholder="Perú" /></Field>
            <Field label="Dirección o zona"><input value={draft.address ?? ""} onChange={(event) => update("address", event.target.value)} placeholder="Miraflores, Lima" /></Field>
            <Field label="Hobbies e intereses"><input value={draft.hobbies ?? ""} onChange={(event) => update("hobbies", event.target.value)} placeholder="Fotografía, running, lectura…" /></Field>
            <div className="field field-wide"><span>¿Quién te enroló?</span><ProfilePicker profiles={profiles} profileId={profile.id} value={draft.enrolled_by_id} onChange={(value) => update("enrolled_by_id", value)} /></div>
            <Field label="LinkedIn o portafolio"><input type="url" value={draft.linkedin_url ?? ""} onChange={(event) => update("linkedin_url", event.target.value)} placeholder="https://linkedin.com/in/..." /></Field>
            <Field label="Instagram"><input type="url" value={draft.instagram_url ?? ""} onChange={(event) => update("instagram_url", event.target.value)} placeholder="https://instagram.com/tu_usuario" /></Field>
            <Field label="Tu descripción" wide><textarea rows={4} maxLength={320} value={draft.bio ?? ""} onChange={(event) => update("bio", event.target.value)} placeholder="Cuéntanos brevemente quién eres, qué haces y qué te inspira." /><small>{draft.bio?.length ?? 0}/320</small></Field>
          </div>
          {message && <p className="form-message">{message}</p>}
          <footer><button className="ghost-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" disabled={saving}><Save size={17} /> {saving ? "Guardando..." : "Guardar cambios"}</button></footer>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children, wide = false, required = false }: { label: string; children: React.ReactNode; wide?: boolean; required?: boolean }) {
  return <label className={`field ${wide ? "field-wide" : ""}`}><span>{label}{required && <b> *</b>}</span>{children}</label>;
}
