<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useSSRContext } from 'vue'

interface ImageSource {
  src: string
  alt: string
}

interface Props {
  href: string
  title?: string
  description?: string
  rel?: string
  class?: string
  variant?: keyof typeof variants
  image?: ImageSource
  icon?: string | ImageSource
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'slate',
})

const localIcons: Record<string, string> = {
  aws: '/assets/icon-aws.png',
}

const resolvedIcon = computed(() => {
  if (!props.icon) return undefined
  if (typeof props.icon !== 'string') return { type: 'image' as const, value: props.icon }
  if (props.icon in localIcons) return { type: 'local' as const, value: localIcons[props.icon] }
  return { type: 'social' as const, value: props.icon }
})

const iconEl = ref<HTMLElement>()

if (import.meta.env.SSR) {
  if (typeof props.icon === 'string' && !(props.icon in localIcons)) {
    useSSRContext<{ vpSocialIcons: Set<string> }>()?.vpSocialIcons.add(props.icon)
  }
}

onMounted(async () => {
  await nextTick()
  const span = iconEl.value
  if (
    span instanceof HTMLElement &&
    span.className.startsWith('vpi-social-') &&
    (getComputedStyle(span).maskImage ||
      getComputedStyle(span).webkitMaskImage) === 'none'
  ) {
    span.style.setProperty(
      '--icon',
      `url('https://api.iconify.design/simple-icons/${props.icon}.svg')`,
    )
  }
})

const variants = {
  slate: {
    border: 'border-slate-200 hover:border-slate-300',
    title: 'text-slate-800',
    description: 'text-slate-500',
  },
  gray: {
    border: 'border-gray-200 hover:border-gray-300',
    title: 'text-gray-800',
    description: 'text-gray-500',
  },
  green: {
    border: 'border-green-200 hover:border-green-300',
    title: 'text-green-800',
    description: 'text-green-500',
  },
  red: {
    border: 'border-red-200 hover:border-red-300',
    title: 'text-red-800',
    description: 'text-red-500',
  },
  blue: {
    border: 'border-blue-200 hover:border-blue-300',
    title: 'text-blue-800',
    description: 'text-blue-500',
  },
  yellow: {
    border: 'border-yellow-200 hover:border-yellow-300',
    title: 'text-yellow-800',
    description: 'text-yellow-500',
  },
  purple: {
    border: 'border-purple-200 hover:border-purple-300',
    title: 'text-purple-800',
    description: 'text-purple-500',
  },
  orange: {
    border: 'border-orange-200 hover:border-orange-300',
    title: 'text-orange-800',
    description: 'text-orange-500',
  },
  aws: {
    border: 'border-orange-200 hover:border-orange-300',
    title: 'text-orange-800',
    description: 'text-orange-500',
  },
  npm: {
    border: 'border-red-200 hover:border-red-300',
    title: 'text-red-800',
    description: 'text-red-500',
  },
  google: {
    border: 'border-blue-200 hover:border-blue-300',
    title: 'text-blue-800',
    description: 'text-blue-500',
  },
  github: {
    border: 'border-slate-200 hover:border-slate-300',
    title: 'text-slate-800',
    description: 'text-slate-500',
  },
} as const

const currentVariant = computed(() => variants[props.variant])

const displayUrl = computed(() =>
  props.href.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/.html$/, '').replace(/\/$/, ''),
)
</script>

<template>
  <a
    :href="href"
    target="_blank"
    :rel="rel ?? 'nofollow noopener noreferrer'"
    :class="[
      'group block w-full max-w-3xl my-5 overflow-hidden rounded-2xl border bg-white not-prose shadow-sm transition hover:shadow',
      currentVariant.border,
      $props.class,
    ]"
  >
    <div class="flex flex-col sm:flex-row">
      <!-- Bottom/Left content -->
      <div class="flex flex-1 flex-col min-w-0 gap-2 px-5 py-4 order-2 sm:order-1">
        <span
          v-if="title"
          :class="['text-[16px] font-bold leading-snug', currentVariant.title]"
        >
          {{ title }}
        </span>

        <p
          v-if="description"
          :class="['text-[14px] leading-snug', currentVariant.description]"
        >
          {{ description }}
        </p>

        <div class="flex flex-row items-center gap-2">
          <img
            v-if="resolvedIcon?.type === 'local'"
            :src="resolvedIcon.value as string"
            :alt="icon as string"
            class="h-5 w-5 flex-none rounded-sm"
            loading="lazy"
            height="10"
            width="10"
          />
          <span
            v-else-if="resolvedIcon?.type === 'social'"
            ref="iconEl"
            :class="`vpi-social-${icon} link-block-icon`"
          />
          <img
            v-else-if="resolvedIcon?.type === 'image'"
            :src="(icon as ImageSource).src"
            :alt="(icon as ImageSource).alt"
            class="h-5 w-5 flex-none rounded-sm"
            loading="lazy"
            height="10"
            width="10"
          />

          <span class="min-w-0 truncate text-[12px] font-light">
            {{ displayUrl }}
          </span>
        </div>
      </div>

      <!-- Top/Right image -->
      <div
        v-if="image"
        class="relative sm:w-[36%] sm:min-w-[220px] sm:max-w-[340px] flex-none order-1 sm:order-2"
      >
        <img
          :src="image.src"
          :alt="image.alt"
          class="h-full w-full max-h-[250px] sm:max-h-full object-cover"
          loading="lazy"
          height="200"
          width="200"
        />
      </div>
    </div>
  </a>
</template>

<style scoped>
a {
  font-weight: inherit;
  color: inherit;
  text-decoration: none;
  border-bottom: none;
  transition: none;
}

a:hover {
  color: inherit;
  text-decoration: none;
  border-bottom: none;
}

.link-block-icon {
  width: 20px;
  height: 20px;
  flex: none;
  fill: currentColor;
}

p {
  margin: 0;
  line-height: inherit;
}

img {
  margin: 0;
  border-radius: inherit;
  display: block;
}
</style>
