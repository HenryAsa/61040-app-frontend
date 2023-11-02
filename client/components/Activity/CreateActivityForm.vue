<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const name = ref("");
const join_code = ref("");
const location = ref("");
const emit = defineEmits(["refreshActivities"]);

const createActivity = async (name: string, join_code: string, location: string) => {
  try {
    await fetchy("/api/activity", "POST", {
      body: { name: name, join_code: join_code, location: location },
    });
  } catch (_) {
    return;
  }
  emit("refreshActivities");
  emptyForm();
};

const emptyForm = () => {
  name.value = "";
  join_code.value = "";
  location.value = "";
};
</script>

<template>
  <form @submit.prevent="createActivity(name, join_code, location)">
    <label for="content">Create a new Activity!</label>
    <input type="text" id="new_name" v-model.trim="name" placeholder="Name the new activity!" required />
    <input type="password" id="join_code" v-model.trim="join_code" placeholder="Enter the secret join code for this activity!" required />
    <input type="text" id="location" v-model.trim="location" placeholder="Please enter the location where this activity occurs" required />
    <button type="submit" class="pure-button-primary pure-button">Create Activity</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

input {
  font-family: inherit;
  font-size: inherit;
  padding: 0.5em;
  border-radius: 8px;
  resize: none;
}
</style>
