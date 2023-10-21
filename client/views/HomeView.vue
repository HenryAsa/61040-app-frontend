<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import ActivityListComponent from "@/components/Activity/ActivityListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <ActivityListComponent />
    <PostListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
