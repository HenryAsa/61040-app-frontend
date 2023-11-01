<script setup lang="ts">
import ActivityListComponent from "@/components/Activity/ActivityListComponent.vue";
import JoinedActivitiesList from "@/components/Activity/JoinedActivitiesList.vue";
import PostListComponent from "@/components/Post/PostListComponent.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">
        Welcome <span class="gradient-text">{{ currentUsername }}</span
        >!
      </h1>
      <h1 v-if="!isLoggedIn">{{ void router.push({ name: "Login" }) }}</h1>
    </section>
    <div v-if="isLoggedIn">
      <JoinedActivitiesList />
    </div>
    <ActivityListComponent />
    <PostListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
.gradient-text {
  background: -webkit-linear-gradient(0deg, red, orange);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
