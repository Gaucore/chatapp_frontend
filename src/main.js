import { createApp } from "vue";
import App from "./App.vue";

import { createPinia } from "pinia";
import router from "./router";

import Vant from "vant";
import "vant/lib/index.css";

import { registerSW } from "virtual:pwa-register";
import { useThemeStore } from "../src/store/themeStore";
import { useCallStore } from "../src/store/callStore";

const app = createApp(App);

/* ================= PINIA ================= */
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Vant);

/* ================= THEME INIT ================= */
const themeStore = useThemeStore(pinia);
themeStore.initTheme?.();

/* ================= CALL STORE INIT (FIXED) ================= */
const callStore = useCallStore(pinia);
callStore.init();

/* ================= PWA ================= */
registerSW({
  immediate: true,

  onRegistered(sw) {
    console.log("SW Registered", sw);
  },

  onRegisterError(error) {
    console.error("SW Error", error);
  },
});

/* ================= MOUNT ================= */
app.mount("#app");