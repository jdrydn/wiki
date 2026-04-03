---
sidebar: false
aside: false
editLink: false
lastUpdated: false
---

<script setup>
import { data as items } from './Entries/index.data';
</script>

# James's Wiki

> "If you're not learning, you're not moving forwards."

Reference documents on things I've learned, use regularly, or keep having to look up. Focused on CLI tooling, Git, AWS,
and TypeScript/Node - but anything goes.

If something tripped me up, cost me an afternoon, or turned out to be simpler than I expected, it probably ended up
here.

## Table of Contents

<ul>
  <li v-for="post of items">
    <a :href="post.url">{{ post.frontmatter.title }}</a>
  </li>
</ul>

## What's in here

Most documents follow the same pattern: quick examples first, explanation second. This is a cheat sheet, not a
tutorial - if you need deep background, the upstream references are usually linked at the top of each document.

Topics lean towards:

- **CLI & Terminal** — one-liners, shell tricks, tools I reach for daily
- **Git & version control** — workflows, commands, conventions, etc
- **AWS & cloud infrastructure** — services, patterns, tradeoffs I've worked through
- **TypeScript & Node** — syntax references, gotchas, setup decisions

## Why a public wiki

Partly so I can find things again. Partly because if I had to figure it out, someone else probably does too.

Everything here reflects how I actually work - opinionated in places, incomplete in others. If something's wrong or out
of date, please open an issue.

The information in this repository is **public-knowledge** or **AI-generated**, there are no private knowledge or
company-specific details.

## Archived

Some items are [archived](./Archived/) - typically because I've not needed them in a very long time.
