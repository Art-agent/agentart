<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, reactive, watch } from "vue"
import { Plus, X } from "@lucide/vue"

definePageMeta({
  layout: "apps",
})

const router = useRouter()

// ── Types ──
interface Agent {
  id: string
  name: string
  role: "researcher" | "comparator" | "purchaser"
  status: "active" | "idle" | "running"
  lastAction: string
  txns: number
  budgetAllocated: number
  budgetRemaining: number
}

// ── Data ──
const agents = ref<Agent[]>([
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
])

// ── Carousel Config ──
const CARD_WIDTH = 240
const CARD_GAP = 16
const CARD_TOTAL = CARD_WIDTH + CARD_GAP
const DRAG_THRESHOLD = 60
const RESISTANCE = 0.35

const centeredIndex = ref(0)
const dragOffset = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const hasDragged = ref(false)

// ── Creation State ──
const isCreating = ref(false)
const isSubmitting = ref(false)
const newAgentForm = reactive({
  name: '',
  roles: [] as ('researcher' | 'comparator' | 'purchaser')[],
  budget: 0
})

const roleLabels: Record<string, string> = {
  researcher: 'Researcher',
  comparator: 'Comparator',
  purchaser: 'Purchaser'
}

const totalCards = computed(() => agents.value.length + 1)

// If user swipes away from the add-card while creating, cancel the form
watch(centeredIndex, (newIdx) => {
  if (newIdx !== agents.value.length && isCreating.value) {
    cancelCreate()
  }
})

const getTranslateX = (idx: number) => {
  const baseOffset = (idx - centeredIndex.value) * CARD_TOTAL
  const drag = dragOffset.value * RESISTANCE
  return baseOffset + drag
}

const getScale = (idx: number) => {
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

const toggleRole = (role: 'researcher' | 'comparator' | 'purchaser') => {
  const idx = newAgentForm.roles.indexOf(role)
  if (idx > -1) {
    newAgentForm.roles.splice(idx, 1)
  } else {
    newAgentForm.roles.push(role)
  }
}

const isRoleSelected = (role: string) => newAgentForm.roles.includes(role as any)

// ── Input Handlers ──
const onMouseDown = (e: MouseEvent) => {
  if (isCreating.value) return
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
    dragOffset.value = 0
  }
}

const onTouchStart = (e: TouchEvent) => {
  if (isCreating.value) return
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
  if (hasDragged.value) return
  
  if (centeredIndex.value === idx) {
    if (idx >= agents.value.length) {
      isCreating.value = true
      history.pushState({}, '', '/agents/new')
    } else {
      router.push(`/agents/${agents.value[idx].id}`)
    }
  } else {
    goTo(idx)
  }
}

const cancelCreate = () => {
  isCreating.value = false
  newAgentForm.name = ''
  newAgentForm.roles = []
  newAgentForm.budget = 0
  history.pushState({}, '', '/agents')
}

const createAgent = async () => {
  if (!newAgentForm.name || newAgentForm.budget <= 0 || newAgentForm.roles.length === 0) return
  
  isSubmitting.value = true
  try {
    const created = await $fetch('/api/agents', {
      method: 'POST',
      body: {
        name: newAgentForm.name,
        roles: newAgentForm.roles,
        budgetAllocated: newAgentForm.budget,
        budgetRemaining: newAgentForm.budget
      }
    })
    
    agents.value.push({
      id: created.id,
      name: created.name,
      role: created.roles[0] || 'researcher',
      status: 'idle',
      lastAction: 'Created',
      txns: 0,
      budgetAllocated: created.budgetAllocated,
      budgetRemaining: created.budgetRemaining
    })
    
    cancelCreate()
    router.push(`/agents/${created.id}`)
  } catch (err) {
    console.error('Failed to create agent:', err)
    alert('Failed to create agent. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const activeAgentName = computed(() => {
  if (centeredIndex.value >= agents.value.length) {
    return isCreating.value ? "New agent" : "Add an agent"
  }
  return agents.value[centeredIndex.value]?.name ?? ""
})

onMounted(() => {
  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("mouseup", onMouseUp)
  
  if (window.location.pathname.includes('/agents/new')) {
    nextTick(() => {
      goTo(agents.value.length)
      isCreating.value = true
    })
  }
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
      :style="{ cursor: isDragging ? 'grabbing' : isCreating ? 'default' : 'grab' }"
      @mousedown="onMouseDown"
      @touchstart.passive="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Agent Cards -->
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

      <!-- Add / Create Agent Card -->
      <div
        :style="{
          position: 'absolute',
          width: `${CARD_WIDTH}px`,
          height: isCreating ? '380px' : '280px',
          transform: `translateX(${getTranslateX(agents.length)}px) scale(${isCreating ? 1.02 : getScale(agents.length)})`,
          opacity: getOpacity(agents.length),
          transition: isDragging
            ? 'opacity 150ms ease, height 300ms ease'
            : 'transform 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease, height 300ms cubic-bezier(0.4,0,0.2,1)',
          zIndex: centeredIndex === agents.length ? 20 : 1,
        }"
      >
        <!-- Idle State: Add Button -->
        <div
          v-if="!isCreating"
          @click="handleCardClick(agents.length)"
          class="w-full h-full border border-dashed border-[#D9D9D9] rounded-[14px] flex flex-col items-center justify-center gap-y-2 cursor-pointer hover:border-[#999999] transition-colors bg-[#FFFFFF]"
        >
          <Plus :size="20" color="#555555" :stroke-width="1.5" />
          <span class="font-sans text-sm text-[#555555]">Add an agent</span>
        </div>

        <!-- Active State: Creation Form -->
        <div
          v-else
          class="w-full h-full bg-[#FFFFFF] border border-[#121212] rounded-[14px] flex flex-col p-3 shadow-lg"
        >
          <!-- Form Header -->
          <div class="flex items-center justify-between mb-5">
            <div class="flex flex-col gap-y-0.5">
              <span class="font-sans text-lg text-[#121212]">New Agent</span>
              <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Configuration</span>
            </div>
            <button 
              @click.stop="cancelCreate" 
              class="p-1.5 rounded-full hover:bg-[#F4F4F4] transition-colors text-[#999999] hover:text-[#121212]"
            >
              <X :size="16" :stroke-width="1.5" />
            </button>
          </div>

          <!-- Name Input -->
          <div class="flex flex-col gap-y-1.5 mb-4">
            <label class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Agent Name</label>
            <input
              v-model="newAgentForm.name"
              type="text"
              placeholder="e.g., Research Bot"
              class="w-full px-1 py-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg font-sans text-sm text-[#121212] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#121212] focus:bg-[#FFFFFF] transition-all"
            >
          </div>

          <!-- Role Selection - Multi-select Pills -->
          <div class="flex flex-col gap-y-1.5 mb-4">
            <label class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Capabilities</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="r in ['researcher', 'comparator', 'purchaser']"
                :key="r"
                @click.stop="toggleRole(r)"
                :class="[
                  'px-1.5 py-1 rounded-full border font-sans text-[10px] transition-all',
                  isRoleSelected(r)
                    ? 'border-[#121212] bg-[#121212] text-white shadow-sm'
                    : 'border-[#E5E5E5] text-[#555555] hover:border-[#999999] bg-[#FFFFFF]'
                ]"
              >
                {{ roleLabels[r] }}
              </button>
            </div>
          </div>

          <!-- Budget Input -->
          <div class="flex flex-col gap-y-1.5 mb-5">
            <label class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Budget Allocation</label>
            <div class="relative">
              <input
                v-model.number="newAgentForm.budget"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                class="w-full px-1.5 py-1.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg font-sans text-sm text-[#121212] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#121212] focus:bg-[#FFFFFF] transition-all"
              >
              <span class="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-xs text-[#999999]">OKB</span>
            </div>
          </div>

          <!-- Create Button - Compact -->
          <button
            @click.stop="createAgent"
            :disabled="isSubmitting || !newAgentForm.name || newAgentForm.budget <= 0 || newAgentForm.roles.length === 0"
            class="mt-auto w-full py-2 bg-[#121212] text-white font-sans text-xs font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2a2a2a] active:scale-[0.98] transition-all"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center gap-x-2">
              <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              Creating...
            </span>
            <span v-else>Create Agent</span>
          </button>
        </div>
      </div>

    </section>

  </div>
</template>