<script setup lang="ts">
// import EditActivityForm from "@/components/Activity/EditActivityForm.vue";
import ActivityComponent from "@/components/Activity/ActivityComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
// import SearchActivityForm from "./SearchActivityForm.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let activities = ref<Array<Record<string, string>>>([]);
let editing = ref("");

async function getActivities() {
  let activityResults;
  try {
    activityResults = await fetchy("/api/activitiesUserIsMemberOf", "GET", { alert: false });
  } catch (_) {
    return;
  }
  activities.value = activityResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getActivities();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <h2>
      <span class="gradient-text">{{ currentUsername }}'s</span> Activities:
    </h2>
  </section>
  <section class="activities" v-if="loaded && activities.length !== 0">
    <article v-for="activity in activities" :key="activity._id">
      <ActivityComponent v-if="editing !== activity._id" :activity="activity" @refreshActivities="getActivities" @editActivity="updateEditing" />
    </article>
  </section>
  <h3 v-else-if="activities.length === 0">{{ currentUsername }} is not a member of any activities!</h3>
  <p v-else>Loading...</p>
</template>

<style scoped>
.gradient-text {
  background: -webkit-linear-gradient(0deg, red, orange);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border: 3px solid;
  border-color: darkgray;
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  z-index: 20;
}

.activities {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
