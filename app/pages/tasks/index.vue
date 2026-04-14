<script setup lang="ts">
import { Plus, X, ChevronDown, ChevronUp, ArrowUpRight } from "@lucide/vue";

definePageMeta({
  layout: "apps"
})

const showModal = ref(false)
const expandedTask = ref<string | null>(null)

// Mock agents the user has created
const userAgents = [
  { id: "a1", name: "Scout", role: "researcher" },
  { id: "a2", name: "Judge", role: "comparator" },
  { id: "a3", name: "Closer", role: "purchaser" },
]

// New task form
const newTask = reactive({
  name: "",
  description: "",
  selectedAgents: [] as string[],
})

const toggleAgent = (id: string) => {
  const idx = newTask.selectedAgents.indexOf(id)
  if (idx === -1) newTask.selectedAgents.push(id)
  else newTask.selectedAgents.splice(idx, 1)
}

const canSubmit = computed(() =>
  newTask.name.trim().length > 0 && newTask.selectedAgents.length > 0
)

const submitTask = () => {
  if (!canSubmit.value) return
  // will wire to API later
  showModal.value = false
  newTask.name = ""
  newTask.description = ""
  newTask.selectedAgents = []
}

const tasks = [
  {
    id: "t1",
    name: "Find best USDC yield on X Layer",
    description: "Research and compare top yield protocols, then allocate 1 USDC.",
    status: "running",
    agents: ["Scout", "Judge"],
    txns: 3,
    spent: "0.30",
    lastAction: "Scout scanning Firecrawl...",
    createdAt: "4m ago",
  },
  {
    id: "t2",
    name: "Compare gas bridge options",
    description: "Find cheapest bridge from ETH mainnet to X Layer.",
    status: "pending",
    agents: ["Scout"],
    txns: 0,
    spent: "0.00",
    lastAction: null,
    createdAt: "10m ago",
  },
  {
    id: "t3",
    name: "Purchase Tavily API credits",
    description: "Buy $0.50 of Tavily credits via x402.",
    status: "done",
    agents: ["Scout", "Judge", "Closer"],
    txns: 7,
    spent: "0.85",
    lastAction: "Closer settled · 0x4f2a...c831",
    createdAt: "2h ago",
  },
  {
    id: "t4",
    name: "Scan memecoin sentiment",
    description: "Research top 5 trending tokens on BNB Chain.",
    status: "done",
    agents: ["Scout", "Judge"],
    txns: 4,
    spent: "0.40",
    lastAction: "Judge evaluation complete",
    createdAt: "5h ago",
  },
]

const running = computed(() => tasks.filter(t => t.status === "running"))
const pending = computed(() => tasks.filter(t => t.status === "pending"))
const done = computed(() => tasks.filter(t => t.status === "done"))

const toggleExpand = (id: string) => {
  expandedTask.value = expandedTask.value === id ? null : id
}

const statusLabel = (status: string) => {
  if (status === "running") return "Running"
  if (status === "pending") return "Pending"
  return "Done"
}
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-y-auto">

    <!-- Header -->
    <section class="flex flex-col w-full items-center mt-5 gap-y-4">
      <span class="font-sans text-4xl font-regular text-[#121212] opacity-[0.9]">Tasks</span>
      <span class="font-sans text-sm font-regular text-[#555555] opacity-[0.9]">
        {{ tasks.length }} total · {{ running.length }} running
      </span>
    </section>

    <!-- New task button -->
    <section class="flex justify-center mt-6">
      <button
        @click="showModal = true"
        class="flex items-center gap-x-1.5 px-5 py-2 rounded-full bg-[#121212] border border-[#121212]"
      >
        <Plus :size="13" color="#FFFFFF" :stroke-width="1.5" />
        <span class="font-sans text-xs text-[#FFFFFF]">New task</span>
      </button>
    </section>

    <!-- Task sections -->
    <section class="flex flex-col mt-8 px-6 gap-y-8 w-full max-w-sm mx-auto pb-8">

      <!-- Running -->
      <div v-if="running.length > 0" class="flex flex-col gap-y-3">
        <span class="font-sans text-[11px] text-[#999999] uppercase tracking-widest">Running</span>
        <div
          v-for="task in running"
          :key="task.id"
          class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden"
        >
          <button
            @click="toggleExpand(task.id)"
            class="flex items-start justify-between px-4 py-3 w-full text-left gap-x-3"
          >
            <div class="flex flex-col gap-y-1 flex-1">
              <div class="flex items-center gap-x-2">
                <!-- running dot -->
                <span class="w-1.5 h-1.5 rounded-full bg-[#121212] animate-pulse" />
                <span class="font-sans text-xs text-[#121212]">{{ task.name }}</span>
              </div>
              <span class="font-sans text-[10px] text-[#999999]">
                {{ task.agents.join(" · ") }} · {{ task.createdAt }}
              </span>
              <span v-if="task.lastAction" class="font-sans text-[10px] text-[#555555] italic">
                {{ task.lastAction }}
              </span>
            </div>
            <ChevronDown v-if="expandedTask !== task.id" :size="12" color="#999999" :stroke-width="1.5" class="mt-0.5 shrink-0" />
            <ChevronUp v-else :size="12" color="#999999" :stroke-width="1.5" class="mt-0.5 shrink-0" />
          </button>
          <Transition name="expand">
            <div
              v-if="expandedTask === task.id"
              class="flex flex-col gap-y-2 px-4 py-3 border-t border-[#F0F0F0] bg-[#FAFAFA]"
            >
              <p class="font-sans text-[11px] text-[#555555]">{{ task.description }}</p>
              <div class="flex justify-between mt-1">
                <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Txns</span>
                <span class="font-sans text-[10px] text-[#555555]">{{ task.txns }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Spent</span>
                <span class="font-sans text-[10px] text-[#555555]">{{ task.spent }} USDC</span>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Pending -->
      <div v-if="pending.length > 0" class="flex flex-col gap-y-3">
        <span class="font-sans text-[11px] text-[#999999] uppercase tracking-widest">Pending</span>
        <div
          v-for="task in pending"
          :key="task.id"
          class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden"
        >
          <button
            @click="toggleExpand(task.id)"
            class="flex items-start justify-between px-4 py-3 w-full text-left gap-x-3"
          >
            <div class="flex flex-col gap-y-1 flex-1">
              <div class="flex items-center gap-x-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[#D9D9D9]" />
                <span class="font-sans text-xs text-[#121212]">{{ task.name }}</span>
              </div>
              <span class="font-sans text-[10px] text-[#999999]">
                {{ task.agents.join(" · ") }} · {{ task.createdAt }}
              </span>
            </div>
            <ChevronDown v-if="expandedTask !== task.id" :size="12" color="#999999" :stroke-width="1.5" class="mt-0.5 shrink-0" />
            <ChevronUp v-else :size="12" color="#999999" :stroke-width="1.5" class="mt-0.5 shrink-0" />
          </button>
          <Transition name="expand">
            <div
              v-if="expandedTask === task.id"
              class="flex flex-col gap-y-2 px-4 py-3 border-t border-[#F0F0F0] bg-[#FAFAFA]"
            >
              <p class="font-sans text-[11px] text-[#555555]">{{ task.description }}</p>
              <div class="flex justify-between mt-1">
                <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Agents</span>
                <span class="font-sans text-[10px] text-[#555555]">{{ task.agents.join(", ") }}</span>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Done -->
      <div v-if="done.length > 0" class="flex flex-col gap-y-3">
        <span class="font-sans text-[11px] text-[#999999] uppercase tracking-widest">Done</span>
        <div
          v-for="task in done"
          :key="task.id"
          class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden"
        >
          <button
            @click="toggleExpand(task.id)"
            class="flex items-start justify-between px-4 py-3 w-full text-left gap-x-3"
          >
            <div class="flex flex-col gap-y-1 flex-1">
              <div class="flex items-center gap-x-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[#AAAAAA]" />
                <span class="font-sans text-xs text-[#999999] line-through">{{ task.name }}</span>
              </div>
              <span class="font-sans text-[10px] text-[#BBBBBB]">
                {{ task.agents.join(" · ") }} · {{ task.createdAt }}
              </span>
            </div>
            <ChevronDown v-if="expandedTask !== task.id" :size="12" color="#CCCCCC" :stroke-width="1.5" class="mt-0.5 shrink-0" />
            <ChevronUp v-else :size="12" color="#CCCCCC" :stroke-width="1.5" class="mt-0.5 shrink-0" />
          </button>
          <Transition name="expand">
            <div
              v-if="expandedTask === task.id"
              class="flex flex-col gap-y-2 px-4 py-3 border-t border-[#F0F0F0] bg-[#FAFAFA]"
            >
              <p class="font-sans text-[11px] text-[#999999]">{{ task.description }}</p>
              <div class="flex justify-between mt-1">
                <span class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Txns</span>
                <span class="font-sans text-[10px] text-[#999999]">{{ task.txns }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Spent</span>
                <span class="font-sans text-[10px] text-[#999999]">{{ task.spent }} USDC</span>
              </div>
              <div class="flex justify-between">
                <span class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Last action</span>
                <span class="font-sans text-[10px] text-[#999999]">{{ task.lastAction }}</span>
              </div>
              <button
                class="flex items-center gap-x-1 mt-1 self-end"
              >
                <span class="font-sans text-[10px] text-[#999999]">View in explorer</span>
                <ArrowUpRight :size="11" color="#999999" :stroke-width="1.5" />
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="tasks.length === 0"
        class="flex justify-center items-center py-16"
      >
        <span class="font-sans text-sm text-[#999999]">No tasks yet</span>
      </div>

    </section>

    <!-- Modal -->
    <Transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
        @click.self="showModal = false"
      >
        <Transition name="sheet">
          <div
            v-if="showModal"
            class="w-full max-w-sm bg-[#FFFFFF] rounded-t-[20px] border border-[#D9D9D9] px-6 pt-5 pb-10 flex flex-col gap-y-5"
          >

            <!-- Modal header -->
            <div class="flex items-center justify-between">
              <span class="font-sans text-sm text-[#121212]">New task</span>
              <button @click="showModal = false">
                <X :size="16" color="#999999" :stroke-width="1.5" />
              </button>
            </div>

            <!-- Task name -->
            <div class="flex flex-col gap-y-1.5">
              <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Task name</span>
              <input
                v-model="newTask.name"
                type="text"
                placeholder="e.g. Find best USDC yield"
                class="w-full px-3 py-2 rounded-[8px] bg-[#F4F4F4] border border-[#E5E5E5] font-sans text-xs text-[#121212] placeholder-[#BBBBBB] outline-none focus:border-[#121212] transition-colors duration-150"
              />
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-y-1.5">
              <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Description <span class="normal-case text-[#CCCCCC]">(optional)</span></span>
              <textarea
                v-model="newTask.description"
                placeholder="What should your agents do?"
                rows="3"
                class="w-full px-3 py-2 rounded-[8px] bg-[#F4F4F4] border border-[#E5E5E5] font-sans text-xs text-[#121212] placeholder-[#BBBBBB] outline-none focus:border-[#121212] transition-colors duration-150 resize-none"
              />
            </div>

            <!-- Agent picker -->
            <div class="flex flex-col gap-y-1.5">
              <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Assign agents</span>
              <div class="flex flex-col gap-y-2">
                <button
                  v-for="agent in userAgents"
                  :key="agent.id"
                  @click="toggleAgent(agent.id)"
                  class="flex items-center justify-between px-3 py-2.5 rounded-[8px] border transition-colors duration-150"
                  :class="newTask.selectedAgents.includes(agent.id)
                    ? 'bg-[#121212] border-[#121212]'
                    : 'bg-[#F4F4F4] border-[#E5E5E5]'"
                >
                  <div class="flex flex-col items-start gap-y-0">
                    <span
                      class="font-sans text-xs transition-colors duration-150"
                      :class="newTask.selectedAgents.includes(agent.id) ? 'text-[#FFFFFF]' : 'text-[#121212]'"
                    >
                      {{ agent.name }}
                    </span>
                    <span
                      class="font-sans text-[10px] transition-colors duration-150"
                      :class="newTask.selectedAgents.includes(agent.id) ? 'text-[#AAAAAA]' : 'text-[#999999]'"
                    >
                      {{ agent.role }}
                    </span>
                  </div>
                  <div
                    class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-150"
                    :class="newTask.selectedAgents.includes(agent.id)
                      ? 'bg-[#FFFFFF] border-[#FFFFFF]'
                      : 'bg-transparent border-[#D9D9D9]'"
                  >
                    <div
                      v-if="newTask.selectedAgents.includes(agent.id)"
                      class="w-2 h-2 rounded-full bg-[#121212]"
                    />
                  </div>
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button
              @click="submitTask"
              :disabled="!canSubmit"
              class="w-full py-2.5 rounded-full font-sans text-xs transition-all duration-150"
              :class="canSubmit
                ? 'bg-[#121212] text-[#FFFFFF] border border-[#121212]'
                : 'bg-[#F4F4F4] text-[#BBBBBB] border border-[#E5E5E5] cursor-not-allowed'"
            >
              Create task
            </button>

          </div>
        </Transition>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 200ms ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 200px;
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
.sheet-enter-to,
.sheet-leave-from {
  transform: translateY(0);
}
</style>