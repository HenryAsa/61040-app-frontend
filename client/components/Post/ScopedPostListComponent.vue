<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchPostForm from "./SearchPostForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["activity_id"]);

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");

async function getPostsInScope(author?: string) {
  let query: Record<string, string> = author !== undefined ? { scope: props.activity_id, author: author } : { scope: props.activity_id };
  let postResults;
  try {
    // postResults = await fetchy("/api/postsByScopeId", "GET", { query, alert: false });
    postResults = await fetchy("/api/postsSearchByUsernameInScopeId", "GET", { query, alert: false });
  } catch (_) {
    return;
  }
  posts.value = postResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getPostsInScope();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn" class="create-post">
    <h2>Create a post:</h2>
    <CreatePostForm :scope="props.activity_id" @refreshPosts="getPostsInScope" />
  </section>
  <div class="row">
    <h2 v-if="!searchAuthor">Posts:</h2>
    <h2 v-else>Posts by {{ searchAuthor }}:</h2>
    <SearchPostForm v-model="searchAuthor" @getPostsByAuthor="getPostsInScope" />
  </div>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="getPostsInScope" @editPost="updateEditing" />
      <EditPostForm v-else :post="post" @refreshPosts="getPostsInScope" @editPost="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
.create-post {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding-bottom: 2em;
  border-radius: 16px;
  border-color: 3px solid black;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border: 3px solid;
  border-color: darkgray;
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 1em;
  flex-wrap: wrap;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
