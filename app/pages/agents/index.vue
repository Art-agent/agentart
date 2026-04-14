<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue"
import { Plus } from "@lucide/vue";

definePageMeta({
  layout: "apps",
})

const router = useRouter()

const agents = [
  {
    id: "a1",
    name: "Scout",
    role: "researcher",
    status: "active",
    lastAction: "Searched Tavily API",
    txns: 42,
    budgetAllocated: 2.00,
    budgetRemaining: 1.60,
  },
  {
    id: "a2",
    name: "Judge",
    role: "comparator",
    status: "idle",
    lastAction: "Evaluated 3 options",
    txns: 18,
    budgetAllocated: 1.50,
    budgetRemaining: 1.20,
  },
  {
    id: "a3",
    name: "Closer",
    role: "purchaser",
    status: "running",
    lastAction: "Initiating x402 payment",
    txns: 7,
    budgetAllocated: 1.00,
    budgetRemaining: 0.80,
  },
]

const CARD_WIDTH = 240
const CARD_GAP = 16
const CARD_TOTAL = CARD_WIDTH + CARD_GAP
const DRAG_THRESHOLD = 60
const RESISTANCE = 0.35 // how sticky the drag feels (0 = free, 1 = immovable)

const centeredIndex = ref(0)
const dragOffset = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const hasDragged = ref(false)

const totalCards = computed(() => agents.length + 1) // agents + add card

const getTranslateX = (idx: number) => {
  const baseOffset = (idx - centeredIndex.value) * CARD_TOTAL
  const drag = dragOffset.value * RESISTANCE
  return baseOffset + drag
}

const getScale = (idx: number) => {
  // factor in drag offset to smoothly scale as you drag
  const effectiveDiff = Math.abs(
    (idx - centeredIndex.value) - (dragOffset.value * RESISTANCE) / CARD_TOTAL
  )
  if (effectiveDiff < 0.5) return 1
  if (effectiveDiff < 1.5) return 0.88
  return 0.78
}

const getOpacity = (idx: number) => {
  const effectiveDiff = Math.abs(
    (idx - centeredIndex.value) - (dragOffset.value * RESISTANCE) / CARD_TOTAL
  )
  if (effectiveDiff < 0.5) return 1
  if (effectiveDiff < 1.5) return 0.6
  return 0.35
}

const goTo = (idx: number) => {
  centeredIndex.value = Math.max(0, Math.min(idx, totalCards.value - 1))
  dragOffset.value = 0
}

// Mouse events
const onMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  hasDragged.value = false
  dragStartX.value = e.clientX
  dragOffset.value = 0
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  const delta = e.clientX - dragStartX.value
  if (Math.abs(delta) > 4) hasDragged.value = true
  dragOffset.value = delta
}

const onMouseUp = () => {
  if (!isDragging.value) return
  isDragging.value = false

  if (Math.abs(dragOffset.value) > DRAG_THRESHOLD) {
    const direction = dragOffset.value < 0 ? 1 : -1
    goTo(centeredIndex.value + direction)
  } else {
    // snap back
    dragOffset.value = 0
  }
}

// Touch events
const onTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  hasDragged.value = false
  dragStartX.value = e.touches[0].clientX
  dragOffset.value = 0
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  const delta = e.touches[0].clientX - dragStartX.value
  if (Math.abs(delta) > 4) hasDragged.value = true
  dragOffset.value = delta
  e.preventDefault()
}

const onTouchEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false

  if (Math.abs(dragOffset.value) > DRAG_THRESHOLD) {
    const direction = dragOffset.value < 0 ? 1 : -1
    goTo(centeredIndex.value + direction)
  } else {
    dragOffset.value = 0
  }
}

const handleCardClick = (idx: number) => {
  if (hasDragged.value) return // don't navigate if user was dragging
  if (centeredIndex.value === idx) {
    if (idx >= agents.length) {
      router.push("/agents/new")
    } else {
      router.push(`/agents/${agents[idx].id}`)
    }
  } else {
    goTo(idx)
  }
}

const activeAgentName = computed(() => {
  if (centeredIndex.value >= agents.length) return "New agent"
  return agents[centeredIndex.value]?.name ?? ""
})

onMounted(() => {
  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("mouseup", onMouseUp)
})

onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove)
  window.removeEventListener("mouseup", onMouseUp)
})
</script>

<template>
  <div class="w-full h-full flex flex-col gap-y-0 overflow-hidden">

    <!-- Header -->
    <section class="flex flex-col w-full items-center mt-5 gap-y-1">
      <span class="font-sans text-4xl font-regular text-[#121212] opacity-[0.9]">
        Select your agent
      </span>
      <span class="font-sans text-sm font-regular text-[#555555] opacity-[0.9] transition-all duration-300">
        {{ activeAgentName }}
      </span>
    </section>

    <!-- Carousel -->
    <section
      class="relative flex items-center justify-center h-full overflow-hidden select-none"
      :style="{ cursor: isDragging ? 'grabbing' : 'grab' }"
      @mousedown="onMouseDown"
      @touchstart.passive="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Cards -->
      <div
        v-for="(agent, idx) in agents"
        :key="agent.id"
        :style="{
          position: 'absolute',
          width: `${CARD_WIDTH}px`,
          transform: `translateX(${getTranslateX(idx)}px) scale(${getScale(idx)})`,
          opacity: getOpacity(idx),
          transition: isDragging
            ? 'opacity 150ms ease'
            : 'transform 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease',
          zIndex: centeredIndex === idx ? 10 : 1,
        }"
        @click="handleCardClick(idx)"
      >
        <div
          class="w-full bg-[#FFFFFF] border border-[#D9D9D9] rounded-[14px] overflow-hidden flex flex-col"
          style="height: 280px;"
        >
          <!-- Card top -->
          <div class="flex items-start justify-between px-4 pt-4">
            <div class="flex flex-col gap-y-0.5">
              <span class="font-sans text-lg text-[#121212]">{{ agent.name }}</span>
              <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">{{ agent.role }}</span>
            </div>
            <span
              class="font-sans text-[10px] px-2 py-0.5 rounded-full border"
              :class="{
                'text-[#121212] border-[#D9D9D9] bg-[#F4F4F4]': agent.status === 'idle',
                'text-[#121212] border-[#121212] bg-[#121212]/5': agent.status === 'active',
                'text-[#555555] border-[#D9D9D9] bg-[#F4F4F4]': agent.status === 'running',
              }"
            >
              {{ agent.status }}
            </span>
          </div>

          <!-- Divider -->
          <div class="mx-4 mt-3 border-t border-[#F0F0F0]" />

          <!-- Last action -->
          <div class="flex flex-col px-4 mt-3 gap-y-0.5">
            <span class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Last action</span>
            <span class="font-sans text-xs text-[#555555]">{{ agent.lastAction }}</span>
          </div>

          <!-- Txns -->
          <div class="flex flex-col px-4 mt-3 gap-y-0.5">
            <span class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Transactions</span>
            <span class="font-sans text-xs text-[#121212]">{{ agent.txns }}</span>
          </div>

          <!-- Budget -->
          <div class="flex flex-col px-4 mt-3 gap-y-1.5">
            <div class="flex justify-between">
              <span class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Budget</span>
              <span class="font-sans text-[10px] text-[#999999]">
                {{ agent.budgetRemaining.toFixed(2) }} / {{ agent.budgetAllocated.toFixed(2) }} USDC
              </span>
            </div>
            <div class="w-full h-1 rounded-full bg-[#F0F0F0] overflow-hidden">
              <div
                class="h-full rounded-full bg-[#121212]"
                :style="{ width: `${(agent.budgetRemaining / agent.budgetAllocated) * 100}%` }"
              />
            </div>
          </div>

          <!-- Tap hint -->
          <div class="flex-1 flex items-end justify-center pb-4">
            <span
              class="font-sans text-[10px] text-[#CCCCCC] transition-opacity duration-300"
              :style="{ opacity: centeredIndex === idx ? 1 : 0 }"
            >
              tap to open
            </span>
          </div>
        </div>
      </div>

      <!-- Add agent card -->
      <div
        :style="{
          position: 'absolute',
          width: `${CARD_WIDTH}px`,
          height: '280px',
          transform: `translateX(${getTranslateX(agents.length)}px) scale(${getScale(agents.length)})`,
          opacity: getOpacity(agents.length),
          transition: isDragging
            ? 'opacity 150ms ease'
            : 'transform 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease',
          zIndex: centeredIndex === agents.length ? 10 : 1,
        }"
        @click="handleCardClick(agents.length)"
      >
        <div class="w-full h-full border border-dashed border-[#D9D9D9] rounded-[14px] flex flex-col items-center justify-center gap-y-2">
          <Plus :size="20" color="#CCCCCC" :stroke-width="1.5" />
          <span class="font-sans text-sm text-[#CCCCCC]">Add an agent</span>
        </div>
      </div>

    </section>

  </div>
</template>