<script setup lang="ts">
import ActivityComponent from "@/components/Activity/ActivityComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, onUpdated, ref } from "vue";
import { fetchy } from "../utils/fetchy";

const { isLoggedIn } = storeToRefs(useUserStore());

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
</script>

<template>
  <!-- <h1>
    Welcome to the <span class="gradient-text">{{ props.name }}</span> Activity!
  </h1> -->
  <p>Hello!</p>
  <p>isLoggedIn: {{ isLoggedIn }}</p>
  <p>Loaded: {{ loaded }}</p>
  <section class="activities">
    <article>
      <ActivityComponent v-if="isLoggedIn && loaded" :activity="activityGroup" @refreshActivities="onUpdated" />
      <!-- <EditActivityForm v-else :activity="activity" @refreshActivities="getActivities" @editActivity="updateEditing" /> -->
    </article>
  </section>
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
