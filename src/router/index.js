import { createRouter, createWebHistory } from "vue-router";

import Login from "../pages/auth/Login.vue";
import Register from "../pages/auth/Register.vue";
import Home from "../pages/home/Home.vue";
import Notification from "../pages/notifications/NotificationView.vue";
import ProfileView from "../pages/profile/ProfileView.vue";
import SettingPage from "../pages/settings/SettingPage.vue";
import ContactsView from "../pages/contact/ContactsView.vue";
import GroupPage from "../pages/groups/GroupPage.vue";
import GroupList from "../pages/groups/GroupList.vue";







const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/register",
    component: Register,
  },
  {
    path: "/home",
    component: Home,
  },
  {
  path: "/groups",
  component: GroupList,
  },
  {
  path: "/groups/create",
  component: GroupPage
  },
  { path: "/notifications", component: Notification },
   { path: "/profile", component: ProfileView },
   { path: "/settings", component: SettingPage },
   { path: "/contact", component: ContactsView },




   

];

export default createRouter({
  history: createWebHistory(),
  routes,
});