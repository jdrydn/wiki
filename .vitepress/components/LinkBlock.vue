<script setup lang="ts">
const props = withDefaults(defineProps<{
  href: string,
  title?: string
  description?: string
  rel?: string
}>(), {})
</script>

<template>
  <a
    :href="href"
    target="_blank"
    :rel="rel ?? 'nofollow noopener noreferrer'"
    class="link-block"
  >
    <div>
      <div>
        <span v-if="title">
          {{ title }}
        </span>

        <p v-if="description" className="text-[15px] leading-snug">
          {{ description }}
        </p>

        <div className="mt-auto flex items-center gap-2">
          <span className="min-w-0 truncate text-[15px] font-light">
            {{ href.replace(/^http(s)?:\/\//, '').replace(/^www./, '') }}
          </span>
        </div>
      </div>
    </div>
  </a>
</template>

<style scoped>
.link-block {
  display: block;
  margin: 20px 0;
}
</style>
