<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const name = ref("");
const join_code = ref("");
const emit = defineEmits(["refreshActivities"]);

const createActivity = async (name: string, join_code: string) => {
  try {
    await fetchy("api/activities", "POST", {
      body: { name: name, join_code: join_code },
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
};
</script>

<template>
  <form @submit.prevent="createActivity(name, join_code)">
    <label for="content">Activity Contents:</label>
    <textarea id="name" v-model="name" placeholder="Name the new activity!" required> </textarea>
    <textarea id="join_code" v-model="join_code" placeholder="Enter the secret join code for this activity!" required> </textarea>
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

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
