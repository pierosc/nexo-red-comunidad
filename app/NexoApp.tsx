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
  Bell,
  BookOpen,
  CalendarDays,
  Camera,
  ChevronRight,
  CircleUserRound,
  Home,
  Link2,
  MapPin,
  Network,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRoundPen,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type View = "home" | "directory" | "connections" | "profile";

export type Profile = {
  id: string;
  clerk_user_id: string;
  full_name: string;
  photo_url: string | null;
  bio: string | null;
  cohort: string;
  birth_date: string | null;
  city: string | null;
  country: string | null;
  profession: string | null;
  linkedin_url: string | null;
  enrolled_by_id: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileDraft = Pick<
  Profile,
  | "full_name"
  | "photo_url"
  | "bio"
  | "cohort"
  | "birth_date"
  | "city"
  | "country"
  | "profession"
  | "linkedin_url"
  | "enrolled_by_id"
>;

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const clerkKey = env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
const supabaseUrl = env.VITE_SUPABASE_URL ?? "";
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

const demoProfiles: Profile[] = [
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

const emptyDraft: ProfileDraft = {
  full_name: "",
  photo_url: "",
  bio: "",
  cohort: "",
  birth_date: "",
  city: "",
  country: "",
  profession: "",
  linkedin_url: "",
  enrolled_by_id: null,
};

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
  return (
    <div className={`avatar avatar-${size}`} aria-label={`Foto de ${profile.full_name}`}>
      {profile.photo_url ? (
        // Profile photos are user-provided remote URLs, so a fixed image loader is not available.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.photo_url} alt="" />
      ) : (
        <span>{initials(profile.full_name)}</span>
      )}
    </div>
  );
}

function createSupabase(getToken: () => Promise<string | null>): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    accessToken: async () => getToken(),
  });
}

function useProfiles(userId: string, getToken?: () => Promise<string | null>) {
  const live = Boolean(supabaseUrl && supabaseKey && getToken);
  const [profiles, setProfiles] = useState<Profile[]>(demoProfiles);
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState<string | null>(null);
  const client = useMemo(
    () => (getToken ? createSupabase(getToken) : null),
    [getToken],
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
        photo_url: draft.photo_url || null,
        bio: draft.bio || null,
        birth_date: draft.birth_date || null,
        city: draft.city || null,
        country: draft.country || null,
        profession: draft.profession || null,
        linkedin_url: draft.linkedin_url || null,
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

export default function NexoApp() {
  if (clerkKey) {
    return (
      <ClerkProvider publishableKey={clerkKey} signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/">
        <ClerkExperience />
      </ClerkProvider>
    );
  }

  return <DemoExperience />;
}

function ClerkExperience() {
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
            <div><strong>Piero</strong><span>Promoción 2018</span></div>
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
          <div className="preview-label"><Users size={15} /> 128 personas conectadas</div>
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
  accountControl,
}: {
  userId: string;
  userName: string;
  userImage?: string;
  getToken?: () => Promise<string | null>;
  accountControl: React.ReactNode;
}) {
  const { profiles, loading, error, live, saveProfile } = useProfiles(userId, getToken);
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [cohort, setCohort] = useState("Todas");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const currentProfile = profiles.find((profile) => profile.clerk_user_id === userId);
  const displayProfile = currentProfile ?? {
    ...demoProfiles[0],
    clerk_user_id: userId,
    full_name: userName,
    photo_url: userImage ?? demoProfiles[0].photo_url,
  };

  const shouldOnboard = live && !loading && !currentProfile;
  const showEditor = editing || shouldOnboard;

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

  return (
    <div className="workspace">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand"><Brand inverse /></div>
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

        <main className="content">
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
      {showEditor && (
        <ProfileEditor
          profile={currentProfile ?? displayProfile}
          profiles={profiles}
          onClose={() => { if (!shouldOnboard) setEditing(false); }}
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
        <article className="stat-card stat-primary"><div className="stat-icon"><Users /></div><span>Personas en la red</span><strong>{loading ? "—" : profiles.length + 120}</strong><small><b>+8</b> este mes</small><div className="stat-decoration">N</div></article>
        <article className="stat-card"><div className="stat-icon coral"><Network /></div><span>Tus conexiones</span><strong>{enrolled.length + (mentor ? 1 : 0)}</strong><small>{enrolled.length} enroladas por ti</small></article>
        <article className="stat-card"><div className="stat-icon sage"><BookOpen /></div><span>Promociones</span><strong>{new Set(profiles.map((item) => item.cohort)).size}</strong><small>2015 — 2021</small></article>
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

function Connections({ profile, profiles, onOpen }: { profile: Profile; profiles: Profile[]; onOpen: (profile: Profile) => void }) {
  const mentor = profiles.find((person) => person.id === profile.enrolled_by_id);
  const enrolled = profiles.filter((person) => person.enrolled_by_id === profile.id);

  return (
    <div className="connections-page page-enter">
      <div className="page-heading"><div><span className="page-kicker">TU MAPA</span><h1>Las personas que te conectan</h1><p>Cada línea cuenta cómo crece la comunidad, una persona a la vez.</p></div></div>
      <section className="connection-map">
        <div className="map-grid" />
        {mentor && <button className="map-node mentor-node" onClick={() => onOpen(mentor)}><Avatar profile={mentor} size="large" /><span className="node-tag">TE ENROLÓ</span><strong>{mentor.full_name}</strong><small>{mentor.cohort}</small></button>}
        <div className="map-line map-line-top" />
        <button className="map-node center-node" onClick={() => onOpen(profile)}><Avatar profile={profile} size="hero" /><span className="node-tag">TÚ</span><strong>{profile.full_name}</strong><small>{profile.cohort}</small></button>
        <div className="map-line map-line-bottom" />
        <div className="child-nodes">
          {enrolled.length ? enrolled.map((person) => <button key={person.id} className="map-node" onClick={() => onOpen(person)}><Avatar profile={person} size="medium" /><strong>{person.full_name}</strong><small>{person.cohort}</small></button>) : <div className="invite-node"><UserPlus /><strong>Tu red empieza aquí</strong><span>Invita a tu primera persona</span></div>}
        </div>
        <div className="map-caption"><span>{mentor ? 1 : 0}</span> persona te enroló <i /> <span>{enrolled.length}</span> personas enroladas por ti</div>
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
        <section className="section-card profile-about"><span className="section-label">SOBRE MÍ</span><h2>Mi historia</h2><p>{profile.bio || "Aún no has agregado una descripción."}</p>{profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer"><Link2 size={16} /> Perfil profesional <ArrowUpRight size={15} /></a>}</section>
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
          <div className="panel-about"><span className="section-label">SU HISTORIA</span><p>{profile.bio || "Esta persona todavía no ha compartido su descripción."}</p></div>
          {profile.linkedin_url && <a className="panel-link" href={profile.linkedin_url} target="_blank" rel="noreferrer"><Link2 size={16} /> Ver perfil profesional <ArrowUpRight size={15} /></a>}
          <div className="panel-connections"><div className="section-heading"><div><span className="section-label">CONEXIONES</span><h3>Su nexo</h3></div><Network size={20} /></div>{mentor && <ConnectionListItem label="Le enroló" profile={mentor} onClick={() => onOpen(mentor)} />}{enrolled.map((person) => <ConnectionListItem key={person.id} label="Enrolado por esta persona" profile={person} onClick={() => onOpen(person)} />)}{!mentor && !enrolled.length && <p className="muted-copy">Todavía no tiene conexiones registradas.</p>}</div>
          {isOwn && <button className="primary-button full-button" onClick={onEdit}><UserRoundPen size={17} /> Editar mi perfil</button>}
        </div>
      </aside>
    </div>
  );
}

function ProfileEditor({ profile, profiles, onClose, onSave }: { profile: Profile; profiles: Profile[]; onClose: () => void; onSave: (draft: ProfileDraft) => Promise<void> }) {
  const [draft, setDraft] = useState<ProfileDraft>({ ...emptyDraft, ...profile });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const update = (field: keyof ProfileDraft, value: string | null) => setDraft((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.full_name.trim() || !draft.cohort.trim()) { setMessage("El nombre y la promoción son obligatorios."); return; }
    setSaving(true);
    setMessage(null);
    try { await onSave(draft); } catch { setMessage("No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo."); setSaving(false); }
  };
  return (
    <div className="overlay editor-overlay" role="presentation">
      <section className="profile-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <header><div><span className="section-label">TU INFORMACIÓN</span><h2 id="editor-title">Editar perfil</h2><p>Comparte lo esencial para que tu comunidad pueda conocerte.</p></div><button className="close-button" onClick={onClose} aria-label="Cerrar editor"><X /></button></header>
        <form onSubmit={submit}>
          <div className="photo-field"><Avatar profile={{ ...profile, photo_url: draft.photo_url || null, full_name: draft.full_name || profile.full_name }} size="large" /><label><Camera size={16} /><span>Foto de perfil como enlace</span><input type="url" value={draft.photo_url ?? ""} onChange={(event) => update("photo_url", event.target.value)} placeholder="https://ejemplo.com/mi-foto.jpg" /></label></div>
          <div className="form-grid">
            <Field label="Nombre completo" required><input value={draft.full_name} onChange={(event) => update("full_name", event.target.value)} placeholder="Tu nombre y apellido" /></Field>
            <Field label="Promoción" required><input value={draft.cohort} onChange={(event) => update("cohort", event.target.value)} placeholder="Promoción 2018" /></Field>
            <Field label="Fecha de nacimiento"><input type="date" value={draft.birth_date ?? ""} onChange={(event) => update("birth_date", event.target.value)} /></Field>
            <Field label="Profesión u ocupación"><input value={draft.profession ?? ""} onChange={(event) => update("profession", event.target.value)} placeholder="Diseñador, emprendedora..." /></Field>
            <Field label="Ciudad"><input value={draft.city ?? ""} onChange={(event) => update("city", event.target.value)} placeholder="Lima" /></Field>
            <Field label="País"><input value={draft.country ?? ""} onChange={(event) => update("country", event.target.value)} placeholder="Perú" /></Field>
            <Field label="¿Quién te enroló?"><select value={draft.enrolled_by_id ?? ""} onChange={(event) => update("enrolled_by_id", event.target.value || null)}><option value="">Nadie / No aplica</option>{profiles.filter((person) => person.id !== profile.id).map((person) => <option key={person.id} value={person.id}>{person.full_name}</option>)}</select></Field>
            <Field label="LinkedIn o portafolio"><input type="url" value={draft.linkedin_url ?? ""} onChange={(event) => update("linkedin_url", event.target.value)} placeholder="https://linkedin.com/in/..." /></Field>
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
