<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
import RegisterForm from "@/components/Login/RegisterForm.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <p v-if="isLoggedIn">{{ void router.push({ name: "Home" }) }}</p>
  <main class="column">
    <h1>Welcome to Community Carpool!  Please login or register to use the app!</h1>
    <LoginForm />
    <RegisterForm />
  </main>
</template>
