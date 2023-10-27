<script setup lang="ts">
import { ref } from "vue";

const name = ref("");
const emit = defineEmits(["getActivitiesByName"]);
</script>

<template>
  <!-- <form @submit.prevent="emit('getPostsByAuthor', author)" class="pure-form"> -->
  <fieldset>
    <legend>Search by Activity Name</legend>
    <input id="name" @input="emit('getActivitiesByName', name)" type="text" v-model="name" placeholder="Activity Name" />
    <!-- <button type="submit" class="pure-button pure-button-primary">Search</button> -->
  </fieldset>
  <!-- </form> -->
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
</style>
