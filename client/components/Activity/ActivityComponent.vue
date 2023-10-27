<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import { formatDate } from "@/utils/formatDate";

const props = defineProps(["activity"]);
const emit = defineEmits(["editActivity", "refreshActivities"]);
const { currentUsername } = storeToRefs(useUserStore());

const deleteActivity = async () => {
  try {
    await fetchy(`api/activities/${props.activity._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshActivities");
};
</script>

<template>
  <p class="name">{{ props.activity.name.toString() }}</p>
  <p>{{ props.activity.content }}</p>
  <div class="base">
    <menu v-if="props.activity.author == currentUsername">
      <li><button class="btn-small pure-button" @click="emit('editActivity', props.activity._id)">Edit</button></li>
      <li><button class="button-error btn-small pure-button" @click="deleteActivity">Delete</button></li>
    </menu>
    <article class="timestamp">
      <p v-if="props.activity.dateCreated !== props.activity.dateUpdated">Edited on: {{ formatDate(props.activity.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.activity.dateCreated) }}</p>
    </article>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.name {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
