"use client";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  ArrowRight,
  ArrowUpRight,
  AlertTriangle,
  AtSign,
  Bell,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Eye,
  Home,
  Heart,
  Image as ImageIcon,
  Link2,
  LocateFixed,
  MapPin,
  MessageCircle,
  Minus,
  Moon,
  Move,
  Network,
  Pencil,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
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

const APP_VERSION = "1.1.0";
const EASTER_EGG_EVENT = "nexo:val-easter-egg";

const valParticles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${6 + ((index * 23) % 88)}%`,
  delay: `${(index % 6) * 0.22}s`,
  duration: `${2.8 + (index % 5) * 0.34}s`,
  drift: `${-34 + ((index * 19) % 68)}px`,
  size: `${10 + (index % 4) * 4}px`,
}));

function revealValEasterEgg() {
  window.dispatchEvent(new Event(EASTER_EGG_EVENT));
}

const STRETCHING_OPTIONS = [
  "Mimo",
  "Odalisca",
  "Novia",
  "Puma",
  "Bailarina",
  "Mariposa",
  "Cupido",
  "Gaviota",
  "Stripper",
  "Modelo",
  "Azúcar",
] as const;

const HOBBY_OPTIONS = [
  "Arte y manualidades",
  "Baile",
  "Ciclismo",
  "Cine y series",
  "Cocina",
  "Correr",
  "Emprendimiento",
  "Fotografía",
  "Fútbol",
  "Gimnasio",
  "Jardinería",
  "Lectura",
  "Mascotas",
  "Meditación",
  "Música",
  "Naturaleza",
  "Senderismo",
  "Tecnología",
  "Viajes",
  "Videojuegos",
  "Vóley",
  "Voluntariado",
  "Yoga",
] as const;

const PROFILE_HOBBY_LIMIT = 12;
const HOBBY_OPTION_PREVIEW_COUNT = 12;
const PROFILE_GALLERY_LIMIT = 8;

function normalizeHobbies(values: readonly string[]) {
  const normalized = new Map<string, string>();
  values.forEach((value) => {
    const trimmed = value.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!trimmed) return;
    const known = HOBBY_OPTIONS.find((option) => option.localeCompare(trimmed, "es", { sensitivity: "base" }) === 0);
    normalized.set(trimmed.toLocaleLowerCase("es"), known ?? trimmed);
  });
  return Array.from(normalized.values()).slice(0, PROFILE_HOBBY_LIMIT);
}

function profileHobbies(profile: Pick<Profile, "hobbies" | "hobbies_list">) {
  if (profile.hobbies_list !== null && profile.hobbies_list !== undefined) return normalizeHobbies(profile.hobbies_list);
  return normalizeHobbies((profile.hobbies ?? "").split(/[,;\n]+/));
}

function communityCustomHobbyOptions(profiles: readonly Profile[]) {
  const options = new Map<string, string>();

  profiles.forEach((profile) => {
    profileHobbies(profile).forEach((hobby) => {
      const isStandardOption = HOBBY_OPTIONS.some((option) => option.localeCompare(hobby, "es", { sensitivity: "base" }) === 0);
      if (!isStandardOption) options.set(hobby.toLocaleLowerCase("es"), hobby);
    });
  });

  return Array.from(options.values()).sort((first, second) => first.localeCompare(second, "es", { sensitivity: "base" }));
}

export type Profile = {
  id: string;
  clerk_user_id: string;
  full_name: string;
  photo_url: string | null;
  photo_zoom?: number | null;
  photo_position_x?: number | null;
  photo_position_y?: number | null;
  gallery_urls?: string[] | null;
  cover_url?: string | null;
  cover_zoom?: number | null;
  cover_position_x?: number | null;
  cover_position_y?: number | null;
  bio: string | null;
  cohort: string;
  birth_date: string | null;
  city: string | null;
  country: string | null;
  profession: string | null;
  linkedin_url: string | null;
  instagram_url?: string | null;
  phone?: string | null;
  facebook_url?: string | null;
  stretching?: string | null;
  hobbies?: string | null;
  hobbies_list?: string[] | null;
  address?: string | null;
  enrolled_by_id: string | null;
  created_at: string;
  updated_at: string;
};

const RELATIONSHIP_OPTIONS = [
  { value: "spouse", label: "Esposo/a", group: "family" },
  { value: "partner", label: "Pareja", group: "family" },
  { value: "parent", label: "Padre / madre", group: "family" },
  { value: "child", label: "Hijo/a", group: "family" },
  { value: "sibling", label: "Hermano/a", group: "family" },
  { value: "grandparent", label: "Abuelo/a", group: "family" },
  { value: "grandchild", label: "Nieto/a", group: "family" },
  { value: "uncle_aunt", label: "Tío/a", group: "family" },
  { value: "nephew_niece", label: "Sobrino/a", group: "family" },
  { value: "cousin", label: "Primo/a", group: "family" },
  { value: "relative", label: "Familiar", group: "family" },
  { value: "friend", label: "Amigo/a", group: "social" },
  { value: "classmate", label: "Compañero/a de promoción", group: "social" },
  { value: "colleague", label: "Colega de trabajo", group: "social" },
  { value: "mentor", label: "Mentor/a", group: "social" },
  { value: "mentee", label: "Persona mentoreada", group: "social" },
  { value: "neighbor", label: "Vecino/a", group: "social" },
  { value: "other", label: "Otro", group: "other" },
] as const;

type RelationshipType = (typeof RELATIONSHIP_OPTIONS)[number]["value"];
type ConnectionType = "i_enrolled" | "enrolled_me" | RelationshipType;

export type ProfileRelationship = {
  id: string;
  profile_id: string;
  related_profile_id: string;
  relationship_type: RelationshipType;
  custom_label: string | null;
  created_at: string;
  updated_at: string;
};

type RelationshipView = {
  id: string;
  profile: Profile;
  label: string;
};

function relationshipLabel(relationship: ProfileRelationship, incoming: boolean) {
  if (relationship.relationship_type === "other") return relationship.custom_label?.trim() || "Otra relación";

  const labels: Record<Exclude<RelationshipType, "other">, [string, string]> = {
    spouse: ["Esposo/a", "Esposo/a"],
    partner: ["Pareja", "Pareja"],
    parent: ["Padre / madre", "Hijo/a"],
    child: ["Hijo/a", "Padre / madre"],
    sibling: ["Hermano/a", "Hermano/a"],
    grandparent: ["Abuelo/a", "Nieto/a"],
    grandchild: ["Nieto/a", "Abuelo/a"],
    uncle_aunt: ["Tío/a", "Sobrino/a"],
    nephew_niece: ["Sobrino/a", "Tío/a"],
    cousin: ["Primo/a", "Primo/a"],
    friend: ["Amigo/a", "Amigo/a"],
    classmate: ["Compañero/a de promoción", "Compañero/a de promoción"],
    colleague: ["Colega de trabajo", "Colega de trabajo"],
    mentor: ["Mentor/a", "Persona mentoreada"],
    mentee: ["Persona mentoreada", "Mentor/a"],
    neighbor: ["Vecino/a", "Vecino/a"],
    relative: ["Familiar", "Familiar"],
  };
  return labels[relationship.relationship_type][incoming ? 1 : 0];
}

function relationshipsForProfile(profileId: string, profiles: Profile[], relationships: ProfileRelationship[]): RelationshipView[] {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const grouped = new Map<string, RelationshipView>();
  relationships.forEach((relationship) => {
    const outgoing = relationship.profile_id === profileId;
    const incoming = relationship.related_profile_id === profileId;
    if (!outgoing && !incoming) return;
    const relatedProfile = profileById.get(outgoing ? relationship.related_profile_id : relationship.profile_id);
    if (!relatedProfile) return;
    const label = relationshipLabel(relationship, incoming);
    const existing = grouped.get(relatedProfile.id);
    if (!existing) {
      grouped.set(relatedProfile.id, { id: relationship.id, profile: relatedProfile, label });
    } else if (!existing.label.split(" · ").includes(label)) {
      existing.label = `${existing.label} · ${label}`;
    }
  });
  return Array.from(grouped.values());
}

type ProfileDraft = Pick<
  Profile,
  | "full_name"
  | "photo_url"
  | "photo_zoom"
  | "photo_position_x"
  | "photo_position_y"
  | "gallery_urls"
  | "cover_url"
  | "cover_zoom"
  | "cover_position_x"
  | "cover_position_y"
  | "bio"
  | "cohort"
  | "birth_date"
  | "city"
  | "country"
  | "profession"
  | "linkedin_url"
  | "instagram_url"
  | "phone"
  | "facebook_url"
  | "stretching"
  | "hobbies"
  | "hobbies_list"
  | "address"
  | "enrolled_by_id"
>;

export type NexoConfig = {
  clerkPublishableKey: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  appUrl?: string;
};

const emptyDraft: ProfileDraft = {
  full_name: "",
  photo_url: "",
  photo_zoom: 1,
  photo_position_x: 50,
  photo_position_y: 50,
  gallery_urls: [],
  cover_url: null,
  cover_zoom: 1,
  cover_position_x: 50,
  cover_position_y: 50,
  bio: "",
  cohort: "",
  birth_date: "",
  city: "",
  country: "",
  profession: "",
  linkedin_url: "",
  instagram_url: "",
  phone: "",
  facebook_url: "",
  stretching: "",
  hobbies: "",
  hobbies_list: [],
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

function normalizeGalleryUrls(values?: readonly string[] | null) {
  const normalized = new Map<string, string>();
  (values ?? []).forEach((value) => {
    const url = normalizePhotoUrl(value);
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") normalized.set(url.toLocaleLowerCase(), url);
    } catch {
      // Invalid links are omitted from the saved gallery.
    }
  });
  return Array.from(normalized.values()).slice(0, PROFILE_GALLERY_LIMIT);
}

function profileImages(profile: Pick<Profile, "photo_url" | "gallery_urls">) {
  const mainPhoto = normalizePhotoUrl(profile.photo_url);
  const gallery = normalizeGalleryUrls(profile.gallery_urls).filter((url) => url !== mainPhoto);
  return mainPhoto ? [mainPhoto, ...gallery] : gallery;
}

function instagramHandle(value?: string | null) {
  if (!value) return "";
  return value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
}

function normalizeInstagram(value?: string | null) {
  const handle = instagramHandle(value);
  return handle ? `https://instagram.com/${handle}` : null;
}

function normalizeFacebook(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(www\.)?facebook\.com\//i.test(trimmed)) return `https://${trimmed}`;
  return `https://facebook.com/${trimmed.replace(/^@/, "")}`;
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

function normalizePhotoPosition(value: number | null | undefined) {
  return Math.round(clampPhotoValue(value, 0, 100, 50));
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
  const photoPositionX = clampPhotoValue(profile.photo_position_x, 0, 100, 50);
  const photoPositionY = clampPhotoValue(profile.photo_position_y, 0, 100, 50);
  const photoStyle: CSSProperties = {
    objectPosition: `${photoPositionX}% ${photoPositionY}%`,
    transform: `scale(${clampPhotoValue(profile.photo_zoom, 1, 2, 1)})`,
    transformOrigin: `${photoPositionX}% ${photoPositionY}%`,
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

function ProfileImageDialog({ profile, images, initialIndex, onClose }: { profile: Profile; images: string[]; initialIndex: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.min(Math.max(initialIndex, 0), images.length - 1));
  const swipeStart = useRef<{ pointerId: number; x: number } | null>(null);
  const hasMultipleImages = images.length > 1;
  const showPrevious = () => setCurrentIndex((index) => (index - 1 + images.length) % images.length);
  const showNext = () => setCurrentIndex((index) => (index + 1) % images.length);

  useEffect(() => {
    const navigateWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (images.length > 1 && event.key === "ArrowLeft") setCurrentIndex((index) => (index - 1 + images.length) % images.length);
      if (images.length > 1 && event.key === "ArrowRight") setCurrentIndex((index) => (index + 1) % images.length);
    };
    window.addEventListener("keydown", navigateWithKeyboard);
    return () => window.removeEventListener("keydown", navigateWithKeyboard);
  }, [images.length, onClose]);

  const startSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!hasMultipleImages || (event.target as Element).closest("button")) return;
    swipeStart.current = { pointerId: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const finishSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || start.pointerId !== event.pointerId) return;
    const distance = event.clientX - start.x;
    if (Math.abs(distance) < 45) return;
    if (distance > 0) showPrevious(); else showNext();
  };

  return (
    <div className="profile-image-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="profile-image-dialog" role="dialog" aria-modal="true" aria-label={`Foto ampliada de ${profile.full_name}`}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar foto ampliada"><X /></button>
        <div className="profile-image-stage" onPointerDown={startSwipe} onPointerUp={finishSwipe} onPointerCancel={() => { swipeStart.current = null; }}>
          {/* Profile images are user-provided remote URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={images[currentIndex]} src={images[currentIndex]} alt={`Foto ${currentIndex + 1} de ${profile.full_name}`} draggable={false} />
          {hasMultipleImages && <>
            <button className="profile-image-arrow profile-image-arrow-previous" type="button" onClick={showPrevious} aria-label="Ver foto anterior"><ChevronLeft /></button>
            <button className="profile-image-arrow profile-image-arrow-next" type="button" onClick={showNext} aria-label="Ver foto siguiente"><ChevronRight /></button>
          </>}
        </div>
        <footer><strong>{profile.full_name}</strong><span>{hasMultipleImages ? `${profile.cohort} · ${currentIndex + 1} de ${images.length}` : profile.cohort}</span></footer>
      </section>
    </div>
  );
}

function ClickableProfilePhoto({ profile, size = "hero" }: { profile: Profile; size?: "large" | "hero" }) {
  const photoUrl = normalizePhotoUrl(profile.photo_url);
  const images = profileImages(profile);
  const [open, setOpen] = useState(false);

  if (!photoUrl) return <Avatar profile={profile} size={size} />;
  return (
    <>
      <button className="profile-photo-button" type="button" onClick={() => setOpen(true)} aria-label={`Ampliar foto de ${profile.full_name}`}>
        <Avatar profile={profile} size={size} />
        <span className="profile-photo-zoom"><Eye size={14} /></span>
      </button>
      {open && <ProfileImageDialog profile={profile} images={images} initialIndex={0} onClose={() => setOpen(false)} />}
    </>
  );
}

function ProfileGallery({ profile }: { profile: Profile }) {
  const images = normalizeGalleryUrls(profile.gallery_urls);
  const allImages = profileImages(profile);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  if (!images.length) return null;

  return (
    <>
      <div className="profile-gallery">
        <span className="section-label">FOTOS</span>
        <div>
          {images.map((url, index) => (
            <button key={url} type="button" onClick={() => setSelectedIndex(allImages.indexOf(url))} aria-label={`Ampliar foto ${index + 1} de ${profile.full_name}`}>
              {/* Profile gallery images are user-provided remote URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" loading="lazy" />
              <span><Eye size={14} /></span>
            </button>
          ))}
        </div>
      </div>
      {selectedIndex !== null && <ProfileImageDialog profile={profile} images={allImages} initialIndex={selectedIndex} onClose={() => setSelectedIndex(null)} />}
    </>
  );
}

function CoverMedia({ profile }: { profile: Profile }) {
  const coverUrl = normalizePhotoUrl(profile.cover_url);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const positionX = clampPhotoValue(profile.cover_position_x, 0, 100, 50);
  const positionY = clampPhotoValue(profile.cover_position_y, 0, 100, 50);
  const coverStyle: CSSProperties = {
    objectPosition: `${positionX}% ${positionY}%`,
    transform: `scale(${clampPhotoValue(profile.cover_zoom, 1, 2, 1)})`,
    transformOrigin: `${positionX}% ${positionY}%`,
  };

  if (!coverUrl || failedUrl === coverUrl) return <div className="cover-media-frame"><div className="cover-pattern" /></div>;
  return (
    <div className="cover-media-frame">
      {/* Cover images are user-provided remote URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cover-media" src={coverUrl} alt="" style={coverStyle} onError={() => setFailedUrl(coverUrl)} />
    </div>
  );
}

function createSupabase(config: NexoConfig, getToken: () => Promise<string | null>): SupabaseClient | null {
  if (!config.supabaseUrl || !config.supabasePublishableKey) return null;
  return createClient(config.supabaseUrl, config.supabasePublishableKey, {
    accessToken: async () => getToken(),
  });
}

function isExampleProfile(profile: Profile) {
  return profile.clerk_user_id.startsWith("demo_");
}

function useProfiles(userId: string, config: NexoConfig, getToken?: () => Promise<string | null>) {
  const live = Boolean(config.supabaseUrl && config.supabasePublishableKey && getToken);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [relationships, setRelationships] = useState<ProfileRelationship[]>([]);
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
      setProfiles((data as Profile[]).filter((profile) => !isExampleProfile(profile)));
      const { data: relationshipData, error: relationshipError } = await client
        .from("profile_relationships")
        .select("*")
        .order("created_at", { ascending: true });
      if (relationshipError) {
        setRelationships([]);
        setError("El directorio cargó, pero las relaciones personales todavía no están disponibles.");
      } else {
        setRelationships((relationshipData as ProfileRelationship[]) ?? []);
        setError(null);
      }
    }
    setLoading(false);
  }, [client]);

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, [refresh]);

  const saveProfile = useCallback(
    async (draft: ProfileDraft, current?: Profile) => {
      const now = new Date().toISOString();
      const hobbies = normalizeHobbies(draft.hobbies_list ?? (draft.hobbies ?? "").split(/[,;\n]+/));
      const record: Profile = {
        ...draft,
        id: current?.id ?? crypto.randomUUID(),
        clerk_user_id: userId,
        photo_url: normalizePhotoUrl(draft.photo_url),
        photo_zoom: clampPhotoValue(draft.photo_zoom, 1, 2, 1),
        photo_position_x: normalizePhotoPosition(draft.photo_position_x),
        photo_position_y: normalizePhotoPosition(draft.photo_position_y),
        gallery_urls: normalizeGalleryUrls(draft.gallery_urls),
        cover_url: normalizePhotoUrl(draft.cover_url),
        cover_zoom: clampPhotoValue(draft.cover_zoom, 1, 2, 1),
        cover_position_x: normalizePhotoPosition(draft.cover_position_x),
        cover_position_y: normalizePhotoPosition(draft.cover_position_y),
        bio: draft.bio || null,
        cohort: normalizeCohort(draft.cohort),
        birth_date: draft.birth_date || null,
        city: draft.city || null,
        country: draft.country || null,
        profession: draft.profession || null,
        linkedin_url: draft.linkedin_url || null,
        instagram_url: normalizeInstagram(draft.instagram_url),
        phone: draft.phone?.trim() || null,
        facebook_url: normalizeFacebook(draft.facebook_url),
        stretching: draft.stretching || null,
        hobbies: hobbies.join(", ") || null,
        hobbies_list: hobbies,
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

  const saveConnection = useCallback(
    async (enrollerId: string, enrolleeId: string) => {
      if (!enrollerId || !enrolleeId || enrollerId === enrolleeId) {
        throw new Error("La conexión seleccionada no es válida.");
      }

      if (client) {
        const { error: connectionError } = await client.rpc("set_enrollment_connection", {
          p_enroller_id: enrollerId,
          p_enrollee_id: enrolleeId,
        });
        if (connectionError) throw connectionError;
        await refresh();
        return;
      }

      setProfiles((previous) => previous.map((candidate) => (
        candidate.id === enrolleeId
          ? { ...candidate, enrolled_by_id: enrollerId, updated_at: new Date().toISOString() }
          : candidate
      )));
    },
    [client, refresh],
  );

  const saveRelationship = useCallback(
    async (profileId: string, relatedProfileId: string, relationshipType: RelationshipType, customLabel: string | null) => {
      const normalizedLabel = relationshipType === "other" ? customLabel?.trim() || null : null;
      if (!profileId || !relatedProfileId || profileId === relatedProfileId) {
        throw new Error("La relación seleccionada no es válida.");
      }
      if (relationshipType === "other" && (!normalizedLabel || normalizedLabel.length > 60)) {
        throw new Error("Escribe un nombre válido para la relación.");
      }

      if (client) {
        const { error: relationshipError } = await client.rpc("set_profile_relationship", {
          p_related_profile_id: relatedProfileId,
          p_relationship_type: relationshipType,
          p_custom_label: normalizedLabel,
        });
        if (relationshipError) throw relationshipError;
        await refresh();
        return;
      }

      const now = new Date().toISOString();
      setRelationships((previous) => {
        const existing = previous.find((relationship) => (
          (relationship.profile_id === profileId && relationship.related_profile_id === relatedProfileId)
          || (relationship.profile_id === relatedProfileId && relationship.related_profile_id === profileId)
        ));
        if (existing) {
          return previous.map((relationship) => relationship.id === existing.id
            ? { ...relationship, profile_id: profileId, related_profile_id: relatedProfileId, relationship_type: relationshipType, custom_label: normalizedLabel, updated_at: now }
            : relationship);
        }
        return [...previous, {
          id: crypto.randomUUID(),
          profile_id: profileId,
          related_profile_id: relatedProfileId,
          relationship_type: relationshipType,
          custom_label: normalizedLabel,
          created_at: now,
          updated_at: now,
        }];
      });
    },
    [client, refresh],
  );

  const deleteProfile = useCallback(async () => {
    if (client) {
      const { error: deleteError } = await client
        .from("profiles")
        .delete()
        .eq("clerk_user_id", userId);
      if (deleteError) throw deleteError;
    }
    setProfiles((previous) => previous.filter((profile) => profile.clerk_user_id !== userId));
  }, [client, userId]);

  return { profiles, relationships, loading, error, live, client, saveProfile, saveConnection, saveRelationship, deleteProfile };
}

function communityChannelKey(type: CommunityChannelType, label: string) {
  return type === "cohort" ? normalizeCohort(label) : label.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
}

function communityChannelId(channel: Pick<CommunityChannel, "type" | "key">) {
  return `${channel.type}:${channel.key}`;
}

function mergeCommunityMessage(messages: CommunityMessage[], message: CommunityMessage) {
  const next = messages.some((candidate) => candidate.id === message.id)
    ? messages.map((candidate) => candidate.id === message.id ? message : candidate)
    : [...messages, message];
  return next
    .sort((first, second) => first.created_at.localeCompare(second.created_at))
    .slice(-600);
}

function useCommunityMessages(client: SupabaseClient | null, profile: Profile | undefined) {
  const profileId = profile?.id;
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [reads, setReads] = useState<CommunityChannelRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!client || !profileId) {
      setMessages([]);
      setReads([]);
      return;
    }
    setLoading(true);
    const [messageResult, readResult] = await Promise.all([
      client
        .from("community_messages")
        .select("id, channel_type, channel_key, author_profile_id, body, created_at")
        .order("created_at", { ascending: false })
        .limit(600),
      client
        .from("community_channel_reads")
        .select("profile_id, channel_type, channel_key, last_read_at")
        .eq("profile_id", profileId),
    ]);

    if (messageResult.error || readResult.error) {
      setError("Las conversaciones todavía no están disponibles. Intenta nuevamente en un momento.");
    } else {
      setMessages(((messageResult.data as CommunityMessage[] | null) ?? []).reverse());
      setReads((readResult.data as CommunityChannelRead[] | null) ?? []);
      setError(null);
    }
    setLoading(false);
  }, [client, profileId]);

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, [refresh]);

  useEffect(() => {
    if (!client || !profileId) return;
    const realtime = client
      .channel(`community-messages-${profileId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages" },
        (payload) => setMessages((current) => mergeCommunityMessage(current, payload.new as CommunityMessage)),
      )
      .subscribe();
    return () => { void client.removeChannel(realtime); };
  }, [client, profileId]);

  const markRead = useCallback(async (channel: CommunityChannel) => {
    if (!client || !profileId) return;
    const readAt = new Date().toISOString();
    const nextRead: CommunityChannelRead = {
      profile_id: profileId,
      channel_type: channel.type,
      channel_key: channel.key,
      last_read_at: readAt,
    };
    setReads((current) => {
      const exists = current.some((read) => read.channel_type === channel.type && read.channel_key === channel.key);
      return exists
        ? current.map((read) => read.channel_type === channel.type && read.channel_key === channel.key ? nextRead : read)
        : [...current, nextRead];
    });
    const { data, error: readError } = await client.rpc("mark_community_channel_read", {
      p_channel_type: channel.type,
      p_channel_key: channel.key,
    });
    if (readError) {
      setError("No pudimos actualizar tus notificaciones.");
      return;
    }
    if (typeof data === "string") {
      setReads((current) => current.map((read) => (
        read.channel_type === channel.type && read.channel_key === channel.key
          ? { ...read, last_read_at: data }
          : read
      )));
    }
  }, [client, profileId]);

  const postMessage = useCallback(async (channel: CommunityChannel, body: string) => {
    if (!client || !profileId) throw new Error("Las conversaciones requieren una conexión activa.");
    const normalizedBody = body.trim();
    if (!normalizedBody || normalizedBody.length > 1000) throw new Error("Escribe un mensaje de hasta 1000 caracteres.");
    const { data, error: postError } = await client.rpc("post_community_message", {
      p_channel_type: channel.type,
      p_channel_key: channel.key,
      p_body: normalizedBody,
    });
    if (postError) throw postError;
    if (data) setMessages((current) => mergeCommunityMessage(current, data as CommunityMessage));
    await markRead(channel);
  }, [client, markRead, profileId]);

  const membershipChannels = useMemo(() => {
    if (!profileId || !profile) return [];
    const channels: CommunityChannel[] = [];
    if (profile.cohort) {
      channels.push({ type: "cohort", key: communityChannelKey("cohort", profile.cohort), label: profile.cohort });
    }
    profileHobbies(profile).forEach((hobby) => channels.push({
      type: "hobby",
      key: communityChannelKey("hobby", hobby),
      label: hobby,
    }));
    return channels;
  }, [profile, profileId]);

  const notifications = useMemo(() => {
    if (!profileId) return [];
    const memberships = new Map(membershipChannels.map((channel) => [communityChannelId(channel), channel]));
    const readTimes = new Map(reads.map((read) => [
      communityChannelId({ type: read.channel_type, key: read.channel_key }),
      read.last_read_at,
    ]));
    const grouped = new Map<string, CommunityNotification>();

    messages.forEach((message) => {
      if (message.author_profile_id === profileId) return;
      const id = communityChannelId({ type: message.channel_type, key: message.channel_key });
      const channel = memberships.get(id);
      if (!channel || message.created_at <= (readTimes.get(id) ?? "")) return;
      const current = grouped.get(id);
      grouped.set(id, {
        channel,
        count: (current?.count ?? 0) + 1,
        latest: !current || message.created_at > current.latest.created_at ? message : current.latest,
      });
    });

    return Array.from(grouped.values()).sort((first, second) => second.latest.created_at.localeCompare(first.latest.created_at));
  }, [membershipChannels, messages, profileId, reads]);

  return { messages, notifications, loading, error, markRead, postMessage, refresh };
}

export default function NexoApp({ config }: { config: NexoConfig }) {
  const authRedirectUrl = config.appUrl || "/";

  if (config.clerkPublishableKey) {
    return (
      <>
        <ClerkProvider
          publishableKey={config.clerkPublishableKey}
          signInForceRedirectUrl={authRedirectUrl}
          signUpForceRedirectUrl={authRedirectUrl}
          signInFallbackRedirectUrl={authRedirectUrl}
          signUpFallbackRedirectUrl={authRedirectUrl}
          afterSignOutUrl={authRedirectUrl}
          appearance={{
            variables: { colorPrimary: "#e36b52", colorText: "#182b3a", borderRadius: "0.65rem" },
          }}
        >
          <ClerkExperience config={config} />
        </ClerkProvider>
        <ValEasterEggAccess />
      </>
    );
  }

  return (
    <>
      <Landing action={<span className="member-access"><ShieldCheck size={16} /> Acceso para miembros</span>} />
      <ValEasterEggAccess />
    </>
  );
}

function ClerkExperience({ config }: { config: NexoConfig }) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn || !userId) {
    return (
      <Landing
        action={
          <AuthActions appUrl={config.appUrl || "/"} />
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
      onDeleteAccount={async () => {
        if (!user) throw new Error("No encontramos la cuenta activa.");
        await user.delete();
      }}
    />
  );
}

function AuthActions({ appUrl }: { appUrl: string }) {
  return (
    <div className="auth-actions">
      <SignUpButton
        mode="modal"
        oauthFlow="popup"
        forceRedirectUrl={appUrl}
        fallbackRedirectUrl={appUrl}
      >
        <button className="primary-button" type="button">
          Crear cuenta <ArrowRight size={17} />
        </button>
      </SignUpButton>
      <SignInButton
        mode="modal"
        oauthFlow="popup"
        forceRedirectUrl={appUrl}
        fallbackRedirectUrl={appUrl}
      >
        <button className="secondary-button" type="button">
          Iniciar sesión
        </button>
      </SignInButton>
    </div>
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
  const secretClicks = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSecretClick = () => {
    secretClicks.current += 1;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => { secretClicks.current = 0; }, 1800);
    if (secretClicks.current >= 5) {
      secretClicks.current = 0;
      revealValEasterEgg();
    }
  };

  return (
    <div className={`brand ${inverse ? "brand-inverse" : ""}`}>
      <button className="brand-mark brand-secret" type="button" onClick={handleSecretClick} aria-label="Logo de Nexo">N</button>
      <span>Nexo</span>
    </div>
  );
}

function Landing({ action }: { action: React.ReactNode }) {
  return (
    <main className="landing">
      <header className="landing-header">
        <Brand />
        <div className="landing-header-actions">
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
            <span className="preview-avatar preview-avatar-main"><CircleUserRound /></span>
            <div><strong>Tu perfil</strong><span>Tu historia</span></div>
          </div>
          <div className="preview-node node-top">
            <span className="preview-avatar"><Heart /></span>
            <div><strong>Tu nexo</strong><span>Quien te invitó</span></div>
          </div>
          <div className="preview-node node-right">
            <span className="preview-avatar"><Link2 /></span>
            <div><strong>Conexiones</strong><span>Personas que sumaste</span></div>
          </div>
          <div className="preview-node node-bottom">
            <span className="preview-avatar preview-avatar-small"><Users /></span>
            <div><strong>Comunidad</strong></div>
          </div>
          <div className="preview-label"><Users size={15} /> Historias que se conectan</div>
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
  onDeleteAccount,
}: {
  userId: string;
  userName: string;
  userImage?: string;
  getToken?: () => Promise<string | null>;
  config: NexoConfig;
  accountControl: React.ReactNode;
  onDeleteAccount?: () => Promise<void>;
}) {
  const { profiles, relationships, loading, error, live, client, saveProfile, saveConnection, saveRelationship, deleteProfile } = useProfiles(userId, config, getToken);
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [cohort, setCohort] = useState("Todas");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [addingConnection, setAddingConnection] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [activeCommunityChannel, setActiveCommunityChannel] = useState<CommunityChannel | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const saved = window.localStorage.getItem("nexo-theme");
      const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(saved === "dark" || saved === "light" ? saved : preferred);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const toggleTheme = () => setTheme((current) => {
    const next = current === "dark" ? "light" : "dark";
    window.localStorage.setItem("nexo-theme", next);
    return next;
  });
  const currentProfile = profiles.find((profile) => profile.clerk_user_id === userId);
  const community = useCommunityMessages(client, currentProfile);
  const displayProfile = currentProfile ?? {
    id: "",
    clerk_user_id: userId,
    full_name: userName,
    photo_url: userImage ?? null,
    photo_zoom: 1,
    photo_position_x: 50,
    photo_position_y: 50,
    gallery_urls: [],
    cover_url: null,
    cover_zoom: 1,
    cover_position_x: 50,
    cover_position_y: 50,
    bio: null,
    cohort: "",
    birth_date: null,
    city: null,
    country: null,
    profession: null,
    linkedin_url: null,
    instagram_url: null,
    phone: null,
    facebook_url: null,
    stretching: null,
    hobbies: null,
    hobbies_list: [],
    address: null,
    enrolled_by_id: null,
    created_at: "",
    updated_at: "",
  };

  const shouldOnboard = live && !loading && !currentProfile;
  const removeAccount = async () => {
    if (!onDeleteAccount) return;
    await deleteProfile();
    try {
      await onDeleteAccount();
    } catch (deleteError) {
      if (currentProfile) await saveProfile(currentProfile, currentProfile);
      throw deleteError;
    }
  };

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
    if (next === "connections") setSidebarCollapsed(true);
    if (next === "profile") setSelected(null);
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
    <div className={`workspace theme-${theme} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`} style={{ colorScheme: theme }}>
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
        <div className="sidebar-footer">
          <span className="sidebar-status"><span className={`status-dot ${live ? "status-live" : ""}`} />{live ? "Conectado" : "Sin conexión"}</span>
          <button className="app-version" type="button" onClick={revealValEasterEgg} aria-label="Créditos de Nexo" title="Créditos">v{APP_VERSION}</button>
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
          </label>
          <div className="topbar-actions">
            <CommunityNotificationCenter notifications={community.notifications} profiles={profiles} onOpen={setActiveCommunityChannel} />
            <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Usar modo claro" : "Usar modo oscuro"} title={theme === "dark" ? "Modo claro" : "Modo oscuro"}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
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
              relationships={relationships}
              loading={loading}
              onOpen={setSelected}
              onDirectory={() => setView("directory")}
              onConnections={() => navigate("connections")}
            />
          )}
          {view === "directory" && (
            <Directory profiles={filtered} cohorts={cohorts} cohort={cohort} query={query} onQuery={setQuery} onCohort={setCohort} onOpen={setSelected} />
          )}
          {view === "connections" && <Connections profile={displayProfile} profiles={profiles} relationships={relationships} onOpen={setSelected} onOpenChannel={setActiveCommunityChannel} onAdd={() => setAddingConnection(true)} />}
          {view === "profile" && (
            <MyProfile profile={displayProfile} profiles={profiles} relationships={relationships} onEdit={() => setEditing(true)} onOpen={setSelected} onDeleteRequest={onDeleteAccount ? () => setDeletingAccount(true) : undefined} />
          )}
        </main>
      </div>

      {selected && (
        <ProfilePanel
          profile={selected}
          profiles={profiles}
          relationships={relationships}
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
      {addingConnection && (
        <ConnectionEditor
          profile={displayProfile}
          profiles={profiles}
          onClose={() => setAddingConnection(false)}
          onSave={async (personId, connectionType, customLabel) => {
            if (connectionType === "i_enrolled" || connectionType === "enrolled_me") {
              const enrollerId = connectionType === "i_enrolled" ? displayProfile.id : personId;
              const enrolleeId = connectionType === "i_enrolled" ? personId : displayProfile.id;
              await saveConnection(enrollerId, enrolleeId);
            } else {
              await saveRelationship(displayProfile.id, personId, connectionType, customLabel);
            }
            setAddingConnection(false);
          }}
        />
      )}
      {activeCommunityChannel && (
        <CommunityChatDialog
          channel={activeCommunityChannel}
          profile={displayProfile}
          profiles={profiles}
          messages={community.messages}
          loading={community.loading}
          error={community.error}
          onClose={() => setActiveCommunityChannel(null)}
          onRead={community.markRead}
          onSend={community.postMessage}
        />
      )}
      {deletingAccount && <AccountDeletionDialog onClose={() => setDeletingAccount(false)} onConfirm={removeAccount} />}
    </div>
  );
}

function formatCommunityTime(value: string, detailed = false) {
  return new Intl.DateTimeFormat("es-PE", detailed
    ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
    : { hour: "2-digit", minute: "2-digit" }
  ).format(new Date(value));
}

function CommunityNotificationCenter({ notifications, profiles, onOpen }: {
  notifications: CommunityNotification[];
  profiles: Profile[];
  onOpen: (channel: CommunityChannel) => void;
}) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.reduce((total, notification) => total + notification.count, 0);
  const profileById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);

  return (
    <div className="community-notifications">
      <button
        className={`notification-button ${unreadCount ? "has-unread" : ""}`}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={unreadCount ? `${unreadCount} mensajes nuevos` : "Notificaciones de conversaciones"}
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && <span>{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="notification-popover">
          <header><div><span>CONVERSACIONES</span><strong>Mensajes nuevos</strong></div><Bell size={18} /></header>
          {notifications.length ? (
            <div className="notification-list">
              {notifications.map((notification) => {
                const author = profileById.get(notification.latest.author_profile_id);
                return (
                  <button
                    type="button"
                    key={communityChannelId(notification.channel)}
                    onClick={() => { setOpen(false); onOpen(notification.channel); }}
                  >
                    <span className={`notification-channel-icon is-${notification.channel.type}`}><MessageCircle size={15} /></span>
                    <span><strong>{notification.channel.label}</strong><small>{author ? firstName(author.full_name) : "Alguien"}: {notification.latest.body}</small></span>
                    <i>{notification.count}</i>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="notification-empty"><Check size={18} /><span>Estás al día</span><small>Te avisaremos cuando escriban en tu Lima o tus hobbies.</small></div>
          )}
        </div>
      )}
    </div>
  );
}

function CommunityChatDialog({ channel, profile, profiles, messages, loading, error, onClose, onRead, onSend }: {
  channel: CommunityChannel;
  profile: Profile;
  profiles: Profile[];
  messages: CommunityMessage[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRead: (channel: CommunityChannel) => Promise<void>;
  onSend: (channel: CommunityChannel, body: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const profileById = useMemo(() => new Map(profiles.map((person) => [person.id, person])), [profiles]);
  const channelMessages = useMemo(() => messages.filter((message) => (
    message.channel_type === channel.type && message.channel_key === channel.key
  )), [channel.key, channel.type, messages]);
  const latestMessageId = channelMessages.at(-1)?.id;

  useEffect(() => {
    void onRead(channel);
  }, [channel, latestMessageId, onRead]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const list = messageListRef.current;
      if (list) list.scrollTop = list.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [channelMessages.length]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    setSendError(null);
    try {
      await onSend(channel, draft);
      setDraft("");
    } catch {
      setSendError("No pudimos enviar el mensaje. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="community-chat-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="community-chat-dialog" role="dialog" aria-modal="true" aria-labelledby="community-chat-title">
        <header>
          <span className={`community-chat-hero-icon is-${channel.type}`}><MessageCircle /></span>
          <div><span>{channel.type === "cohort" ? "CHAT DE PROMOCIÓN" : "CHAT DE HOBBY"}</span><h2 id="community-chat-title">{channel.label}</h2><p>{channel.memberCount ? `${channel.memberCount} ${channel.memberCount === 1 ? "persona" : "personas"} en este círculo` : "Conversación de tu comunidad"}</p></div>
          <button className="community-chat-close" type="button" onClick={onClose} aria-label="Cerrar conversación"><X /></button>
        </header>

        <div className="community-message-list" ref={messageListRef} aria-live="polite">
          {loading && !channelMessages.length && <div className="community-chat-status"><span className="loading-pulse" /> Cargando conversación…</div>}
          {!loading && !channelMessages.length && !error && <div className="community-chat-empty"><MessageCircle size={28} /><strong>Inicia la conversación</strong><span>Sé la primera persona en dejar un mensaje para {channel.label}.</span></div>}
          {error && <div className="community-chat-error">{error}</div>}
          {channelMessages.map((message) => {
            const author = profileById.get(message.author_profile_id);
            const own = message.author_profile_id === profile.id;
            return (
              <article className={`community-message ${own ? "is-own" : ""}`} key={message.id}>
                {!own && (author ? <Avatar profile={author} size="small" /> : <span className="community-message-fallback"><Users size={14} /></span>)}
                <div><span><strong>{own ? "Tú" : author?.full_name ?? "Miembro de Nexo"}</strong><time dateTime={message.created_at}>{formatCommunityTime(message.created_at)}</time></span><p>{message.body}</p></div>
              </article>
            );
          })}
        </div>

        <form className="community-chat-composer" onSubmit={submit}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 1000))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder={`Escribe en ${channel.label}…`}
            aria-label={`Mensaje para ${channel.label}`}
            rows={2}
            disabled={sending || Boolean(error)}
          />
          <button type="submit" disabled={sending || !draft.trim() || Boolean(error)} aria-label="Enviar mensaje"><Send size={17} /></button>
          <small>{sendError ?? `${draft.length}/1000 · Enter para enviar`}</small>
        </form>
      </section>
    </div>
  );
}

function ValEasterEggAccess() {
  return (
    <>
      <button className="val-mini-button" type="button" onClick={revealValEasterEgg} aria-label="Abrir mensaje secreto de Val" title="Un detalle de Val">
        <Heart size={14} fill="currentColor" />
      </button>
      <ValEasterEgg />
    </>
  );
}

function ValEasterEgg() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reveal = () => setOpen(true);
    window.addEventListener(EASTER_EGG_EVENT, reveal);
    return () => window.removeEventListener(EASTER_EGG_EVENT, reveal);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  if (!open) return null;

  return (
    <div className="val-easter-egg" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setOpen(false);
    }}>
      <div className="val-confetti" aria-hidden="true">
        {valParticles.map((particle) => (
          <span
            key={particle.id}
            className={particle.id % 3 === 0 ? "val-particle val-particle-heart" : "val-particle"}
            style={{
              "--particle-left": particle.left,
              "--particle-delay": particle.delay,
              "--particle-duration": particle.duration,
              "--particle-drift": particle.drift,
              "--particle-size": particle.size,
            } as CSSProperties}
          >{particle.id % 3 === 0 ? "♥" : "✦"}</span>
        ))}
      </div>
      <section className="val-card" role="dialog" aria-labelledby="val-easter-egg-title">
        <button className="val-close" type="button" onClick={() => setOpen(false)} aria-label="Cerrar mensaje de Val"><X size={19} /></button>
        <div className="val-portrait-wrap">
          <span className="val-orbit val-orbit-one" aria-hidden="true"><Heart /></span>
          <span className="val-orbit val-orbit-two" aria-hidden="true"><Sparkles /></span>
          {/* This is Val's illustration, supplied for the hidden creator credit. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="./val-easter-egg.jpeg" alt="Ilustración de Val haciendo el gesto de aprobación" />
        </div>
        <div className="val-message">
          <span className="val-kicker"><Sparkles size={14} /> Encontraste un pedacito secreto</span>
          <h2 id="val-easter-egg-title">Hecho con cariño para acompañarte en tu camino. <em>— Val</em></h2>
          <p>Cada conexión, detalle y color fue pensado para acercarnos un poquito más.</p>
          <span className="val-signature">Hecho con <Heart size={15} fill="currentColor" /> para esta comunidad</span>
        </div>
      </section>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return <button className={active ? "active" : ""} onClick={onClick} type="button">{icon}<span>{label}</span></button>;
}

function Dashboard({ profile, profiles, relationships, loading, onOpen, onDirectory, onConnections }: {
  profile: Profile;
  profiles: Profile[];
  relationships: ProfileRelationship[];
  loading: boolean;
  onOpen: (profile: Profile) => void;
  onDirectory: () => void;
  onConnections: () => void;
}) {
  const enrolled = profiles.filter((candidate) => candidate.enrolled_by_id === profile.id);
  const mentor = profiles.find((candidate) => candidate.id === profile.enrolled_by_id);
  const personalRelationships = relationshipsForProfile(profile.id, profiles, relationships);
  const connectedPeople = new Set([
    ...personalRelationships.map((relationship) => relationship.profile.id),
    ...enrolled.map((person) => person.id),
    ...(mentor ? [mentor.id] : []),
  ]);
  const recent = profiles.filter((candidate) => candidate.id !== profile.id).slice(0, 4);
  const now = new Date();
  const profilesThisMonth = profiles.filter((candidate) => {
    const createdAt = new Date(candidate.created_at);
    return createdAt.getUTCFullYear() === now.getUTCFullYear() && createdAt.getUTCMonth() === now.getUTCMonth();
  }).length;
  const cohortNumbers = profiles
    .map((candidate) => Number(candidate.cohort.match(/(\d+)\s*$/)?.[1]))
    .filter(Number.isFinite);
  const cohortRange = cohortNumbers.length
    ? Math.min(...cohortNumbers) === Math.max(...cohortNumbers)
      ? `Lima ${Math.min(...cohortNumbers)}`
      : `Lima ${Math.min(...cohortNumbers)} — Lima ${Math.max(...cohortNumbers)}`
    : "Sin promociones";

  return (
    <div className="dashboard page-enter">
      <div className="welcome-row">
        <div><span className="page-kicker">Sábado, 8 de agosto</span><h1>Hola, {firstName(profile.full_name)} <span>✦</span></h1><p>Hay nuevas historias esperando ser descubiertas en tu comunidad.</p></div>
        <button className="secondary-button" type="button" onClick={onDirectory}>Explorar directorio <ArrowUpRight size={17} /></button>
      </div>

      <section className="stats-grid">
        <article className="stat-card stat-primary"><div className="stat-icon"><Users /></div><span>Personas en la red</span><strong>{loading ? "—" : profiles.length}</strong><small><b>+{profilesThisMonth}</b> este mes</small><div className="stat-decoration">N</div></article>
        <article className="stat-card"><div className="stat-icon coral"><Network /></div><span>Tus conexiones</span><strong>{connectedPeople.size}</strong><small>{personalRelationships.length} relaciones personales</small></article>
        <article className="stat-card"><div className="stat-icon sage"><BookOpen /></div><span>Promociones</span><strong>{new Set(profiles.map((item) => item.cohort)).size}</strong><small>{cohortRange}</small></article>
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

type NetworkRelation = "self" | "mentor" | "child" | "sibling" | "grandchild" | "related";

type NetworkPoint = {
  profile: Profile;
  relation: NetworkRelation;
  x: number;
  y: number;
  delay: number;
  label?: string;
};

type NetworkEdge = {
  from: NetworkPoint;
  to: NetworkPoint;
  tone: "primary" | "secondary";
};

type CommunityChannelType = "cohort" | "hobby";

type CommunityChannel = {
  type: CommunityChannelType;
  key: string;
  label: string;
  memberCount?: number;
};

type CommunityMessage = {
  id: string;
  channel_type: CommunityChannelType;
  channel_key: string;
  author_profile_id: string;
  body: string;
  created_at: string;
};

type CommunityChannelRead = {
  profile_id: string;
  channel_type: CommunityChannelType;
  channel_key: string;
  last_read_at: string;
};

type CommunityNotification = {
  channel: CommunityChannel;
  count: number;
  latest: CommunityMessage;
};

function networkRelationLabel(relation: NetworkRelation) {
  const labels: Record<NetworkRelation, string> = {
    self: "TÚ",
    mentor: "TE ENROLÓ",
    child: "ENROLADO POR TI",
    sibling: "MISMA RAMA",
    grandchild: "SIGUIENTE GENERACIÓN",
    related: "RELACIÓN",
  };
  return labels[relation];
}

function profilePairKey(firstId: string, secondId: string) {
  return [firstId, secondId].sort().join(":");
}

function buildLivingNetwork(profile: Profile, profiles: Profile[], relationships: ProfileRelationship[]) {
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

  const relationshipPositions = [
    { x: -500, y: -260 },
    { x: 500, y: -260 },
    { x: -560, y: 30 },
    { x: 560, y: 30 },
    { x: -510, y: 350 },
    { x: 510, y: 350 },
  ];
  const personalRelationships = relationshipsForProfile(profile.id, profiles, relationships);
  const edgeKeys = new Set(edges.map((edge) => profilePairKey(edge.from.profile.id, edge.to.profile.id)));
  let newRelationshipIndex = 0;
  personalRelationships.forEach((relationship) => {
    const existingPoint = points.find((point) => point.profile.id === relationship.profile.id);
    if (existingPoint) {
      const baseLabel = existingPoint.label ?? networkRelationLabel(existingPoint.relation);
      if (!baseLabel.toLocaleLowerCase("es").includes(relationship.label.toLocaleLowerCase("es"))) {
        existingPoint.label = `${baseLabel} · ${relationship.label}`;
      }
      const key = profilePairKey(profile.id, relationship.profile.id);
      if (!edgeKeys.has(key)) {
        edges.push({ from: points[0], to: existingPoint, tone: "secondary" });
        edgeKeys.add(key);
      }
      return;
    }

    const position = relationshipPositions[newRelationshipIndex];
    if (!position) return;
    const point: NetworkPoint = {
      profile: relationship.profile,
      relation: "related",
      label: relationship.label,
      x: position.x,
      y: position.y,
      delay: newRelationshipIndex + 7,
    };
    points.push(point);
    edges.push({ from: points[0], to: point, tone: "secondary" });
    edgeKeys.add(profilePairKey(profile.id, relationship.profile.id));
    newRelationshipIndex += 1;
  });

  return { points, edges, mentor, directChildren, personalRelationships };
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
      <span className="living-node-relation">{point.label?.toUpperCase() || networkRelationLabel(point.relation)}</span>
      <strong>{point.profile.full_name}</strong>
      <small>{point.profile.profession ?? point.profile.cohort}</small>
      <span className="living-node-cohort">{point.profile.cohort}</span>
    </button>
  );
}

type CohortGroup = {
  cohort: string;
  members: Profile[];
  color: string;
};

type CohortConnectionLayout = {
  id: string;
  d: string;
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  fromCohort: string;
  toCohort: string;
  kind: "enrollment" | "relationship";
  label: string;
};

type ProfileConnectionPair = {
  id: string;
  fromId: string;
  toId: string;
  kind: "enrollment" | "relationship";
  label: string;
};

type CohortFocusTarget = {
  x: number;
  y: number;
  width: number;
  worldTop: number;
};

type CohortMemberPosition = {
  column: number;
  row: number;
};

type ElementBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function getElementBox(element: HTMLElement, ancestor: HTMLElement): ElementBox | null {
  let x = 0;
  let y = 0;
  let current: HTMLElement | null = element;

  while (current && current !== ancestor) {
    x += current.offsetLeft;
    y += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  if (current !== ancestor) return null;
  return { x, y, width: element.offsetWidth, height: element.offsetHeight };
}

function buildAlternatingMemberPositions(memberCount: number): CohortMemberPosition[] {
  const totalColumns = 26;
  const positions: CohortMemberPosition[] = [];
  let memberIndex = 0;
  let rowIndex = 0;

  while (memberIndex < memberCount) {
    const rowCapacity = rowIndex % 2 === 0 ? 12 : 13;
    const membersInRow = Math.min(rowCapacity, memberCount - memberIndex);
    const firstColumn = (totalColumns - membersInRow * 2) / 2 + 1;

    for (let columnIndex = 0; columnIndex < membersInRow; columnIndex += 1) {
      positions.push({
        column: firstColumn + columnIndex * 2,
        row: rowIndex + 1,
      });
    }

    memberIndex += membersInRow;
    rowIndex += 1;
  }

  return positions;
}

function buildCohortGroups(profiles: Profile[]): CohortGroup[] {
  const colors = ["#ef745b", "#e8a65b", "#a4bb91", "#72a9a1", "#7095bd", "#9b86bd", "#c67f9f", "#db8a70"];
  const grouped = new Map<string, Profile[]>();
  profiles.forEach((person) => grouped.set(person.cohort, [...(grouped.get(person.cohort) ?? []), person]));
  const cohortNumber = (value: string) => Number(value.match(/(\d+)\s*$/)?.[1] ?? 0);

  return Array.from(grouped.entries())
    .sort(([a], [b]) => cohortNumber(b) - cohortNumber(a) || b.localeCompare(a))
    .map(([cohort, members], index) => ({
      cohort,
      members,
      color: colors[index % colors.length],
    }));
}

function buildHobbyGroups(profiles: Profile[], allowedHobbies?: readonly string[]): CohortGroup[] {
  const colors = ["#ef745b", "#e8a65b", "#a4bb91", "#72a9a1", "#7095bd", "#9b86bd", "#c67f9f", "#db8a70"];
  const grouped = new Map<string, Profile[]>();
  const allowedKeys = allowedHobbies ? new Set(allowedHobbies.map((hobby) => hobby.toLocaleLowerCase("es"))) : null;
  profiles.forEach((person) => {
    profileHobbies(person).forEach((hobby) => {
      if (allowedKeys && !allowedKeys.has(hobby.toLocaleLowerCase("es"))) return;
      grouped.set(hobby, [...(grouped.get(hobby) ?? []), person]);
    });
  });
  return Array.from(grouped.entries())
    .sort(([firstHobby, firstMembers], [secondHobby, secondMembers]) => secondMembers.length - firstMembers.length || firstHobby.localeCompare(secondHobby, "es"))
    .map(([cohort, members], index) => ({ cohort, members, color: colors[index % colors.length] }));
}

function buildProfileConnectionPairs(profiles: Profile[], relationships: ProfileRelationship[]) {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const pairs = new Map<string, ProfileConnectionPair>();

  profiles.forEach((person) => {
    if (!person.enrolled_by_id) return;
    const enroller = profileById.get(person.enrolled_by_id);
    if (!enroller) return;
    const id = profilePairKey(enroller.id, person.id);
    pairs.set(id, {
      id,
      fromId: enroller.id,
      toId: person.id,
      kind: "enrollment",
      label: `${enroller.full_name} enroló a ${person.full_name}`,
    });
  });

  relationships.forEach((relationship) => {
    const from = profileById.get(relationship.profile_id);
    const to = profileById.get(relationship.related_profile_id);
    if (!from || !to) return;
    const id = profilePairKey(from.id, to.id);
    const label = relationshipLabel(relationship, false);
    const existing = pairs.get(id);
    if (existing) {
      if (!existing.label.toLocaleLowerCase("es").includes(label.toLocaleLowerCase("es"))) existing.label = `${existing.label} · ${label}`;
      return;
    }
    pairs.set(id, {
      id,
      fromId: from.id,
      toId: to.id,
      kind: "relationship",
      label: `${from.full_name} y ${to.full_name}: ${label}`,
    });
  });

  return Array.from(pairs.values());
}

function CohortGalaxy({
  profiles,
  relationships,
  groupMode,
  selectedCohort,
  onSelectCohort,
  onCenterCohort,
  onOpenChannel,
  onOpen,
  hobbyFilter,
  emptyTitle,
  emptyCopy,
}: {
  profiles: Profile[];
  relationships: ProfileRelationship[];
  groupMode: "cohorts" | "hobbies";
  selectedCohort: string | null;
  onSelectCohort: (cohort: string | null) => void;
  onCenterCohort: (target: CohortFocusTarget) => void;
  onOpenChannel: (channel: CommunityChannel) => void;
  onOpen: (profile: Profile) => void;
  hobbyFilter?: string[];
  emptyTitle?: string;
  emptyCopy?: string;
}) {
  const groups = useMemo(() => groupMode === "cohorts" ? buildCohortGroups(profiles) : buildHobbyGroups(profiles, hobbyFilter), [groupMode, hobbyFilter, profiles]);
  const profileById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);
  const connectionPairs = useMemo(() => buildProfileConnectionPairs(profiles, relationships), [profiles, relationships]);
  const [cohortQuery, setCohortQuery] = useState("");
  const [hoveredProfileId, setHoveredProfileId] = useState<string | null>(null);
  const [connectionLayout, setConnectionLayout] = useState<{ width: number; height: number; edges: CohortConnectionLayout[] }>({ width: 0, height: 0, edges: [] });
  const stackRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const memberRefs = useRef(new Map<string, HTMLButtonElement>());
  const didCenterLatest = useRef(false);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    let frame = 0;
    const measureConnections = () => {
      const edges: CohortConnectionLayout[] = [];

      if (groupMode === "hobbies") {
        setConnectionLayout({ width: stack.scrollWidth, height: stack.scrollHeight, edges });
        return;
      }

      connectionPairs.forEach((connection) => {
        const fromProfile = profileById.get(connection.fromId);
        const toProfile = profileById.get(connection.toId);
        const fromNode = memberRefs.current.get(connection.fromId);
        const toNode = memberRefs.current.get(connection.toId);
        if (!fromProfile || !toProfile || !fromNode || !toNode) return;

        const fromAvatar = fromNode.querySelector<HTMLElement>(".avatar") ?? fromNode;
        const toAvatar = toNode.querySelector<HTMLElement>(".avatar") ?? toNode;
        const from = getElementBox(fromAvatar, stack);
        const to = getElementBox(toAvatar, stack);
        if (!from || !to) return;

        const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
        const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
        const deltaX = toCenter.x - fromCenter.x;
        const deltaY = toCenter.y - fromCenter.y;
        const distance = Math.max(1, Math.hypot(deltaX, deltaY));
        const unitX = deltaX / distance;
        const unitY = deltaY / distance;
        const fromRadius = Math.min(from.width, from.height) / 2 + 3;
        const toRadius = Math.min(to.width, to.height) / 2 + 5;
        const start = { x: fromCenter.x + unitX * fromRadius, y: fromCenter.y + unitY * fromRadius };
        const end = { x: toCenter.x - unitX * toRadius, y: toCenter.y - unitY * toRadius };
        const mostlyVertical = Math.abs(toCenter.y - fromCenter.y) >= 80;
        let d: string;

        if (mostlyVertical) {
          const midY = (start.y + end.y) / 2;
          d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${start.x.toFixed(1)} ${midY.toFixed(1)}, ${end.x.toFixed(1)} ${midY.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
        } else {
          const controlY = Math.min(start.y, end.y) - Math.max(28, Math.abs(end.x - start.x) * 0.12);
          d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${(start.x + (end.x - start.x) * 0.28).toFixed(1)} ${controlY.toFixed(1)}, ${(end.x - (end.x - start.x) * 0.28).toFixed(1)} ${controlY.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
        }

        edges.push({
          id: connection.id,
          d,
          fromId: fromProfile.id,
          toId: toProfile.id,
          fromName: fromProfile.full_name,
          toName: toProfile.full_name,
          fromCohort: fromProfile.cohort,
          toCohort: toProfile.cohort,
          kind: connection.kind,
          label: connection.label,
        });
      });

      setConnectionLayout({ width: stack.scrollWidth, height: stack.scrollHeight, edges });
    };
    const scheduleMeasurement = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measureConnections);
    };
    const observer = new ResizeObserver(scheduleMeasurement);
    observer.observe(stack);
    window.addEventListener("resize", scheduleMeasurement);
    scheduleMeasurement();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasurement);
    };
  }, [connectionPairs, groupMode, profileById]);

  const relatedProfileIds = useMemo(() => {
    const ids = new Set<string>();
    if (!hoveredProfileId) return ids;
    ids.add(hoveredProfileId);
    profiles.forEach((person) => {
      if (person.enrolled_by_id === hoveredProfileId) ids.add(person.id);
      if (person.id === hoveredProfileId && person.enrolled_by_id) ids.add(person.enrolled_by_id);
    });
    relationships.forEach((relationship) => {
      if (relationship.profile_id === hoveredProfileId) ids.add(relationship.related_profile_id);
      if (relationship.related_profile_id === hoveredProfileId) ids.add(relationship.profile_id);
    });
    return ids;
  }, [hoveredProfileId, profiles, relationships]);

  const centerCohort = useCallback((group: CohortGroup) => {
    const section = sectionRefs.current.get(group.cohort);
    const stack = stackRef.current;
    const world = worldRef.current;
    if (!section || !stack || !world) return false;
    onCenterCohort({
      x: section.offsetLeft + section.offsetWidth / 2,
      y: section.offsetTop + section.offsetHeight / 2,
      width: stack.offsetWidth,
      worldTop: world.offsetTop,
    });
    return true;
  }, [onCenterCohort]);

  useEffect(() => {
    if (didCenterLatest.current || !groups[0]) return;
    const frame = requestAnimationFrame(() => {
      if (centerCohort(groups[0])) didCenterLatest.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [centerCohort, groups]);

  const focusCohort = (group: CohortGroup) => {
    onSelectCohort(group.cohort);
    centerCohort(group);
  };
  const searchCohort = (event: FormEvent) => {
    event.preventDefault();
    const query = cohortQuery.trim().toLowerCase();
    if (!query) return;
    const normalized = groupMode === "cohorts" ? normalizeCohort(cohortQuery).toLowerCase() : query;
    const match = groups.find((group) => group.cohort.toLowerCase() === normalized)
      ?? groups.find((group) => group.cohort.toLowerCase().includes(query));
    if (match) {
      setCohortQuery(match.cohort);
      focusCohort(match);
    }
  };

  return (
    <div className="cohort-stack-shell">
      <form className="cohort-search" onSubmit={searchCohort}>
        <label><Search size={15} /><input aria-label={groupMode === "cohorts" ? "Buscar promoción Lima" : "Buscar hobby"} list={`${groupMode}-options`} value={cohortQuery} onChange={(event) => setCohortQuery(event.target.value)} placeholder={groupMode === "cohorts" ? "Buscar tu Lima…" : "Buscar un hobby…"} /></label>
        <datalist id={`${groupMode}-options`}>{groups.map((group) => <option key={group.cohort} value={group.cohort} />)}</datalist>
        <button type="submit"><LocateFixed size={15} /> Centrar</button>
      </form>
      <div
        className="cohort-stack-scroll"
        ref={worldRef}
      >
        <div className="cohort-stack" ref={stackRef}>
          {groupMode === "cohorts" && connectionLayout.width > 0 && <svg className="cohort-connection-layer" width={connectionLayout.width} height={connectionLayout.height} viewBox={`0 0 ${connectionLayout.width} ${connectionLayout.height}`} aria-hidden="true">
            <defs>
              <marker id="cohort-arrow-direct" markerHeight="7" markerWidth="7" orient="auto" refX="6" refY="3.5"><path d="M0,0 L7,3.5 L0,7 Z" /></marker>
            </defs>
            {connectionLayout.edges.map((edge) => {
              const hoverActive = hoveredProfileId === edge.fromId || hoveredProfileId === edge.toId;
              const cohortActive = selectedCohort === null || selectedCohort === edge.fromCohort || selectedCohort === edge.toCohort;
              const dimmed = (hoveredProfileId !== null && !hoverActive) || !cohortActive;
              return <path key={edge.id} className={`cohort-connection is-${edge.kind} ${hoverActive ? "is-active" : ""} ${dimmed ? "is-dimmed" : ""}`} d={edge.d} markerEnd={edge.kind === "enrollment" ? "url(#cohort-arrow-direct)" : undefined}><title>{edge.label}</title></path>;
            })}
          </svg>}
          {groups.map((group, groupIndex) => {
            const selected = selectedCohort === group.cohort;
            const dimmed = selectedCohort !== null && !selected;
            const memberPositions = buildAlternatingMemberPositions(group.members.length);
            return (
              <section
                key={group.cohort}
                ref={(node) => { if (node) sectionRefs.current.set(group.cohort, node); else sectionRefs.current.delete(group.cohort); }}
                className={`cohort-stack-section ${selected ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""}`}
                style={{ "--cluster-color": group.color, "--cluster-delay": `${groupIndex * 70}ms` } as CSSProperties}
                aria-label={`${group.cohort}, ${group.members.length} personas`}
              >
                {groupIndex === 0 && <span className="cohort-latest-badge"><Sparkles size={12} /> {groupMode === "cohorts" ? "Lima más actual" : "Hobby más compartido"}</span>}
                <button
                  className={`cohort-stack-center ${groupMode === "hobbies" ? "is-hobby" : ""}`}
                  type="button"
                  onClick={() => {
                    onSelectCohort(group.cohort);
                    onOpenChannel({
                      type: groupMode === "cohorts" ? "cohort" : "hobby",
                      key: communityChannelKey(groupMode === "cohorts" ? "cohort" : "hobby", group.cohort),
                      label: group.cohort,
                      memberCount: group.members.length,
                    });
                  }}
                  aria-label={`Abrir conversación de ${group.cohort}`}
                >
                  <span className="cohort-chat-badge"><MessageCircle size={13} /></span>
                  <span>{groupMode === "cohorts" ? "Promoción" : "Hobby"}</span>
                  <strong>{group.cohort}</strong>
                  <small>{group.members.length} {group.members.length === 1 ? "persona" : "personas"}</small>
                  <span className="cohort-chat-label">Abrir chat</span>
                </button>
                <div className="cohort-members-grid">
                  {group.members.map((member, memberIndex) => (
                    <button
                      className={`cohort-stack-member ${hoveredProfileId === member.id ? "is-active" : ""} ${relatedProfileIds.has(member.id) && hoveredProfileId !== member.id ? "is-connected" : ""}`}
                      key={member.id}
                      ref={(node) => { if (node) memberRefs.current.set(member.id, node); else memberRefs.current.delete(member.id); }}
                      style={{
                        "--member-column": memberPositions[memberIndex].column,
                        "--member-delay": `${groupIndex * -0.35 - memberIndex * 0.08}s`,
                        "--member-row": memberPositions[memberIndex].row,
                      } as CSSProperties}
                      type="button"
                      title={groupMode === "hobbies" ? `${member.full_name} · ${group.cohort}` : member.enrolled_by_id && profileById.get(member.enrolled_by_id) ? `${profileById.get(member.enrolled_by_id)?.full_name} enroló a ${member.full_name}` : `${member.full_name} · inicio de esta rama`}
                      onMouseEnter={() => setHoveredProfileId(member.id)}
                      onMouseLeave={() => setHoveredProfileId(null)}
                      onFocus={() => setHoveredProfileId(member.id)}
                      onBlur={() => setHoveredProfileId(null)}
                      onClick={() => onOpen(member)}
                    >
                      <Avatar profile={member} size="small" />
                      <span>{firstName(member.full_name)}</span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
          {!groups.length && <div className="hobby-empty-state"><Heart size={24} /><strong>{emptyTitle ?? "Aún no hay hobbies para agrupar"}</strong><span>{emptyCopy ?? "Agrega intereses desde tu perfil y aparecerán aquí."}</span></div>}
        </div>
      </div>
    </div>
  );
}

function Connections({ profile, profiles, relationships, onOpen, onOpenChannel, onAdd }: { profile: Profile; profiles: Profile[]; relationships: ProfileRelationship[]; onOpen: (profile: Profile) => void; onOpenChannel: (channel: CommunityChannel) => void; onAdd: () => void }) {
  const network = useMemo(() => buildLivingNetwork(profile, profiles, relationships), [profile, profiles, relationships]);
  const cohortGroups = useMemo(() => buildCohortGroups(profiles), [profiles]);
  const hobbyGroups = useMemo(() => buildHobbyGroups(profiles), [profiles]);
  const myHobbies = useMemo(() => profileHobbies(profile), [profile]);
  const sharedHobbyProfiles = useMemo(() => {
    const myHobbyKeys = new Set(myHobbies.map((hobby) => hobby.toLocaleLowerCase("es")));
    return profiles.filter((person) => person.id !== profile.id && profileHobbies(person).some((hobby) => myHobbyKeys.has(hobby.toLocaleLowerCase("es"))));
  }, [myHobbies, profile.id, profiles]);
  const [networkMode, setNetworkMode] = useState<"lineage" | "cohorts" | "hobbies" | "my_hobbies">("cohorts");
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.82);
  const [pan, setPan] = useState({ x: 0, y: 35 });
  const [dragging, setDragging] = useState(false);
  const [mapMoving, setMapMoving] = useState(false);
  const canvasRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  const panFrameRef = useRef(0);
  const motionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyPan = useCallback((nextPan: { x: number; y: number }) => {
    panRef.current = nextPan;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.setProperty("--network-pan-x", `${nextPan.x}px`);
    canvas.style.setProperty("--network-pan-y", `${nextPan.y}px`);
  }, []);
  const commitPan = useCallback((nextPan: { x: number; y: number }) => {
    applyPan(nextPan);
    setPan(nextPan);
  }, [applyPan]);
  const beginTransientMotion = useCallback(() => {
    setMapMoving(true);
    if (motionTimerRef.current) clearTimeout(motionTimerRef.current);
    motionTimerRef.current = setTimeout(() => {
      motionTimerRef.current = null;
      setMapMoving(false);
    }, 160);
  }, []);

  useEffect(() => () => {
    cancelAnimationFrame(panFrameRef.current);
    if (motionTimerRef.current) clearTimeout(motionTimerRef.current);
  }, []);

  const resetView = () => {
    zoomRef.current = 0.82;
    setZoom(0.82);
    commitPan({ x: 0, y: 35 });
    beginTransientMotion();
  };
  const changeMode = (mode: "lineage" | "cohorts" | "hobbies" | "my_hobbies") => {
    setNetworkMode(mode);
    setSelectedCohort(null);
    resetView();
  };
  const adjustZoom = (amount: number) => {
    const nextZoom = Math.min(1.6, Math.max(0.4, zoomRef.current + amount));
    zoomRef.current = nextZoom;
    setZoom(nextZoom);
    beginTransientMotion();
  };
  const centerCohort = useCallback((target: CohortFocusTarget) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const compactCohortView = window.matchMedia("(max-width: 820px)").matches;
    const focusY = compactCohortView ? Math.min(220, canvas.clientHeight * 0.28) : canvas.clientHeight / 2;
    commitPan({
      x: -zoomRef.current * (target.x - target.width / 2),
      y: focusY - target.worldTop - zoomRef.current * target.y,
    });
    beginTransientMotion();
  }, [beginTransientMotion, commitPan]);
  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest(".living-node, .cohort-stack-member, .cohort-stack-center, .cohort-search, .network-controls, .network-story-card, .network-mode-switch, .mobile-network-mode-switch, .add-connection-button, .mobile-add-connection-button")) return;
    dragRef.current = { x: event.clientX, y: event.clientY, panX: panRef.current.x, panY: panRef.current.y };
    if (motionTimerRef.current) clearTimeout(motionTimerRef.current);
    setDragging(true);
    setMapMoving(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragRef.current) return;
    const nextPan = {
      x: dragRef.current.panX + event.clientX - dragRef.current.x,
      y: dragRef.current.panY + event.clientY - dragRef.current.y,
    };
    panRef.current = nextPan;
    cancelAnimationFrame(panFrameRef.current);
    panFrameRef.current = requestAnimationFrame(() => applyPan(nextPan));
  };
  const endDrag = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    cancelAnimationFrame(panFrameRef.current);
    commitPan(panRef.current);
    setDragging(false);
    setMapMoving(false);
  };

  return (
    <div className="connections-page living-connections page-enter">
      <section
        ref={canvasRef}
        className={`living-canvas ${dragging ? "is-dragging" : ""} ${mapMoving ? "is-moving" : ""} ${profiles.length >= 40 ? "is-dense-network" : ""} ${networkMode !== "lineage" ? "is-cohort-mode" : ""}`}
        style={{
          "--network-pan-x": `${pan.x}px`,
          "--network-pan-y": `${pan.y}px`,
          "--network-scale": zoom,
        } as CSSProperties}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={(event) => {
          event.preventDefault();
          adjustZoom(event.deltaY > 0 ? -0.06 : 0.06);
        }}
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
            <p>{networkMode === "lineage" ? "Explora tus vínculos de familia, amistad, pareja y enrolamiento." : networkMode === "cohorts" ? "Cada pareja de personas tiene una sola línea; la flecha indica el enrolamiento." : networkMode === "my_hobbies" ? "Aquí solo aparecen personas con al menos un hobby en común contigo." : "Descubre personas por intereses compartidos y encuentra nuevos puntos en común."}</p>
            <div className="network-mode-switch" role="group" aria-label="Agrupar conexiones">
              <button type="button" className={networkMode === "lineage" ? "active" : ""} onClick={() => changeMode("lineage")}><Network size={14} /> Mis vínculos</button>
              <button type="button" className={networkMode === "cohorts" ? "active" : ""} onClick={() => changeMode("cohorts")}><Users size={14} /> Por promociones <span>{cohortGroups.length}</span></button>
              <button type="button" className={networkMode === "hobbies" ? "active" : ""} onClick={() => changeMode("hobbies")}><Heart size={14} /> Por hobbies <span>{hobbyGroups.length}</span></button>
              <button type="button" className={networkMode === "my_hobbies" ? "active" : ""} onClick={() => changeMode("my_hobbies")}><CircleUserRound size={14} /> Mis hobbies <span>{sharedHobbyProfiles.length}</span></button>
            </div>
            <button className="add-connection-button" type="button" onClick={onAdd}><Plus size={16} /> Agregar relación</button>
          </div>
          <div className="living-count"><strong>{networkMode === "lineage" ? network.points.length : networkMode === "cohorts" ? profiles.length : networkMode === "my_hobbies" ? sharedHobbyProfiles.length : hobbyGroups.length}</strong><span>{networkMode === "hobbies" ? "hobbies en" : "personas en"}<br />{networkMode === "lineage" ? "tus vínculos" : networkMode === "my_hobbies" ? "tus hobbies" : "la comunidad"}</span></div>
        </header>

        <div className="mobile-network-mode-switch" role="group" aria-label="Cambiar agrupación">
          <button type="button" className={networkMode === "lineage" ? "active" : ""} onClick={() => changeMode("lineage")} aria-label="Ver mis vínculos"><Network size={16} /></button>
          <button type="button" className={networkMode === "cohorts" ? "active" : ""} onClick={() => changeMode("cohorts")} aria-label="Agrupar por promociones"><Users size={16} /></button>
          <button type="button" className={networkMode === "hobbies" ? "active" : ""} onClick={() => changeMode("hobbies")} aria-label="Agrupar por hobbies"><Heart size={16} /></button>
          <button type="button" className={networkMode === "my_hobbies" ? "active" : ""} onClick={() => changeMode("my_hobbies")} aria-label="Ver personas con mis hobbies"><CircleUserRound size={16} /></button>
        </div>

        <div className="network-controls" aria-label="Controles del mapa">
          <button type="button" onClick={() => adjustZoom(0.12)} aria-label="Acercar"><Plus size={17} /></button>
          <button type="button" onClick={() => adjustZoom(-0.12)} aria-label="Alejar"><Minus size={17} /></button>
          <button type="button" onClick={resetView} aria-label="Centrar mapa"><LocateFixed size={17} /></button>
          <span><Move size={14} /> {Math.round(zoom * 100)}%</span>
        </div>

        {networkMode === "lineage" ? (
          <div
            className="living-world"
          >
            <>
              <div className="world-orbit orbit-one" />
              <div className="world-orbit orbit-two" />
              <div className="world-orbit orbit-three" />
              {network.edges.map((edge, index) => <LivingEdge key={`${edge.from.profile.id}-${edge.to.profile.id}`} edge={edge} index={index} />)}
              {network.points.map((point) => <LivingNode key={point.profile.id} point={point} onOpen={onOpen} />)}
            </>
          </div>
        ) : (
          <CohortGalaxy
            key={networkMode}
            profiles={networkMode === "my_hobbies" ? sharedHobbyProfiles : profiles}
            relationships={relationships}
            groupMode={networkMode === "cohorts" ? "cohorts" : "hobbies"}
            hobbyFilter={networkMode === "my_hobbies" ? myHobbies : undefined}
            selectedCohort={selectedCohort}
            onSelectCohort={setSelectedCohort}
            onCenterCohort={centerCohort}
            onOpenChannel={onOpenChannel}
            onOpen={onOpen}
            emptyTitle={networkMode === "my_hobbies" ? "Aún no encontramos coincidencias" : undefined}
            emptyCopy={networkMode === "my_hobbies" ? "Agrega tus hobbies al perfil o vuelve más tarde cuando haya nuevas personas." : undefined}
          />
        )}

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
          <span><i className="legend-coral" /> {networkMode === "lineage" ? "Conexión directa" : networkMode === "cohorts" ? "Enrolamiento (flecha)" : networkMode === "my_hobbies" ? "Personas que comparten tu hobby" : "Personas con ese hobby"}</span>
          {networkMode !== "hobbies" && networkMode !== "my_hobbies" && <span><i className="legend-sage" /> {networkMode === "lineage" ? "Rama extendida" : "Relación personal (línea)"}</span>}
          <span className="drag-hint"><Move size={13} /> Arrastra el lienzo · rueda para zoom</span>
        </div>
        <button className="mobile-add-connection-button" type="button" onClick={onAdd}><Plus size={18} /><span>Nueva relación</span></button>
      </section>
    </div>
  );
}

function MyProfile({ profile, profiles, relationships, onEdit, onOpen, onDeleteRequest }: { profile: Profile; profiles: Profile[]; relationships: ProfileRelationship[]; onEdit: () => void; onOpen: (profile: Profile) => void; onDeleteRequest?: () => void }) {
  const mentor = profiles.find((person) => person.id === profile.enrolled_by_id);
  const enrolled = profiles.filter((person) => person.enrolled_by_id === profile.id);
  const personalRelationships = relationshipsForProfile(profile.id, profiles, relationships);
  return (
    <div className="my-profile page-enter">
      <div className="profile-cover"><CoverMedia profile={profile} /><div className="profile-cover-actions"><button className="preview-profile-button" onClick={() => onOpen(profile)}><Eye size={17} /> Preview</button><button className="edit-profile-button" onClick={onEdit}><UserRoundPen size={17} /> Editar perfil</button></div></div>
      <div className="profile-main-card">
        <ClickableProfilePhoto profile={profile} size="hero" />
        <div className="identity"><span className="cohort-pill">{profile.cohort}</span><h1>{profile.full_name}</h1><p>{profile.profession}</p><div><span><MapPin size={15} /> {profile.city}, {profile.country}</span><span><CalendarDays size={15} /> {formatBirthDate(profile.birth_date)}</span></div></div>
      </div>
      <div className="profile-content-grid">
        <section className="section-card profile-about"><ProfileGallery profile={profile} /><span className="section-label">SOBRE MÍ</span><h2>Mi historia</h2><p>{profile.bio || "Aún no has agregado una descripción."}</p><div className="profile-detail-list">{profileHobbies(profile).map((hobby) => <span key={hobby}><Heart size={15} /> {hobby}</span>)}{profile.address && <span><MapPin size={15} /> {profile.address}</span>}{profile.stretching && <span><Sparkles size={15} /> Estiramiento: {profile.stretching}</span>}</div><div className="profile-social-links">{profile.phone && <a href={`tel:${profile.phone}`}><Phone size={16} /> {profile.phone}</a>}{profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noreferrer"><Link2 size={16} /> Facebook <ArrowUpRight size={15} /></a>}{profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer"><Link2 size={16} /> Perfil profesional <ArrowUpRight size={15} /></a>}{profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noreferrer"><AtSign size={16} /> Instagram <ArrowUpRight size={15} /></a>}</div></section>
        <section className="section-card profile-links"><span className="section-label">CONEXIONES</span><h2>Mis vínculos</h2>{mentor && <ConnectionListItem label="Me enroló" profile={mentor} onClick={() => onOpen(mentor)} />}{enrolled.map((person) => <ConnectionListItem key={person.id} label="Enrolado por mí" profile={person} onClick={() => onOpen(person)} />)}{personalRelationships.map((relationship) => <ConnectionListItem key={`relationship-${relationship.id}`} label={relationship.label} profile={relationship.profile} onClick={() => onOpen(relationship.profile)} />)}{!mentor && !enrolled.length && !personalRelationships.length && <p className="muted-copy">Todavía no has agregado relaciones.</p>}</section>
      </div>
      {onDeleteRequest && <section className="account-danger-zone"><div><span className="section-label">CUENTA</span><h2>Eliminar mi cuenta</h2><p>Esta acción elimina permanentemente tu perfil, tus datos públicos y tu acceso a Nexo.</p></div><button type="button" onClick={onDeleteRequest}><Trash2 size={17} /> Eliminar cuenta</button></section>}
    </div>
  );
}

function AccountDeletionDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => Promise<void> }) {
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const confirmed = confirmation.trim().toUpperCase() === "ELIMINAR";
  const remove = async () => {
    if (!confirmed || submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      await onConfirm();
    } catch {
      setMessage("No pudimos eliminar tu cuenta. Tus datos se conservaron; inténtalo nuevamente.");
      setSubmitting(false);
    }
  };

  return (
    <div className="account-delete-overlay" role="presentation" onMouseDown={(event) => { if (!submitting && event.currentTarget === event.target) onClose(); }}>
      <section className="account-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
        <button className="close-button" type="button" onClick={onClose} disabled={submitting} aria-label="Cerrar"><X /></button>
        <div className="danger-icon"><AlertTriangle size={24} /></div>
        <span className="section-label">ACCIÓN PERMANENTE</span>
        <h2 id="delete-account-title">Eliminar tu cuenta</h2>
        <p>Se eliminarán tu perfil de Nexo y tu cuenta de acceso. Esta acción no se puede deshacer.</p>
        <label><span>Escribe <strong>ELIMINAR</strong> para confirmar</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" disabled={submitting} /></label>
        {message && <p className="delete-account-error">{message}</p>}
        <div className="account-delete-actions"><button className="ghost-button" type="button" onClick={onClose} disabled={submitting}>Cancelar</button><button className="delete-account-confirm" type="button" onClick={remove} disabled={!confirmed || submitting}><Trash2 size={16} /> {submitting ? "Eliminando…" : "Eliminar definitivamente"}</button></div>
      </section>
    </div>
  );
}

function ConnectionListItem({ label, profile, onClick }: { label: string; profile: Profile; onClick: () => void }) {
  return <button className="connection-list-item" onClick={onClick}><Avatar profile={profile} size="small" /><div><span>{label}</span><strong>{profile.full_name}</strong></div><ChevronRight size={17} /></button>;
}

function ProfilePanel({ profile, profiles, relationships, isOwn, onClose, onOpen, onEdit }: { profile: Profile; profiles: Profile[]; relationships: ProfileRelationship[]; isOwn: boolean; onClose: () => void; onOpen: (profile: Profile) => void; onEdit: () => void }) {
  const mentor = profiles.find((person) => person.id === profile.enrolled_by_id);
  const enrolled = profiles.filter((person) => person.enrolled_by_id === profile.id);
  const personalRelationships = relationshipsForProfile(profile.id, profiles, relationships);
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <aside className="profile-panel" role="dialog" aria-modal="true" aria-label={`Perfil de ${profile.full_name}`}>
        <button className="close-button" onClick={onClose} aria-label="Cerrar perfil"><X /></button>
        <div className="panel-hero"><CoverMedia profile={profile} /><ClickableProfilePhoto profile={profile} size="hero" /></div>
        <div className="panel-body">
          <span className="cohort-pill">{profile.cohort}</span>
          <h2>{profile.full_name}</h2>
          <p className="panel-role">{profile.profession ?? "Miembro de la comunidad"}</p>
          <div className="panel-meta">{profile.city && <span><MapPin /> {profile.city}, {profile.country}</span>}<span><CalendarDays /> {formatBirthDate(profile.birth_date)}</span></div>
          <ProfileGallery profile={profile} />
          <div className="panel-about"><span className="section-label">SU HISTORIA</span><p>{profile.bio || "Esta persona todavía no ha compartido su descripción."}</p><div className="profile-detail-list">{profileHobbies(profile).map((hobby) => <span key={hobby}><Heart size={15} /> {hobby}</span>)}{profile.address && <span><MapPin size={15} /> {profile.address}</span>}{profile.stretching && <span><Sparkles size={15} /> Estiramiento: {profile.stretching}</span>}</div></div>
          {profile.phone && <a className="panel-link" href={`tel:${profile.phone}`}><Phone size={16} /> {profile.phone}</a>}
          {profile.facebook_url && <a className="panel-link" href={profile.facebook_url} target="_blank" rel="noreferrer"><Link2 size={16} /> Ver Facebook <ArrowUpRight size={15} /></a>}
          {profile.linkedin_url && <a className="panel-link" href={profile.linkedin_url} target="_blank" rel="noreferrer"><Link2 size={16} /> Ver perfil profesional <ArrowUpRight size={15} /></a>}
          {profile.instagram_url && <a className="panel-link" href={profile.instagram_url} target="_blank" rel="noreferrer"><AtSign size={16} /> Ver Instagram <ArrowUpRight size={15} /></a>}
          <div className="panel-connections"><div className="section-heading"><div><span className="section-label">CONEXIONES</span><h3>Sus vínculos</h3></div><Network size={20} /></div>{mentor && <ConnectionListItem label="Le enroló" profile={mentor} onClick={() => onOpen(mentor)} />}{enrolled.map((person) => <ConnectionListItem key={person.id} label="Enrolado por esta persona" profile={person} onClick={() => onOpen(person)} />)}{personalRelationships.map((relationship) => <ConnectionListItem key={`relationship-${relationship.id}`} label={relationship.label} profile={relationship.profile} onClick={() => onOpen(relationship.profile)} />)}{!mentor && !enrolled.length && !personalRelationships.length && <p className="muted-copy">Todavía no tiene conexiones registradas.</p>}</div>
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

function InstagramInput({ value, onChange }: { value?: string | null; onChange: (value: string) => void }) {
  return <div className="instagram-handle-input"><span>@</span><input value={instagramHandle(value)} onChange={(event) => onChange(instagramHandle(event.target.value))} placeholder="tu_usuario" inputMode="text" pattern="[A-Za-z0-9._]{1,30}" title="Usa únicamente letras, números, puntos o guiones bajos." /></div>;
}

function StretchingSelect({ value, onChange }: { value?: string | null; onChange: (value: string) => void }) {
  return (
    <select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
      <option value="">Vacío</option>
      {STRETCHING_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function HobbySelector({ value, legacyValue, profiles, onChange }: { value?: string[] | null; legacyValue?: string | null; profiles: Profile[]; onChange: (value: string[]) => void }) {
  const [customHobby, setCustomHobby] = useState("");
  const [showAllHobbies, setShowAllHobbies] = useState(false);
  const selected = normalizeHobbies(value ?? (legacyValue ?? "").split(/[,;\n]+/));
  const selectedKeys = new Set(selected.map((hobby) => hobby.toLocaleLowerCase("es")));
  const atLimit = selected.length >= PROFILE_HOBBY_LIMIT;
  const communityOptions = useMemo(() => communityCustomHobbyOptions(profiles), [profiles]);
  const communityKeys = new Set(communityOptions.map((hobby) => hobby.toLocaleLowerCase("es")));
  const previewOptions = HOBBY_OPTIONS.slice(0, HOBBY_OPTION_PREVIEW_COUNT);
  const previewKeys = new Set(previewOptions.map((hobby) => hobby.toLocaleLowerCase("es")));
  const selectedStandardOptions = HOBBY_OPTIONS.filter((hobby) => selectedKeys.has(hobby.toLocaleLowerCase("es")) && !previewKeys.has(hobby.toLocaleLowerCase("es")));
  const visibleStandardOptions = showAllHobbies ? HOBBY_OPTIONS : [...previewOptions, ...selectedStandardOptions];
  const hiddenOptionCount = HOBBY_OPTIONS.length - visibleStandardOptions.length + communityOptions.length;

  const toggleHobby = (hobby: string) => {
    const key = hobby.toLocaleLowerCase("es");
    onChange(selectedKeys.has(key) ? selected.filter((item) => item.toLocaleLowerCase("es") !== key) : normalizeHobbies([...selected, hobby]));
  };
  const addCustomHobby = () => {
    const next = normalizeHobbies([...selected, customHobby]);
    if (next.length === selected.length) return;
    onChange(next);
    setCustomHobby("");
  };
  const customSelections = selected.filter((hobby) => !HOBBY_OPTIONS.some((option) => option.localeCompare(hobby, "es", { sensitivity: "base" }) === 0));
  const customSelectionChips = customSelections.filter((hobby) => !showAllHobbies || !communityKeys.has(hobby.toLocaleLowerCase("es")));

  const renderHobbyOption = (hobby: string) => {
    const active = selectedKeys.has(hobby.toLocaleLowerCase("es"));
    return <button key={hobby} type="button" className={active ? "active" : ""} aria-pressed={active} disabled={!active && atLimit} onClick={() => toggleHobby(hobby)}>{active ? <Check size={13} /> : <Plus size={13} />}{hobby}</button>;
  };

  return (
    <div className="hobby-selector">
      <div className="hobby-option-grid">
        {visibleStandardOptions.map(renderHobbyOption)}
        {showAllHobbies && communityOptions.length > 0 && <div className="hobby-community-label"><span>Otros de la comunidad</span><small>Agregados por otras personas</small></div>}
        {showAllHobbies && communityOptions.map(renderHobbyOption)}
      </div>
      <button className="hobby-more-toggle" type="button" aria-expanded={showAllHobbies} onClick={() => setShowAllHobbies((current) => !current)}>
        {showAllHobbies ? "Ver menos" : `Ver más${hiddenOptionCount > 0 ? ` (${hiddenOptionCount})` : ""}`}
        <ChevronDown size={15} />
      </button>
      {customSelectionChips.length > 0 && <div className="custom-hobby-list">{customSelectionChips.map((hobby) => <button key={hobby} type="button" onClick={() => toggleHobby(hobby)}>{hobby}<X size={12} /></button>)}</div>}
      <div className="custom-hobby-input">
        <input value={customHobby} onChange={(event) => setCustomHobby(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomHobby(); } }} maxLength={40} disabled={atLimit} placeholder="Agregar otro hobby…" />
        <button type="button" onClick={addCustomHobby} disabled={atLimit || !customHobby.trim()}><Plus size={15} /> Agregar</button>
      </div>
      <small>{selected.length}/{PROFILE_HOBBY_LIMIT} seleccionados · puedes elegir varios</small>
    </div>
  );
}

function ProfilePhotoEditor({ profile, draft, update }: { profile: Profile; draft: ProfileDraft; update: DraftUpdater }) {
  const [adjusting, setAdjusting] = useState(false);
  const previewUrl = normalizePhotoUrl(draft.photo_url);
  const previewProfile: Profile = {
    ...profile,
    full_name: draft.full_name || profile.full_name,
    photo_url: previewUrl,
    photo_zoom: draft.photo_zoom,
    photo_position_x: draft.photo_position_x,
    photo_position_y: draft.photo_position_y,
  };

  return (
    <div className="photo-editor-block">
      <div className="photo-field">
        <div className="photo-preview-wrap"><div className="photo-preview-action"><Avatar profile={previewProfile} size="hero" />{previewUrl && <button type="button" onClick={() => setAdjusting(true)} aria-label="Ajustar encuadre de la foto"><Pencil size={14} /></button>}</div><small>Vista previa</small></div>
        <label><Camera size={16} /><span>Enlace público de tu foto</span><input type="url" value={draft.photo_url ?? ""} onChange={(event) => update("photo_url", event.target.value)} placeholder="https://drive.google.com/file/d/…" />{previewUrl && <a href={previewUrl} target="_blank" rel="noreferrer">Comprobar imagen directa <ArrowUpRight size={13} /></a>}</label>
      </div>
      <PhotoLinkGuide />
      {adjusting && <ImageAdjustmentDialog kind="photo" profile={previewProfile} draft={draft} update={update} onClose={() => setAdjusting(false)} />}
    </div>
  );
}

function ProfileCoverEditor({ profile, draft, update }: { profile: Profile; draft: ProfileDraft; update: DraftUpdater }) {
  const [adjusting, setAdjusting] = useState(false);
  const previewUrl = normalizePhotoUrl(draft.cover_url);
  const previewProfile: Profile = {
    ...profile,
    cover_url: previewUrl,
    cover_zoom: draft.cover_zoom,
    cover_position_x: draft.cover_position_x,
    cover_position_y: draft.cover_position_y,
  };

  return (
    <div className="cover-editor-block">
      <div className="cover-field">
        <div className="cover-preview-wrap">
          <div className="cover-preview-action"><CoverMedia profile={previewProfile} />{previewUrl && <button type="button" onClick={() => setAdjusting(true)} aria-label="Ajustar encuadre de la portada"><Pencil size={14} /></button>}</div>
          <small>Vista previa de portada</small>
        </div>
        <label><ImageIcon size={16} /><span>Enlace público de tu portada</span><input type="url" value={draft.cover_url ?? ""} onChange={(event) => update("cover_url", event.target.value)} placeholder="https://drive.google.com/file/d/…" />{previewUrl && <a href={previewUrl} target="_blank" rel="noreferrer">Comprobar imagen directa <ArrowUpRight size={13} /></a>}</label>
      </div>
      <PhotoLinkGuide subject="portada" />
      {adjusting && <ImageAdjustmentDialog kind="cover" profile={previewProfile} draft={draft} update={update} onClose={() => setAdjusting(false)} />}
    </div>
  );
}

function ProfileGalleryEditor({ draft, update }: { draft: ProfileDraft; update: DraftUpdater }) {
  const [newUrl, setNewUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const gallery = normalizeGalleryUrls(draft.gallery_urls);
  const addImage = () => {
    const nextImage = normalizeGalleryUrls([newUrl])[0];
    if (!nextImage) {
      setMessage("Usa un enlace público que empiece con http:// o https://.");
      return;
    }
    update("gallery_urls", normalizeGalleryUrls([...gallery, nextImage]));
    setMessage(null);
    setNewUrl("");
  };
  const removeImage = (url: string) => {
    update("gallery_urls", gallery.filter((image) => image !== url));
    setMessage(null);
  };

  return (
    <div className="gallery-editor-block">
      <div className="gallery-editor-heading"><div><ImageIcon size={17} /><span>Galería de fotos</span></div><small>{gallery.length}/{PROFILE_GALLERY_LIMIT}</small></div>
      <p>Agrega enlaces públicos; las imágenes aparecerán en miniatura antes de tu historia.</p>
      <div className="gallery-editor-input">
        <input type="url" value={newUrl} onChange={(event) => { setNewUrl(event.target.value); setMessage(null); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addImage(); } }} placeholder="https://drive.google.com/file/d/…" disabled={gallery.length >= PROFILE_GALLERY_LIMIT} aria-invalid={Boolean(message)} />
        <button type="button" onClick={addImage} disabled={!newUrl.trim() || gallery.length >= PROFILE_GALLERY_LIMIT}><Plus size={15} /> Agregar</button>
      </div>
      {message && <span className="gallery-editor-message">{message}</span>}
      {gallery.length > 0 && <div className="gallery-editor-thumbnails">{gallery.map((url, index) => <div key={url}>
        {/* Profile gallery images are user-provided remote URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={`Vista previa ${index + 1}`} />
        <button type="button" onClick={() => removeImage(url)} aria-label={`Quitar foto ${index + 1}`}><X size={13} /></button>
      </div>)}</div>}
      <PhotoLinkGuide subject="foto" />
    </div>
  );
}

function ImageAdjustmentDialog({ kind, profile, draft, update, onClose }: { kind: "photo" | "cover"; profile: Profile; draft: ProfileDraft; update: DraftUpdater; onClose: () => void }) {
  const isCover = kind === "cover";
  const zoomField: keyof ProfileDraft = isCover ? "cover_zoom" : "photo_zoom";
  const xField: keyof ProfileDraft = isCover ? "cover_position_x" : "photo_position_x";
  const yField: keyof ProfileDraft = isCover ? "cover_position_y" : "photo_position_y";
  const zoom = clampPhotoValue(isCover ? draft.cover_zoom : draft.photo_zoom, 1, 2, 1);
  const positionX = clampPhotoValue(isCover ? draft.cover_position_x : draft.photo_position_x, 0, 100, 50);
  const positionY = clampPhotoValue(isCover ? draft.cover_position_y : draft.photo_position_y, 0, 100, 50);
  const drag = useRef<{ pointerId: number; clientX: number; clientY: number; x: number; y: number } | null>(null);
  const resetFrame = () => {
    update(zoomField, 1);
    update(xField, 50);
    update(yField, 50);
  };
  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: positionX,
      y: positionY,
    };
  };
  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    event.preventDefault();
    const preview = event.currentTarget.querySelector<HTMLElement>(".image-frame-window");
    const previewWidth = preview?.offsetWidth ?? 240;
    const previewHeight = preview?.offsetHeight ?? 240;
    const travelX = Math.max((zoom - 1) * previewWidth, previewWidth * 0.22);
    const travelY = Math.max((zoom - 1) * previewHeight, previewHeight * 0.22);
    const sensitivityX = clampPhotoValue(100 / travelX, 0.25, 1.8, 0.8);
    const sensitivityY = clampPhotoValue(100 / travelY, 0.25, 1.8, 0.8);
    const nextX = clampPhotoValue(drag.current.x - (event.clientX - drag.current.clientX) * sensitivityX, 0, 100, 50);
    const nextY = clampPhotoValue(drag.current.y - (event.clientY - drag.current.clientY) * sensitivityY, 0, 100, 50);

    drag.current = {
      ...drag.current,
      clientX: event.clientX,
      clientY: event.clientY,
      x: nextX,
      y: nextY,
    };
    update(xField, nextX);
    update(yField, nextY);
  };
  const stopDrag = () => { drag.current = null; };

  return (
    <div className="photo-adjustment-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className={`photo-adjustment-dialog ${isCover ? "cover-adjustment-dialog" : ""}`} role="dialog" aria-modal="true" aria-labelledby="image-adjustment-title">
        <header><div><span className="section-label">{isCover ? "TU PORTADA" : "TU FOTO"}</span><h3 id="image-adjustment-title">Ajustar encuadre</h3><p>Arrastra la imagen para moverla y usa el control para acercarla.</p></div><button className="close-button" type="button" onClick={onClose} aria-label={`Cerrar ajuste de ${isCover ? "portada" : "foto"}`}><X /></button></header>
        <div className="photo-dialog-body">
          <div className="photo-drag-preview" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}><div className={`image-frame-window image-frame-window-${kind}`}>{isCover ? <CoverMedia profile={{ ...profile, cover_zoom: draft.cover_zoom, cover_position_x: draft.cover_position_x, cover_position_y: draft.cover_position_y }} /> : <Avatar profile={{ ...profile, photo_zoom: draft.photo_zoom, photo_position_x: draft.photo_position_x, photo_position_y: draft.photo_position_y }} size="hero" />}</div><span><Move size={15} /> Arrastra para mover</span></div>
          <div className="photo-dialog-controls">
            <label><span>Zoom <b>{zoom.toFixed(2)}×</b></span><input type="range" min="1" max="2" step="0.05" value={zoom} onChange={(event) => update(zoomField, Number(event.target.value))} /></label>
            <div><button className="ghost-button" type="button" onClick={resetFrame}>Recentrar</button><button className="primary-button" type="button" onClick={onClose}><Check size={16} /> Usar este encuadre</button></div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PhotoLinkGuide({ subject = "foto" }: { subject?: "foto" | "portada" }) {
  return (
    <details className="photo-link-guide">
      <summary><Camera size={15} /> ¿Cómo obtengo un enlace para mi {subject}?<ChevronDown size={15} /></summary>
      <div>
        <ol>
          <li>Sube tu {subject} a Google Drive, Dropbox, Imgur o Cloudinary.</li>
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

function ConnectionEditor({
  profile,
  profiles,
  onClose,
  onSave,
}: {
  profile: Profile;
  profiles: Profile[];
  onClose: () => void;
  onSave: (personId: string, connectionType: ConnectionType, customLabel: string | null) => Promise<void>;
}) {
  const [connectionType, setConnectionType] = useState<ConnectionType | "">("");
  const [personId, setPersonId] = useState<string | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedPerson = profiles.find((person) => person.id === personId);
  const isEnrollment = connectionType === "i_enrolled" || connectionType === "enrolled_me";
  const previousEnroller = connectionType === "i_enrolled"
    ? profiles.find((person) => person.id === selectedPerson?.enrolled_by_id)
    : connectionType === "enrolled_me"
      ? profiles.find((person) => person.id === profile.enrolled_by_id)
      : undefined;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, saving]);

  const chooseType = (next: ConnectionType | "") => {
    setConnectionType(next);
    if (next === "enrolled_me" && !personId) setPersonId(profile.enrolled_by_id);
    if (next !== "other") setCustomLabel("");
    setMessage(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!personId) {
      setMessage("Selecciona a la persona que forma parte de esta relación.");
      return;
    }
    if (!connectionType) {
      setMessage("Selecciona el tipo de relación.");
      return;
    }
    if (connectionType === "other" && customLabel.trim().length < 2) {
      setMessage("Escribe cómo quieres llamar a esta relación.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await onSave(personId, connectionType, connectionType === "other" ? customLabel.trim() : null);
    } catch {
      setMessage("No pudimos guardar la relación. Inténtalo nuevamente.");
      setSaving(false);
    }
  };

  return (
    <div className="overlay editor-overlay connection-editor-overlay" role="presentation" onMouseDown={(event) => { if (!saving && event.currentTarget === event.target) onClose(); }}>
      <section className="profile-editor connection-editor" role="dialog" aria-modal="true" aria-labelledby="connection-editor-title">
        <header>
          <div><span className="section-label">TU RED</span><h2 id="connection-editor-title">Agregar una relación</h2><p>Conecta a una persona y cuenta qué vínculo los une.</p></div>
          <button className="close-button" type="button" onClick={onClose} disabled={saving} aria-label="Cerrar modal"><X /></button>
        </header>
        <form onSubmit={submit}>
          <div className="field connection-person-picker">
            <span>¿Con quién tienes esta relación? <b>*</b></span>
            <ProfilePicker profiles={profiles} profileId={profile.id} value={personId} onChange={setPersonId} />
          </div>
          <label className="field connection-type-field">
            <span>¿Qué relación tiene contigo? <b>*</b></span>
            <select value={connectionType} onChange={(event) => chooseType(event.target.value as ConnectionType | "")}>
              <option value="">Selecciona una relación</option>
              <optgroup label="Familia y pareja">
                {RELATIONSHIP_OPTIONS.filter((option) => option.group === "family").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </optgroup>
              <optgroup label="Amistad, trabajo y comunidad">
                {RELATIONSHIP_OPTIONS.filter((option) => option.group === "social").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </optgroup>
              <optgroup label="Comunidad Nexo">
                <option value="i_enrolled">Yo enrolé a esta persona</option>
                <option value="enrolled_me">Esta persona me enroló</option>
              </optgroup>
              <optgroup label="Personalizada">
                {RELATIONSHIP_OPTIONS.filter((option) => option.group === "other").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </optgroup>
            </select>
          </label>
          {connectionType === "other" && (
            <label className="field connection-custom-field">
              <span>Nombre de la relación <b>*</b></span>
              <input value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} maxLength={60} placeholder="Ej. Vecino, padrino, socio…" />
              <small>{customLabel.length}/60</small>
            </label>
          )}
          {isEnrollment && <p className="connection-type-note"><Network size={15} /> Esta relación también definirá la posición en el árbol de enrolamiento.</p>}
          {previousEnroller && personId && previousEnroller.id !== (connectionType === "i_enrolled" ? profile.id : personId) && (
            <p className="connection-replacement-note"><AlertTriangle size={15} /> Esta acción reemplazará la conexión actual con {previousEnroller.full_name}.</p>
          )}
          {message && <p className="form-message">{message}</p>}
          <footer><button className="ghost-button" type="button" onClick={onClose} disabled={saving}>Cancelar</button><button className="primary-button" type="submit" disabled={saving || !personId || !connectionType || (connectionType === "other" && customLabel.trim().length < 2)}><Network size={17} /> {saving ? "Guardando..." : "Guardar relación"}</button></footer>
        </form>
      </section>
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
  const [draft, setDraft] = useState<ProfileDraft>({ ...emptyDraft, ...profile, hobbies_list: profile.hobbies_list ?? profileHobbies(profile) });
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
    try { await onSave(draft); } catch { setMessage("No pudimos guardar el perfil. Tus datos siguen aquí; inténtalo nuevamente."); setSaving(false); }
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
              <div className="field field-wide"><span>Hobbies e intereses</span><HobbySelector value={draft.hobbies_list} legacyValue={draft.hobbies} profiles={profiles} onChange={(value) => update("hobbies_list", value)} /></div>
              <Field label="Tu descripción" wide><textarea rows={5} maxLength={320} value={draft.bio ?? ""} onChange={(event) => update("bio", event.target.value)} placeholder="Cuéntanos brevemente quién eres, qué haces y qué te inspira." /><small>{draft.bio?.length ?? 0}/320</small></Field>
            </div></div>}

            {step === 3 && <div className="onboarding-step-panel step-enter"><div className="form-grid onboarding-fields">
              <div className="field field-wide"><span>¿Quién te enroló?</span><ProfilePicker profiles={profiles} profileId={profile.id} value={draft.enrolled_by_id} onChange={(value) => update("enrolled_by_id", value)} /></div>
              <Field label="Número de teléfono"><input type="tel" inputMode="tel" value={draft.phone ?? ""} onChange={(event) => update("phone", event.target.value)} placeholder="+51 999 999 999" /></Field>
              <Field label="Facebook"><input value={draft.facebook_url ?? ""} onChange={(event) => update("facebook_url", event.target.value)} placeholder="facebook.com/tu.perfil" /></Field>
              <Field label="Estiramiento"><StretchingSelect value={draft.stretching} onChange={(value) => update("stretching", value)} /></Field>
              <Field label="LinkedIn o portafolio"><input type="url" value={draft.linkedin_url ?? ""} onChange={(event) => update("linkedin_url", event.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
              <Field label="Instagram"><InstagramInput value={draft.instagram_url} onChange={(value) => update("instagram_url", value)} /></Field>
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
  const [draft, setDraft] = useState<ProfileDraft>({ ...emptyDraft, ...profile, hobbies_list: profile.hobbies_list ?? profileHobbies(profile) });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const update: DraftUpdater = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.full_name.trim() || !isValidCohort(draft.cohort)) { setMessage("Completa tu nombre y usa el formato de promoción Lima 200."); return; }
    setSaving(true);
    setMessage(null);
    try { await onSave(draft); } catch { setMessage("No pudimos guardar los cambios. Tus datos siguen aquí; inténtalo nuevamente."); setSaving(false); }
  };
  return (
    <div className="overlay editor-overlay" role="presentation">
      <section className="profile-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <header><div><span className="section-label">TU INFORMACIÓN</span><h2 id="editor-title">Editar perfil</h2><p>Comparte lo esencial para que tu comunidad pueda conocerte.</p></div><button className="close-button" onClick={onClose} aria-label="Cerrar editor"><X /></button></header>
        <form onSubmit={submit}>
          <ProfilePhotoEditor profile={profile} draft={draft} update={update} />
          <ProfileCoverEditor profile={profile} draft={draft} update={update} />
          <ProfileGalleryEditor draft={draft} update={update} />
          <div className="form-grid">
            <Field label="Nombre completo" required><input value={draft.full_name} onChange={(event) => update("full_name", event.target.value)} placeholder="Tu nombre y apellido" /></Field>
            <Field label="Promoción" required><CohortInput value={draft.cohort} onChange={(value) => update("cohort", value)} /></Field>
            <Field label="Fecha de nacimiento"><input type="date" value={draft.birth_date ?? ""} onChange={(event) => update("birth_date", event.target.value)} /></Field>
            <Field label="Profesión u ocupación"><input value={draft.profession ?? ""} onChange={(event) => update("profession", event.target.value)} placeholder="Diseñador, emprendedora..." /></Field>
            <Field label="Ciudad"><input value={draft.city ?? ""} onChange={(event) => update("city", event.target.value)} placeholder="Lima" /></Field>
            <Field label="País"><input value={draft.country ?? ""} onChange={(event) => update("country", event.target.value)} placeholder="Perú" /></Field>
            <Field label="Dirección o zona"><input value={draft.address ?? ""} onChange={(event) => update("address", event.target.value)} placeholder="Miraflores, Lima" /></Field>
            <div className="field field-wide"><span>Hobbies e intereses</span><HobbySelector value={draft.hobbies_list} legacyValue={draft.hobbies} profiles={profiles} onChange={(value) => update("hobbies_list", value)} /></div>
            <div className="field field-wide"><span>¿Quién te enroló?</span><ProfilePicker profiles={profiles} profileId={profile.id} value={draft.enrolled_by_id} onChange={(value) => update("enrolled_by_id", value)} /></div>
            <Field label="Número de teléfono"><input type="tel" inputMode="tel" value={draft.phone ?? ""} onChange={(event) => update("phone", event.target.value)} placeholder="+51 999 999 999" /></Field>
            <Field label="Facebook"><input value={draft.facebook_url ?? ""} onChange={(event) => update("facebook_url", event.target.value)} placeholder="facebook.com/tu.perfil" /></Field>
            <Field label="Estiramiento"><StretchingSelect value={draft.stretching} onChange={(value) => update("stretching", value)} /></Field>
            <Field label="LinkedIn o portafolio"><input type="url" value={draft.linkedin_url ?? ""} onChange={(event) => update("linkedin_url", event.target.value)} placeholder="https://linkedin.com/in/..." /></Field>
            <Field label="Instagram"><InstagramInput value={draft.instagram_url} onChange={(value) => update("instagram_url", value)} /></Field>
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
