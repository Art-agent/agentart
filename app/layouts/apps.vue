<script setup lang="ts">
import { 
  House, Box,
  SquareCheck, WalletCards,
  Telescope,
} from "@lucide/vue";

const route = useRoute()

const tabs = [
  { path: '/home', label: 'Home', icon: House },
  { path: '/agents', label: 'Agents', icon: Box },
  { path: '/tasks', label: 'Tasks', icon: SquareCheck },
  { path: '/wallet', label: 'Wallet', icon: WalletCards },
  { path: '/explorer', label: 'Explorer', icon: Telescope },
]

const activeIndex = computed(() =>
  tabs.findIndex(tab => route.path.startsWith(tab.path))
)

// pill width + gap — must match the tab's w-13 (52px) + gap-x-1 (4px)
const PILL_WIDTH = 52
const GAP = 4

const pillOffset = computed(() =>
  activeIndex.value >= 0 ? activeIndex.value * (PILL_WIDTH + GAP) : 0
)

const user = useUser();

// console.log(user.value)
</script>

<template>
  <main class="flex flex-col items-center bg-[#F4F4F4] h-screen w-screen pt-3 overflow-hidden">
    <nav class="flex gap-x-2 bg-transparent">
      <!-- Avatar -->
      <a href="/auth/logout" class="flex items-center justify-center rounded-full p-0.5 bg-[#FFFFFF] border border-[#D9D9D9]">
        <NuxtImg :src="user.picture" class="flex items-center justify-center rounded-full w-8.5 h-8.5" />
      </a>

      <!-- Tab strip -->
      <div class="relative flex items-center h-10 w-auto px-1 gap-x-1 rounded-full bg-[#FFFFFF] border border-[#D9D9D9]">

        <!-- Sliding pill — sits behind the links -->
        <div
          class="absolute top-0.75 left-1 h-8 w-13 rounded-full bg-[#121210] opacity-90 pointer-events-none"
          :style="{
            transform: `translateX(${pillOffset}px)`,
            transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          }"
        />

        <!-- Tabs -->
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          class="relative z-10 flex flex-col justify-center items-center rounded-full min-w-12 w-13 h-8 pt-0.5 py-px gap-y-0 border-0 transition-colors duration-200"
        >
          <component
            :is="tab.icon"
            :size="16"
            :color="route.path.startsWith(tab.path) ? '#FFFFFF' : '#121212'"
            :stroke-width="1.5"
            class="transition-colors duration-200"
          />
          <span
            class="font-sans text-[10px] transition-colors duration-200"
            :class="route.path.startsWith(tab.path) ? 'text-[#FFFFFF]' : 'text-[#555555]'"
          >
            {{ tab.label }}
          </span>
        </NuxtLink>
      </div>

      <!-- Fund button -->
      <div class="flex items-center h-10 w-auto px-1 gap-x-1 rounded-full bg-[#FFFFFF] border border-[#D9D9D9]">
        <button class="flex bg-[#121210] opacity-90 flex-col justify-center items-center rounded-full min-w-12 pl-3 pr-3 h-8 py-px gap-y-0">
          <span class="font-sans text-xs text-[#FFFFFF]">Fund</span>
        </button>
      </div>

    </nav>
    <div class="flex-1 h-screen w-full overflow-y-scroll noscrollbar">
      <NuxtPage />
    </div>
  </main>
</template>