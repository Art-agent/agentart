<script setup lang="ts">
import { ArrowUpRight, ChevronDown, ChevronUp } from "@lucide/vue";

definePageMeta({
  layout: "apps"
})

const activeAgent = ref("all")
const activeType = ref("all")
const expandedTx = ref<string | null>(null)

const agents = ["all", "Researcher", "Comparator", "Purchaser"]
const types = ["all", "payment", "allocation", "deposit"]

const transactions = [
  {
    hash: "0x4f2a3b9c...c831",
    fullHash: "0x4f2a3b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6c831",
    agent: "Researcher",
    type: "payment",
    amount: "-0.50",
    time: "2m ago",
    block: "4821903",
    status: "confirmed"
  },
  {
    hash: "0x9e1b7f...f320",
    fullHash: "0x9e1b7f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8ef320",
    agent: "Comparator",
    type: "payment",
    amount: "-0.10",
    time: "18m ago",
    block: "4821887",
    status: "confirmed"
  },
  {
    hash: "0xb8213d...3d90",
    fullHash: "0xb8213d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c3d90",
    agent: "Purchaser",
    type: "payment",
    amount: "-0.25",
    time: "1h ago",
    block: "4821801",
    status: "confirmed"
  },
  {
    hash: "0xd4198a...8a21",
    fullHash: "0xd4198a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f8a21",
    agent: "Researcher",
    type: "allocation",
    amount: "-1.50",
    time: "2h ago",
    block: "4821644",
    status: "confirmed"
  },
  {
    hash: "0xc731a0...a045",
    fullHash: "0xc731a04b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0fa045",
    agent: null,
    type: "deposit",
    amount: "+5.00",
    time: "3h ago",
    block: "4821500",
    status: "confirmed"
  },
  {
    hash: "0xe820b1...b192",
    fullHash: "0xe820b14c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0ab192",
    agent: "Comparator",
    type: "payment",
    amount: "-0.10",
    time: "4h ago",
    block: "4821390",
    status: "confirmed"
  },
]

const filtered = computed(() => transactions.filter(tx => {
  const agentMatch = activeAgent.value === "all" || tx.agent === activeAgent.value
  const typeMatch = activeType.value === "all" || tx.type === activeType.value
  return agentMatch && typeMatch
}))

const totalTxns = transactions.length
const totalVolume = transactions
  .filter(t => t.amount.startsWith("-"))
  .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)
  .toFixed(2)

const mostActive = computed(() => {
  const counts: Record<string, number> = {}
  transactions.forEach(t => { if (t.agent) counts[t.agent] = (counts[t.agent] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
})

const typeLabel = (type: string) => {
  if (type === "deposit") return "Deposit"
  if (type === "allocation") return "Allocation"
  return "x402 payment"
}

const toggleExpand = (hash: string) => {
  expandedTx.value = expandedTx.value === hash ? null : hash
}

const openExplorer = (hash: string) => {
  window.open(`https://www.okx.com/explorer/x-layer/tx/${hash}`, "_blank")
}
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-y-auto">

    <!-- Header -->
    <section class="flex flex-col w-full items-center mt-5 gap-y-4">
      <span class="font-sans text-4xl font-regular text-[#121212] opacity-[0.9]">Explorer</span>
      <span class="font-sans text-sm font-regular text-[#555555] opacity-[0.9]">Your onchain activity · X Layer</span>
    </section>

    <!-- Stats strip -->
    <section class="flex justify-center gap-x-2 mt-8 px-6">
      <div class="flex flex-col items-center px-5 py-3 bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] gap-y-0.5">
        <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Transactions</span>
        <span class="font-sans text-xl text-[#121212]">{{ totalTxns }}</span>
      </div>
      <div class="flex flex-col items-center px-5 py-3 bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] gap-y-0.5">
        <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Volume</span>
        <span class="font-sans text-xl text-[#121212]">{{ totalVolume }} <span class="text-sm text-[#999999]">USDC</span></span>
      </div>
      <div class="flex flex-col items-center px-5 py-3 bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] gap-y-0.5">
        <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Most active</span>
        <span class="font-sans text-xl text-[#121212]">{{ mostActive }}</span>
      </div>
    </section>

    <!-- Filters -->
    <section class="flex flex-col items-center mt-6 gap-y-3 px-6">

      <!-- Agent filter -->
      <div class="flex gap-x-2 flex-wrap justify-center">
        <button
          v-for="agent in agents"
          :key="agent"
          @click="activeAgent = agent"
          class="px-3 py-1 rounded-full text-xs font-sans border transition-colors duration-150"
          :class="activeAgent === agent
            ? 'bg-[#121212] border-[#121212] text-[#FFFFFF]'
            : 'bg-[#FFFFFF] border-[#D9D9D9] text-[#555555]'"
        >
          {{ agent === "all" ? "All agents" : agent }}
        </button>
      </div>

      <!-- Type filter -->
      <div class="flex gap-x-2 flex-wrap justify-center">
        <button
          v-for="type in types"
          :key="type"
          @click="activeType = type"
          class="px-3 py-1 rounded-full text-xs font-sans border transition-colors duration-150"
          :class="activeType === type
            ? 'bg-[#121212] border-[#121212] text-[#FFFFFF]'
            : 'bg-[#FFFFFF] border-[#D9D9D9] text-[#555555]'"
        >
          {{ type === "all" ? "All types" : typeLabel(type) }}
        </button>
      </div>
    </section>

    <!-- Transaction list -->
    <section class="flex flex-col mt-6 px-6 gap-y-2 w-full max-w-sm mx-auto pb-8">
      <div
        v-if="filtered.length === 0"
        class="flex justify-center items-center py-12"
      >
        <span class="font-sans text-sm text-[#999999]">No transactions found</span>
      </div>

      <div
        v-for="tx in filtered"
        :key="tx.hash"
        class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden"
      >
        <!-- Row -->
        <button
          @click="toggleExpand(tx.hash)"
          class="flex items-center justify-between px-4 py-3 w-full text-left"
        >
          <div class="flex flex-col gap-y-0.5">
            <span class="font-sans text-xs text-[#121212]">{{ typeLabel(tx.type) }}</span>
            <span class="font-sans text-[10px] text-[#999999]">
              {{ tx.agent ? tx.agent + " · " : "" }}{{ tx.hash }} · {{ tx.time }}
            </span>
          </div>
          <div class="flex items-center gap-x-2">
            <span
              class="font-sans text-xs"
              :class="tx.amount.startsWith('+') ? 'text-[#121212]' : 'text-[#999999]'"
            >
              {{ tx.amount }} USDC
            </span>
            <ChevronDown
              v-if="expandedTx !== tx.hash"
              :size="12" color="#999999" :stroke-width="1.5"
            />
            <ChevronUp
              v-else
              :size="12" color="#999999" :stroke-width="1.5"
            />
          </div>
        </button>

        <!-- Expanded detail -->
        <Transition name="expand">
          <div
            v-if="expandedTx === tx.hash"
            class="flex flex-col gap-y-2 px-4 py-3 border-t border-[#F0F0F0] bg-[#FAFAFA]"
          >
            <div class="flex justify-between">
              <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Full hash</span>
              <span class="font-sans text-[10px] text-[#555555] break-all text-right max-w-[180px]">{{ tx.fullHash }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Block</span>
              <span class="font-sans text-[10px] text-[#555555]">#{{ tx.block }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Status</span>
              <span class="font-sans text-[10px] text-[#121212]">{{ tx.status }}</span>
            </div>
            <button
              @click="openExplorer(tx.fullHash)"
              class="flex items-center gap-x-1 mt-1 self-end"
            >
              <span class="font-sans text-[10px] text-[#555555]">View on X Layer</span>
              <ArrowUpRight :size="11" color="#555555" :stroke-width="1.5" />
            </button>
          </div>
        </Transition>
      </div>
    </section>

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
</style>