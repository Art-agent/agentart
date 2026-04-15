<script setup lang="ts">

definePageMeta({
  layout: "apps"
})

const showWalletModal = ref(false)
const evmWalletAddress = ref<string | null>(null)

const timeOfDay = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
})

// Mock user
const userName = "Marvellous"

// Stats
const stats = [
  { label: "Agents", value: "3" },
  { label: "Tasks", value: "12" },
  { label: "Transactions", value: "67" },
  { label: "Spent", value: "$2.05" },
]

// Status line
const activeAgents = 2
const runningTasks = 1

// Activity feed — mixed tasks + txns
const activity = [
  {
    id: "1",
    type: "task_running",
    title: "Find best USDC yield",
    meta: "Scout · started 4m ago",
    amount: null,
  },
  {
    id: "2",
    type: "txn",
    title: "x402 payment",
    meta: "Scout · 0x4f2a...c831 · 2m ago",
    amount: "-0.50 USDC",
  },
  {
    id: "3",
    type: "txn",
    title: "x402 payment",
    meta: "Judge · 0x9e1b...f320 · 18m ago",
    amount: "-0.10 USDC",
  },
  {
    id: "4",
    type: "task_done",
    title: "Purchase Tavily API credits",
    meta: "Closer · completed 2h ago",
    amount: "-0.85 USDC",
  },
  {
    id: "5",
    type: "txn",
    title: "Deposit",
    meta: "Master wallet · 3h ago",
    amount: "+5.00 USDC",
  },
  {
    id: "6",
    type: "task_done",
    title: "Scan memecoin sentiment",
    meta: "Scout · Judge · completed 5h ago",
    amount: "-0.40 USDC",
  },
  {
    id: "7",
    type: "txn",
    title: "x402 payment",
    meta: "Judge · 0xe820...b192 · 4h ago",
    amount: "-0.10 USDC",
  },
]

const activityIcon = (type: string) => {
  if (type === "task_running") return "running"
  if (type === "task_done") return "done"
  return "txn"
}

async function checkForAgenticWallet() {
  const { hasAgenticWallet, evmAddress } = await $fetch('/api/agenticwallet', {
    method: "GET"
  })
  // alert(hasAgenticWallet)
  // alert(evmAddress)
  if (!hasAgenticWallet) { 
    showWalletModal.value = true
  } else {
    evmWalletAddress.value = evmAddress
  }
}

onMounted(async() => {
  await checkForAgenticWallet()
})
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-y-auto">
    <WalletSetupModal
      v-if="showWalletModal"
      @done="(addr) => { evmWalletAddress = addr; showWalletModal = false }"
    />
    <!-- Header -->
    <section class="flex flex-col w-full items-center mt-5 gap-y-1">
      <span class="font-sans text-4xl font-regular text-[#121212] opacity-[0.9]">
        {{ timeOfDay }}
      </span>
      <span class="font-sans text-sm font-regular text-[#555555] opacity-[0.9]">
        {{ userName }}
      </span>
    </section>

    <!-- Stats grid -->
    <section class="grid grid-cols-4 gap-x-2 mt-8 px-6 w-full max-w-sm mx-auto">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex flex-col items-center py-3 bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] gap-y-0.5"
      >
        <span class="font-sans text-lg text-[#121212]">{{ stat.value }}</span>
        <span class="font-sans text-[9px] text-[#BBBBBB] uppercase tracking-widest">{{ stat.label }}</span>
      </div>
    </section>

    <!-- Status line -->
    <section class="flex justify-center mt-5 px-6">
      <div class="flex items-center gap-x-2 px-4 py-2 bg-[#FFFFFF] border border-[#D9D9D9] rounded-full">
        <span class="w-1.5 h-1.5 rounded-full bg-[#121212] animate-pulse" />
        <span class="font-sans text-xs text-[#555555]">
          {{ activeAgents }} agent{{ activeAgents !== 1 ? "s" : "" }} active
          <span class="text-[#CCCCCC] mx-1">·</span>
          {{ runningTasks }} task{{ runningTasks !== 1 ? "s" : "" }} running
        </span>
      </div>
    </section>

    <!-- Activity feed -->
    <section class="flex flex-col mt-6 px-6 gap-y-3 w-full max-w-sm mx-auto pb-8">
      <span class="font-sans text-[11px] text-[#999999] uppercase tracking-widest">
        Recent activity
      </span>

      <div class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden">
        <div
          v-for="(item, i) in activity"
          :key="item.id"
          class="flex items-center justify-between px-4 py-3"
          :class="i !== activity.length - 1 ? 'border-b border-[#F0F0F0]' : ''"
        >
          <!-- Left: indicator + text -->
          <div class="flex items-start gap-x-3">

            <!-- Indicator dot -->
            <div class="mt-1 shrink-0">
              <!-- running task -->
              <span
                v-if="activityIcon(item.type) === 'running'"
                class="block w-1.5 h-1.5 rounded-full bg-[#121212] animate-pulse"
              />
              <!-- done task -->
              <span
                v-else-if="activityIcon(item.type) === 'done'"
                class="block w-1.5 h-1.5 rounded-full bg-[#CCCCCC]"
              />
              <!-- txn -->
              <span
                v-else
                class="block w-1.5 h-1.5 rounded-full border border-[#D9D9D9]"
              />
            </div>

            <div class="flex flex-col gap-y-0.5">
              <span
                class="font-sans text-xs"
                :class="item.type === 'task_done' ? 'text-[#BBBBBB]' : 'text-[#121212]'"
              >
                {{ item.title }}
              </span>
              <span class="font-sans text-[10px] text-[#CCCCCC]">{{ item.meta }}</span>
            </div>
          </div>

          <!-- Right: amount -->
          <span
            v-if="item.amount"
            class="font-sans text-[10px] shrink-0 ml-3"
            :class="item.amount.startsWith('+') ? 'text-[#121212]' : 'text-[#999999]'"
          >
            {{ item.amount }}
          </span>
        </div>
      </div>
    </section>

  </div>
</template>