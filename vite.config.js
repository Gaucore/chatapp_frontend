
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",

  plugins: [
    vue(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      devOptions: {
        enabled: true,
      },

      includeAssets: [
        "192.png",
        "512.png",
      ],

      manifest: {
        name: "Chat App",
        short_name: "Chat",
        description: "Real Time Chat Application",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",

        icons: [
          {
            src: "192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  server: {
    port: 3001,
  },
});