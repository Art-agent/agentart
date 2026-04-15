<script setup lang="ts">
const { isInstalled, fundWallet } = useOKXWallet()
// const { sync } = useBalance()

const emit = defineEmits<{ close: [state: boolean] }>()


const balance = ref("");
const amount = ref("")
const loading = ref(false)
const txHash = ref<string | null>(null)
const error = ref("")

// Pull from your Pinia store / user data
const agenticWalletAddressValue = ref<string|null>(null); // user's agentic wallet address

const fund = async () => {
  error.value = ""
  txHash.value = null
  loading.value = true

  try {
    const hash = await fundWallet(agenticWalletAddressValue.value, parseFloat(amount.value))
    txHash.value = hash
    // Poll balance update after tx
    setTimeout(balance, 4000)
    setTimeout(balance, 10000)
    emit("close", false)
  } catch (err: any) {
    error.value = err.message ?? "Transaction failed"
  } finally {
    loading.value = false
  }
}

onMounted(async() => {
  const { agenticWalletAddress, balanceOkb } = await $fetch('/api/wallet', {
    method: 'GET'
  })
  agenticWalletAddressValue.value = agenticWalletAddress;
  balance.value = balanceOkb
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
    <div class="w-full max-w-sm bg-[#FFFFFF] rounded-t-[20px] border border-[#D9D9D9] px-6 pt-5 pb-10 flex flex-col gap-y-5">

      <!-- Header -->
      <div class="flex flex-col gap-y-1">
        <span class="font-sans text-sm text-[#121212]">Fund your Agentic Wallet</span>
        <span class="font-sans text-xs text-[#999999]">Send OKB to your OKX Agentic Wallet</span>
      </div>

      <!-- OKX Wallet not installed warning -->
      <div v-if="!isInstalled()" class="flex flex-col gap-y-2 bg-[#F4F4F4] border border-[#E5E5E5] rounded-[10px] px-4 py-3">
        <span class="font-sans text-xs text-[#555555]">
          OKX Wallet extension not detected. Install it to fund directly from your browser.
        </span>
        <a
          href="https://www.okx.com/web3/wallet"
          target="_blank"
          class="font-sans text-xs text-[#121212] underline"
        >
          Get OKX Wallet →
        </a>
      </div>

      <!-- Main Funding Form -->
      <template v-else>
        <!-- Current Balance -->
        <div class="flex justify-between items-center bg-[#F4F4F4] border border-[#E5E5E5] rounded-[10px] px-4 py-3">
          <span class="font-sans text-xs text-[#999999]">Current Balance</span>
          <span class="font-sans text-sm font-medium text-[#121212]">
            {{ balance || "0.00" }} OKB
          </span>
        </div>

        <!-- Amount Input -->
        <div class="flex items-center gap-x-2">
          <input
            v-model="amount"
            type="number"
            min="0.001"
            step="0.001"
            placeholder="0.00"
            class="flex-1 px-3 py-2 rounded-[8px] bg-[#F4F4F4] border border-[#E5E5E5] font-sans text-xs text-[#121212] placeholder-[#CCCCCC] outline-none focus:border-[#121212] transition-colors duration-150"
          />
          <span class="font-sans text-xs text-[#999999] whitespace-nowrap">OKB</span>
        </div>

        <!-- Fund Button -->
        <button
          @click="fund"
          :disabled="!amount || loading"
          class="w-full py-2.5 rounded-full transition-all duration-150"
          :class="amount && !loading
            ? 'bg-[#121212] border border-[#121212]'
            : 'bg-[#F4F4F4] border border-[#E5E5E5] cursor-not-allowed'"
        >
          <span
            class="font-sans text-xs"
            :class="amount && !loading ? 'text-[#FFFFFF]' : 'text-[#BBBBBB]'"
          >
            {{ loading ? "Confirm in OKX Wallet..." : "Fund Wallet" }}
          </span>
        </button>

        <!-- Transaction Success -->
        <div v-if="txHash" class="flex flex-col gap-y-1 pt-2">
          <span class="font-sans text-[10px] text-[#121212]">Transaction submitted successfully</span>
          <a
            :href="`https://www.okx.com/explorer/x-layer/tx/${txHash}`"
            target="_blank"
            class="font-sans text-[10px] text-[#999999] underline break-all"
          >
            {{ txHash }}
          </a>
        </div>

        <!-- Error Message -->
        <span v-if="error" class="font-sans text-[10px] text-red-400">{{ error }}</span>
      </template>

      <!-- Close Button -->
      <button
        @click="emit('close', false)"
        class="w-full py-2.5 rounded-full bg-[#F4F4F4] border border-[#E5E5E5] mt-2"
      >
        <span class="font-sans text-xs text-[#555555]">Close</span>
      </button>

    </div>
  </div>
</template>