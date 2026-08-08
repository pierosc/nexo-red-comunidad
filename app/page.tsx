import NexoApp from "./NexoApp";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <NexoApp
      config={{
        clerkPublishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY ?? "",
        supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
        supabasePublishableKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
      }}
    />
  );
}
