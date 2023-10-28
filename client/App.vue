<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn, currentUserProfilePhoto } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <nav>
      <RouterLink :to="{ name: 'Home' }">
        <div class="title">
          <!-- <img src="@/assets/images/logo.svg" /> -->
          <img src="@/assets/images/carpool.jpg" />
          <h1 class="gradient-text">Community Carpool</h1>
        </div>
      </RouterLink>
      <ul class="nav-items">
        <li>
          <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }"> Home </RouterLink>
        </li>
        <li v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Settings' }" :class="{ underline: currentRouteName == 'Settings' }">
            <img class="profile_picture" v-bind:src="currentUserProfilePhoto" />
          </RouterLink>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";

nav {
  padding: 0em 2em;
  background: linear-gradient(90deg, #4eb5ef, #bcf0b7);
  display: flex;
  align-items: center;
}

h1 {
  font-size: 2em;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 3em;
  border-radius: 8px;
}

.profile_picture {
  width: 5vw;
  height: 5vw;
  object-fit: cover;
  align-self: auto;
  border: 3px solid #e3e8f4;
  border-radius: 16px;
  display: block;
}

a {
  text-decoration: none;
}

.underline {
  padding: 5px;
  border-radius: 8px;
  border: 5px solid white;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  column-gap: 1em;
}

.nav-items {
  font-weight: bold;
  font-size: larger;
}

.gradient-text {
  background: -webkit-linear-gradient(0deg, red, royalblue);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

a {
  background: -webkit-linear-gradient(0deg, royalblue, red);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  padding-bottom: 5px;
}

a::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 4px;
  border-radius: 4px;
  background-color: white;
  bottom: 0;
  left: 0;
  transform-origin: right;
  transform: scaleX(0);
  transition: transform 0.4s ease-in-out;
}

a:hover::before {
  transform-origin: left;
  transform: scaleX(1);
}
</style>
