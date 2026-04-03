---
sidebar: false
aside: false
editLink: false
lastUpdated: false
---

<script setup>
import { data as items } from './index.data';
</script>

<h1>All Archived</h1>

<ul>
  <li v-for="post of items">
    <a :href="post.url">{{ post.frontmatter.title }}</a>
  </li>
</ul>
