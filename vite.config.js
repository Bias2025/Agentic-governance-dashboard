import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: Replace REPO_NAME with your repo name exactly
const REPO_NAME = "Agentic-governance-dashboard";

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
});
