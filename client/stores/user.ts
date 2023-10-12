import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { BodyT, fetchy } from "@/utils/fetchy";

export const useUserStore = defineStore(
  "user",
  () => {
    const currentUsername = ref("");

    const isLoggedIn = computed(() => currentUsername.value !== "");

    const resetStore = () => {
      currentUsername.value = "";
    };

    const createUser = async (username: string, password: string) => {
      await fetchy("api/users", "POST", {
        body: { username, password },
      });
    };

    const loginUser = async (username: string, password: string) => {
      await fetchy("api/login", "POST", {
        body: { username, password },
      });
    };

    const updateSession = async () => {
      try {
        const { username } = await fetchy("api/session", "GET", { alert: false });
        currentUsername.value = username;
      } catch {
        currentUsername.value = "";
      }
    };

    const logoutUser = async () => {
      await fetchy("api/logout", "POST");
      resetStore();
    };

    const updateUser = async (patch: BodyT) => {
      await fetchy("api/users", "PATCH", { body: { update: patch } });
    };

    const deleteUser = async () => {
      await fetchy("api/users", "DELETE");
      resetStore();
    };

    return {
      currentUsername,
      isLoggedIn,
      createUser,
      loginUser,
      updateSession,
      logoutUser,
      updateUser,
      deleteUser,
    };
  },
  { persist: true },
);
