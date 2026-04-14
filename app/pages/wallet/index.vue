<script setup lang="ts">
import { Copy, ArrowDownToLine, ArrowUpFromLine } from "@lucide/vue";

definePageMeta({
  layout: "apps"
})

const address = "0x4f2a3b...c831"
const fullAddress = "0x4f2a3b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6c831"

const copied = ref(false)

const copyAddress = async () => {
  await navigator.clipboard.writeText(fullAddress)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

const transactions = [
  { hash: "0x4f2a...c831", type: "deposit", amount: "+5.00", agent: null, time: "2m ago" },
  { hash: "0x9e1b...f320", type: "allocation", amount: "-1.50", agent: "Researcher", time: "5m ago" },
  { hash: "0xb821...3d90", type: "payment", amount: "-0.25", agent: "Purchaser", time: "12m ago" },
  { hash: "0xd419...8a21", type: "allocation", amount: "-0.80", agent: "Comparator", time: "18m ago" },
  { hash: "0xc731...a045", type: "payment", amount: "-0.10", agent: "Researcher", time: "1h ago" },
  { hash: "0xe820...b192", type: "deposit", amount: "+2.00", time: "3h ago" },
]

const typeLabel = (type: string) => {
  if (type === "deposit") return "Deposit"
  if (type === "allocation") return "Agent allocation"
  return "x402 payment"
}
</script>

<template>
  <div class="w-full h-full flex flex-col gap-y-0 overflow-y-auto">

    <!-- Header -->
    <section class="flex flex-col w-full items-center mt-5 gap-y-4">
      <span class="font-sans text-4xl font-regular text-[#121212] opacity-[0.9]">Wallet</span>
      <span class="font-sans text-sm font-regular text-[#555555] opacity-[0.9]">Master wallet · X Layer</span>
    </section>

    <!-- Balance + address -->
    <section class="flex flex-col items-center mt-8 gap-y-2">
      <span class="font-sans text-[11px] font-regular text-[#999999] tracking-widest uppercase">Total balance</span>
      <span class="font-sans text-5xl font-regular text-[#121212] tracking-tight">5.00 <span class="text-2xl text-[#999999]">USDC</span></span>

      <!-- Address pill -->
      <button
        @click="copyAddress"
        class="flex items-center gap-x-2 mt-1 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#D9D9D9] transition-colors duration-150 hover:bg-[#F0F0F0]"
      >
        <span class="font-sans text-xs text-[#555555] font-regular">{{ copied ? "Copied!" : address }}</span>
        <Copy :size="11" color="#999999" :stroke-width="1.5" />
      </button>
    </section>

    <!-- Actions -->
    <section class="flex justify-center gap-x-3 mt-6">
      <button class="flex items-center gap-x-1.5 px-5 py-2 rounded-full bg-[#121212] border border-[#121212]">
        <ArrowDownToLine :size="13" color="#FFFFFF" :stroke-width="1.5" />
        <span class="font-sans text-xs text-[#FFFFFF]">Fund</span>
      </button>
      <button class="flex items-center gap-x-1.5 px-5 py-2 rounded-full bg-[#FFFFFF] border border-[#D9D9D9]">
        <ArrowUpFromLine :size="13" color="#121212" :stroke-width="1.5" />
        <span class="font-sans text-xs text-[#555555]">Withdraw</span>
      </button>
    </section>

    <!-- Allocation breakdown -->
    <section class="flex flex-col items-center mt-8 px-6 gap-y-3 w-full max-w-sm mx-auto">
      <div class="flex justify-between w-full">
        <span class="font-sans text-[11px] text-[#999999] uppercase tracking-widest">Allocation</span>
        <span class="font-sans text-[11px] text-[#999999]">5.00 USDC total</span>
      </div>

      <!-- Bar -->
      <div class="w-full h-1.5 rounded-full bg-[#E5E5E5] overflow-hidden">
        <div class="h-full rounded-full bg-[#121212]" style="width: 70%" />
      </div>

      <div class="flex justify-between w-full">
        <div class="flex items-center gap-x-1.5">
          <div class="w-2 h-2 rounded-full bg-[#121212]" />
          <span class="font-sans text-xs text-[#555555]">In agents · 3.50 USDC</span>
        </div>
        <div class="flex items-center gap-x-1.5">
          <div class="w-2 h-2 rounded-full bg-[#E5E5E5] border border-[#D9D9D9]" />
          <span class="font-sans text-xs text-[#555555]">Free · 1.50 USDC</span>
        </div>
      </div>
    </section>

    <!-- Transaction history -->
    <section class="flex flex-col mt-8 px-6 gap-y-3 w-full max-w-sm mx-auto pb-8">
      <span class="font-sans text-[11px] text-[#999999] uppercase tracking-widest">History</span>

      <div class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden">
        <div
          v-for="(tx, i) in transactions"
          :key="tx.hash"
          class="flex items-center justify-between px-4 py-3"
          :class="i !== transactions.length - 1 ? 'border-b border-[#F0F0F0]' : ''"
        >
          <div class="flex flex-col gap-y-0.5">
            <span class="font-sans text-xs text-[#121212]">{{ typeLabel(tx.type) }}</span>
            <span class="font-sans text-[10px] text-[#999999]">
              {{ tx.agent ? tx.agent + " · " : "" }}{{ tx.hash }} · {{ tx.time }}
            </span>
          </div>
          <span
            class="font-sans text-xs"
            :class="tx.amount.startsWith('+') ? 'text-[#121212]' : 'text-[#999999]'"
          >
            {{ tx.amount }} USDC
          </span>
        </div>
      </div>
    </section>

  </div>
</template>