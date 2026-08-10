import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import NexoApp from "../app/NexoApp";
import "../app/globals.css";
import "./pages.css";

const root = document.getElementById("root");

if (!root) throw new Error("No se encontró el contenedor principal de Nexo.");

createRoot(root).render(
  <StrictMode>
    <NexoApp
      config={{
        clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "",
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
        supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
      }}
    />
  </StrictMode>,
);
