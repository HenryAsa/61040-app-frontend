<script setup lang="ts">
import ActivityComponent from "@/components/Activity/ActivityComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, onUpdated, ref } from "vue";
import { fetchy } from "../utils/fetchy";

const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());

const props = defineProps(["name"]);
const loaded = ref(false);

let activityGroup = ref<Array<Record<string, string>>>([]);

async function getActivity() {
  let activityResults;
  try {
    activityResults = await fetchy(`/api/activity/${props.name}`, "GET");
  } catch (_) {
    return;
  }
  activityGroup.value = activityResults;
}

onBeforeMount(async () => {
  await getActivity();
  loaded.value = true;
});

onUpdated(async () => {
  await getActivity();
});

function isMember() {
  const usernames = activityGroup.value.members.map((member: UserDoc) => member.username);
  return usernames.includes(currentUsername.value);
}

function isManager() {
  const usernames = activityGroup.value.managers.map((manager: UserDoc) => manager.username);
  return usernames.includes(currentUsername.value);
}
</script>

<template>
  <div v-if="isMember()">
    <div class="top-heading">
      <h1>
        Welcome to the <span class="gradient-text">{{ props.name }}</span> Activity!
      </h1>
      <h2 v-if="isManager()">You are a manager of this activity. As such, you are granted extra privileges and functionality within the group.</h2>
      <h2>
        <span class="gradient-text">{{ props.name }}</span> is located at {{ activityGroup.location }}.
      </h2>
    </div>
    <section class="activities">
      <article>
        <ActivityComponent v-if="isLoggedIn && loaded" :activity="activityGroup" @refreshActivities="onUpdated" />
        <!-- <EditActivityForm v-else :activity="activity" @refreshActivities="getActivities" @editActivity="updateEditing" /> -->
      </article>
    </section>
  </div>
  <div v-else class="top-heading">
    <h2>
      You are not a member of the <span class="gradient-text">{{ props.name }}</span> activity.
    </h2>
    <ActivityComponent v-if="isLoggedIn && loaded" :activity="activityGroup" @refreshActivities="onUpdated" />
  </div>
</template>

<style scoped>
.gradient-text {
  background: -webkit-linear-gradient(0deg, red, orange);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.top-heading {
  padding-left: 5em;
  padding-right: 5em;
}

section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.activities {
  padding: 1em;
}

.h1 {
  text-align: center;
}
</style>
