import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { BodyT, fetchy } from "@/utils/fetchy";

export const useUserStore = defineStore(
  "user",
  () => {
    const currentUsername = ref("");

    const currentUserFirstName = ref("");

    const currentUserLastName = ref("");

    const currentUserProfilePhoto = ref("");

    const isLoggedIn = computed(() => currentUsername.value !== "");

    const resetStore = () => {
      currentUsername.value = "";
      currentUserFirstName.value = "";
      currentUserLastName.value = "";
      currentUserProfilePhoto.value = "";
    };

    const createUser = async (username: string, password: string, first_name: string, last_name: string, profile_photo: string) => {
      await fetchy("api/users", "POST", {
        body: { username: username, password: password, first_name: first_name, last_name: last_name, profile_photo: profile_photo },
      });
    };

    const loginUser = async (username: string, password: string) => {
      await fetchy("api/login", "POST", {
        body: { username: username, password: password },
      });
    };

    const updateSession = async () => {
      try {
        const { username, first_name, last_name, profile_photo } = await fetchy("api/session", "GET", { alert: false });
        currentUsername.value = username;
        currentUserFirstName.value = first_name;
        currentUserLastName.value = last_name;
        currentUserProfilePhoto.value = profile_photo;
      } catch {
        currentUsername.value = "";
        currentUserFirstName.value = "";
        currentUserLastName.value = "";
        currentUserProfilePhoto.value = "";
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
      currentUserFirstName,
      currentUserLastName,
      currentUserProfilePhoto,
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
