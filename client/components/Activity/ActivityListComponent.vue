<script setup lang="ts">
import CreateActivityForm from "@/components/Activity/CreateActivityForm.vue";
// import EditActivityForm from "@/components/Activity/EditActivityForm.vue";
import ActivityComponent from "@/components/Activity/ActivityComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
// import SearchActivityForm from "./SearchActivityForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let activities = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");

async function getActivities(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let activityResults;
  try {
    activityResults = await fetchy("api/activities", "GET");
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
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
    <h2>Create an activity:</h2>
    <CreateActivityForm @refreshActivities="getActivities" />
  </section>
  <div class="row">
    <h2 v-if="!searchAuthor">Activities:</h2>
    <h2 v-else>Activities by {{ searchAuthor }}:</h2>
    <SearchActivityForm @getActivitiesByAuthor="getActivities" />
  </div>
  <section class="activities" v-if="loaded && activities.length !== 0">
    <article v-for="activity in activities" :key="activity._id">
      <ActivityComponent v-if="editing !== activity._id" :activity="activity" @refreshActivities="getActivities" @editActivity="updateEditing" />
      <EditActivityForm v-else :activity="activity" @refreshActivities="getActivities" @editActivity="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded">No activities found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
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
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
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
