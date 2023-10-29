<script setup lang="ts">
import { ref } from "vue";

const author = ref("");
const emit = defineEmits(["getPostsByAuthor"]);
</script>

<template>
  <!-- <form @submit.prevent="emit('getPostsByAuthor', author)" class="pure-form"> -->
  <fieldset>
    <legend>Search by Author</legend>
    <input id="author" @input="emit('getPostsByAuthor', author)" type="text" v-model="author" placeholder="Username" />
    <!-- <button type="submit" class="pure-button pure-button-primary">Search</button> -->
  </fieldset>
  <!-- </form> -->
</template>

<style scoped>
fieldset {
  display: flex;
  gap: 0.25em;
  padding: 1em;
  padding-top: 0.5em;
  align-items: center;
  background-color: #7eeaff;
  border-radius: 8px;
}
legend {
  background-color: #7eeaff;
  padding: 0.5em;
  border-radius: 8px;
}
</style>
