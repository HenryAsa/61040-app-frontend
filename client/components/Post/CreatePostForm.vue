<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");

const props = defineProps(["scope"]);
const emit = defineEmits(["refreshPosts"]);

const createPost = async (content: string) => {
  console.log(props.scope);
  let query: Record<string, string> = props.scope !== undefined ? { content: content, scope: props.scope } : { content: content };
  try {
    await fetchy("/api/posts", "POST", {
      body: query,
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createPost(content)">
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
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
  border: 3px solid darkgray;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 8px;
  resize: none;
}
label {
  font-weight: bold;
}
</style>
