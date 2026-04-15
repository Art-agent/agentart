<script setup lang="ts">
import { ArrowUpRight, ChevronDown, ChevronUp } from "@lucide/vue";

definePageMeta({
  layout: "apps",
});

// Filters
const activeAgent = ref("all");
const activeType = ref("all");
const expandedTx = ref<string | null>(null);

const agentsList = ["all", "Researcher", "Comparator", "Purchaser"];
const types = ["all", "payment", "allocation", "deposit"];

// Data
const transactions = ref<any[]>([]);
const loading = ref(true);

// Fetch transactions from /api/explorer
const fetchTransactions = async () => {
  try {
    loading.value = true;
    const data = await $fetch("/api/explorer", { method: "GET" });
    transactions.value = data;
  } catch (err) {
    console.error("Failed to fetch explorer data:", err);
    transactions.value = [];
  } finally {
    loading.value = false;
  }
};

// Computed
const filtered = computed(() => {
  return transactions.value.filter((tx) => {
    const agentMatch = activeAgent.value === "all" || tx.agent === activeAgent.value;
    const typeMatch = activeType.value === "all" || tx.type === activeType.value;
    return agentMatch && typeMatch;
  });
});

const totalTxns = computed(() => transactions.value.length);

const totalVolume = computed(() => {
  return transactions.value
    .filter((t) => t.amount.startsWith("-"))
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)
    .toFixed(2);
});

const mostActive = computed(() => {
  const counts: Record<string, number> = {};
  transactions.value.forEach((t) => {
    if (t.agent) counts[t.agent] = (counts[t.agent] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
});

const typeLabel = (type: string) => {
  if (type === "deposit") return "Deposit";
  if (type === "allocation") return "Allocation";
  return "x402 payment";
};

const toggleExpand = (hash: string) => {
  expandedTx.value = expandedTx.value === hash ? null : hash;
};

const openExplorer = (fullHash: string) => {
  if (!fullHash) return;
  window.open(`https://www.okx.com/explorer/x-layer/tx/${fullHash}`, "_blank");
};

onMounted(() => {
  fetchTransactions();
});
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-y-auto pb-8">
    <!-- Header -->
    <section class="flex flex-col w-full items-center mt-5 gap-y-4">
      <span class="font-sans text-4xl font-regular text-[#121212] opacity-[0.9]">
        Explorer
      </span>
      <span class="font-sans text-sm font-regular text-[#555555] opacity-[0.9]">
        Your onchain activity · X Layer
      </span>
    </section>

    <!-- Stats Strip -->
    <section class="flex justify-center gap-x-2 mt-8 px-6">
      <div class="flex flex-col items-center px-5 py-3 bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] gap-y-0.5 flex-1 max-w-[110px]">
        <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Transactions</span>
        <span class="font-sans text-xl text-[#121212]">{{ totalTxns }}</span>
      </div>
      <div class="flex flex-col items-center px-5 py-3 bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] gap-y-0.5 flex-1 max-w-[110px]">
        <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Volume</span>
        <span class="flex gap-x-0.5 justify-end items-center font-sans text-xl text-[#121212]">
          {{ totalVolume }} <span class="mt-1 flex items-end text-sm text-[#999999]">OKB</span>
        </span>
      </div>
      <div class="flex flex-col items-center px-5 py-3 bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] gap-y-0.5 flex-1 max-w-[110px]">
        <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Most active</span>
        <span class="font-sans text-xl text-[#121212]">{{ mostActive }}</span>
      </div>
    </section>

    <!-- Filters -->
    <section class="flex flex-col items-center mt-6 gap-y-3 px-6">
      <!-- Agent Filter -->
      <div class="flex gap-x-2 flex-wrap justify-center">
        <button
          v-for="agent in agentsList"
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

      <!-- Type Filter -->
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

    <!-- Transaction List -->
    <section class="flex flex-col mt-6 px-6 gap-y-2 w-full max-w-sm mx-auto">
      <div v-if="loading" class="flex justify-center py-12">
        <span class="font-sans text-sm text-[#999999]">Loading transactions...</span>
      </div>

      <div v-else-if="filtered.length === 0" class="flex justify-center items-center py-12">
        <span class="font-sans text-sm text-[#999999]">No transactions found</span>
      </div>

      <!-- Transaction Cards -->
      <div
        v-for="tx in filtered"
        :key="tx.hash"
        class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden"
      >
        <!-- Main Row -->
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
              {{ tx.amount }} OKB
            </span>
            <ChevronDown
              v-if="expandedTx !== tx.hash"
              :size="12"
              color="#999999"
              :stroke-width="1.5"
            />
            <ChevronUp
              v-else
              :size="12"
              color="#999999"
              :stroke-width="1.5"
            />
          </div>
        </button>

        <!-- Expanded Details -->
        <Transition name="expand">
          <div
            v-if="expandedTx === tx.hash"
            class="flex flex-col gap-y-2 px-4 py-3 border-t border-[#F0F0F0] bg-[#FAFAFA]"
          >
            <div class="flex justify-between">
              <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Full hash</span>
              <span class="font-sans text-[10px] text-[#555555] break-all text-right max-w-[180px]">
                {{ tx.fullHash }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Status</span>
              <span class="font-sans text-[10px] text-[#121212]">{{ tx.status }}</span>
            </div>
            <button
              @click="openExplorer(tx.fullHash)"
              class="flex items-center gap-x-1 mt-2 self-end"
            >
              <span class="font-sans text-[10px] text-[#555555]">View on X Layer Explorer</span>
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
  max-height: 180px;
  opacity: 1;
}
</style>