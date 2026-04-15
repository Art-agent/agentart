<script setup lang="ts">
import { ExternalLink } from "@lucide/vue"

const emit = defineEmits<{ done: [address: string] }>()

const step = ref<"info" | "input">("info")
const address = ref("")
const loading = ref(false)
const error = ref("")

const submit = async () => {
  if (!address.value.trim()) return
  error.value = ""
  loading.value = true

  try {
    alert("Sending wallet address")
    await $fetch("/api/agenticwallet", {
      method: "POST",
      body: { evmAddress: address.value.trim() },
      headers: {
        "Content-type": "application/json",
      }
    })
    emit("done", address.value.trim())
  } catch {
    error.value = "Could not save address. Please try again."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
    <div class="w-full max-w-sm bg-[#FFFFFF] rounded-t-[20px] border border-[#D9D9D9] px-6 pt-5 pb-10 flex flex-col gap-y-5">

      <!-- Info step -->
      <template v-if="step === 'info'">
        <div class="flex flex-col gap-y-1">
          <span class="font-sans text-sm text-[#121212]">Set up your agentic wallet</span>
          <span class="font-sans text-xs text-[#999999]">Art needs an OKX Agentic Wallet to give your agents onchain capabilities.</span>
        </div>

        <div class="flex flex-col gap-y-2 bg-[#F4F4F4] border border-[#E5E5E5] rounded-[10px] px-4 py-3">
          <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">How to get one</span>
          <div class="flex flex-col gap-y-1.5">
            <span class="font-sans text-xs text-[#555555]">1. Open Claude Code, Cursor, or OpenClaw</span>
            <span class="font-sans text-xs text-[#555555]">2. Run <span class="font-mono text-[#121212] bg-[#E5E5E5] px-1 rounded">npx skills add okx/onchainos-skills</span></span>
            <span class="font-sans text-xs text-[#555555]">3. Tell your agent: <span class="italic">Log in to Agentic Wallet with email</span></span>
            <span class="font-sans text-xs text-[#555555]">4. Complete email + OTP verification</span>
            <span class="font-sans text-xs text-[#555555]">5. Copy your EVM address and paste it below</span>
          </div>
        </div>
        <a
          href="https://web3.okx.com/onchainos/dev-docs/wallet/install-your-agentic-wallet"
          target="_blank"
          class="flex items-center gap-x-1 self-start"
        >
          <span class="font-sans text-xs text-[#555555]">Read the full guide</span>
          <ExternalLink :size="11" color="#999999" :stroke-width="1.5" />
        </a>

        <button
          @click="step = 'input'"
          class="w-full py-2.5 rounded-full bg-[#121212] border border-[#121212]"
        >
          <span class="font-sans text-xs text-[#FFFFFF]">I have my wallet</span>
        </button>
      </template>

      <!-- Input step -->
      <template v-else>
        <div class="flex flex-col gap-y-1">
          <span class="font-sans text-sm text-[#121212]">Paste your EVM address</span>
          <span class="font-sans text-xs text-[#999999]">This is the address shown after wallet creation.</span>
        </div>

        <input
          v-model="address"
          type="text"
          placeholder="0x..."
          class="w-full px-3 py-2 rounded-[8px] bg-[#F4F4F4] border border-[#E5E5E5] font-mono text-xs text-[#121212] placeholder-[#CCCCCC] outline-none focus:border-[#121212] transition-colors duration-150"
        />

        <span v-if="error" class="font-sans text-[10px] text-red-400">{{ error }}</span>

        <div class="flex gap-x-2">
          <button
            @click="step = 'info'"
            class="flex-1 py-2.5 rounded-full bg-[#F4F4F4] border border-[#E5E5E5]"
          >
            <span class="font-sans text-xs text-[#555555]">Back</span>
          </button>
          <button
            @click="submit"
            :disabled="!address.trim() || loading"
            class="flex-1 py-2.5 rounded-full transition-all duration-150"
            :class="address.trim() && !loading
              ? 'bg-[#121212] border border-[#121212]'
              : 'bg-[#F4F4F4] border border-[#E5E5E5] cursor-not-allowed'"
          >
            <span
              class="font-sans text-xs"
              :class="address.trim() && !loading ? 'text-[#FFFFFF]' : 'text-[#BBBBBB]'"
            >
              {{ loading ? "Saving..." : "Save wallet" }}
            </span>
          </button>
        </div>
      </template>

    </div>
  </div>
</template>