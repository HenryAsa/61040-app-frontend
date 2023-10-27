import { defineStore } from "pinia";

import { fetchy } from "@/utils/fetchy";

export const useActivityStore = defineStore(
  "activity",
  () => {
    const currentUserActivities = async () => {
      await fetchy("api/activities/members/", "GET", { alert: false });
    };

    const createActivity = async (name: string, join_code: string, location: string) => {
      await fetchy("api/activity", "POST", {
        body: { name: name, join_code: join_code, location: location },
      });
    };

    const deleteActivity = async () => {
      await fetchy("api/activities", "DELETE");
    };

    return {
      createActivity,
      currentUserActivities,
      deleteActivity,
    };
  },
  { persist: true },
);
