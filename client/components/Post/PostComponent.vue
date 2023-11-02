<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import MiniUserView from "../User/MiniUserView.vue";

const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};
</script>

<template>
  <div class="user">
    <MiniUserView :user="props.post.author" />
    <div class="timestamp">
      <div class="date-bubble">
        <span class="time-label">Created:</span>
        <p>{{ formatDate(props.post.dateCreated) }}</p>
      </div>
      <div class="date-bubble" v-if="props.post.dateCreated !== props.post.dateUpdated">
        <span class="time-label">Last Edited:</span>
        <p>{{ formatDate(props.post.dateUpdated) }}</p>
      </div>
    </div>
  </div>
  <p class="author">{{ props.post.author.username }}</p>
  <p>{{ props.post.content }}</p>
  <div class="base">
    <menu v-if="props.post.author.username == currentUsername">
      <li><button class="btn-small pure-button" @click="emit('editPost', props.post._id)">Edit</button></li>
      <li><button class="button-error btn-small pure-button" @click="deletePost">Delete</button></li>
    </menu>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.user {
  display: flex;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  flex-direction: column;
  /* justify-content: flex-end; */
  font-size: 0.9em;
  /* font-style: italic; */
}

.time-label {
  font-weight: bold;
}

.date-bubble {
  text-align: center;
  margin-left: 1em;
  /* justify-content: space-between; */
  margin-top: 0.1em;
  padding: 0.25em;
  border: 2px solid royalblue;
  border-radius: 8px;
  background-color: lightblue;
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
