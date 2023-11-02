<script setup lang="ts">
const props = defineProps(["user"]);
</script>

<template>
  <div class="base">
    <img v-bind:src="props.user.profile_photo" />
    <div class="username-text">
      <p class="name">{{ props.user.first_name }} {{ $props.user.last_name }}</p>
      <p class="username">@{{ props.user.username }}</p>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.name {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 0.2rem;
}

img {
  width: 5vw;
  height: 5vw;
  object-fit: cover;
  align-self: auto;
  border: 3px solid var(--subtle-gray);
  border-radius: 16px;
  display: block;
  margin-right: 0.5rem;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px;
  border: 3px solid rgb(239, 182, 77);
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
  padding-left: 0.2rem;
  padding-right: 0.45em;
  background-color: #fddf93;
}
</style>
