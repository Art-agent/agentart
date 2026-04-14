<!-- pages/agents/[id].vue -->
<script setup lang="ts">
import { Copy, ChevronRight, Trash2 } from "@lucide/vue";

definePageMeta({
  layout: "apps",
})

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

// Mock — will be DB fetch
const agent = ref({
  id: "a1",
  name: "Scout",
  role: "researcher",
  status: "active",
  walletAddress: "0x4f2a3b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6c831",
  shortAddress: "0x4f2a...c831",
  budgetAllocated: 2.00,
  budgetRemaining: 1.60,
  txns: 42,
  lastAction: "Searched Tavily API",
})

const tasks = [
  { id: "t1", name: "Find best USDC yield", status: "running", spent: "0.30", time: "4m ago" },
  { id: "t3", name: "Purchase Tavily API credits", status: "done", spent: "0.85", time: "2h ago" },
  { id: "t4", name: "Scan memecoin sentiment", status: "done", spent: "0.40", time: "5h ago" },
]

// Edit mode
const editing = ref(false)
const editName = ref(agent.value.name)
const editRole = ref(agent.value.role)
const roles = ["researcher", "comparator", "purchaser"]

const saveEdit = () => {
  agent.value.name = editName.value
  agent.value.role = editRole.value
  editing.value = false
}

// Budget allocation
const allocationInput = ref("")
const allocate = () => {
  const amount = parseFloat(allocationInput.value)
  if (isNaN(amount) || amount <= 0) return
  agent.value.budgetAllocated += amount
  agent.value.budgetRemaining += amount
  allocationInput.value = ""
}

// Copy address
const copied = ref(false)
const copyAddress = async () => {
  await navigator.clipboard.writeText(agent.value.walletAddress)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

// Delete
const confirmDelete = ref(false)
const deleteAgent = () => {
  // will wire to API
  router.push("/agents")
}

const statusColor = (status: string) => {
  if (status === "running") return "text-[#121212]"
  if (status === "done") return "text-[#BBBBBB]"
  return "text-[#555555]"
}
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-y-auto">

    <!-- Header -->
    <section class="flex flex-col w-full items-center mt-5 gap-y-1">
      <span class="font-sans text-4xl font-regular text-[#121212] opacity-[0.9]">
        {{ agent.name }}
      </span>
      <span class="font-sans text-sm font-regular text-[#999999] uppercase tracking-widest text-[10px]">
        {{ agent.role }}
      </span>
    </section>

    <div class="flex flex-col mt-8 px-6 gap-y-4 w-full max-w-sm mx-auto pb-10">

      <!-- Wallet -->
      <div class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden">
        <div class="px-4 py-3 border-b border-[#F0F0F0]">
          <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Wallet</span>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <span class="font-sans text-xs text-[#555555]">{{ agent.shortAddress }}</span>
          <button @click="copyAddress" class="flex items-center gap-x-1">
            <span class="font-sans text-[10px] text-[#999999]">{{ copied ? "Copied!" : "Copy" }}</span>
            <Copy :size="11" color="#999999" :stroke-width="1.5" />
          </button>
        </div>
        <div class="flex items-center justify-between px-4 pb-3">
          <span class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Balance</span>
          <span class="font-sans text-xs text-[#121212]">{{ agent.budgetRemaining.toFixed(2) }} USDC</span>
        </div>
      </div>

      <!-- Budget -->
      <div class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden">
        <div class="px-4 py-3 border-b border-[#F0F0F0]">
          <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Budget</span>
        </div>
        <div class="flex flex-col px-4 py-3 gap-y-2">
          <div class="flex justify-between">
            <span class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Allocated</span>
            <span class="font-sans text-xs text-[#121212]">{{ agent.budgetAllocated.toFixed(2) }} USDC</span>
          </div>
          <div class="flex justify-between">
            <span class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Remaining</span>
            <span class="font-sans text-xs text-[#555555]">{{ agent.budgetRemaining.toFixed(2) }} USDC</span>
          </div>
          <div class="w-full h-1 rounded-full bg-[#F0F0F0] mt-1 overflow-hidden">
            <div
              class="h-full rounded-full bg-[#121212]"
              :style="{ width: `${(agent.budgetRemaining / agent.budgetAllocated) * 100}%` }"
            />
          </div>
        </div>
        <!-- Allocate more -->
        <div class="flex items-center gap-x-2 px-4 pb-3">
          <input
            v-model="allocationInput"
            type="number"
            placeholder="Add USDC"
            class="flex-1 px-3 py-1.5 rounded-[8px] bg-[#F4F4F4] border border-[#E5E5E5] font-sans text-xs text-[#121212] placeholder-[#CCCCCC] outline-none focus:border-[#121212] transition-colors duration-150"
          />
          <button
            @click="allocate"
            class="px-3 py-1.5 rounded-[8px] bg-[#121212] border border-[#121212]"
          >
            <span class="font-sans text-xs text-[#FFFFFF]">Allocate</span>
          </button>
        </div>
      </div>

      <!-- Edit -->
      <div class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden">
        <button
          @click="editing = !editing"
          class="flex items-center justify-between px-4 py-3"
        >
          <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Edit agent</span>
          <ChevronRight
            :size="12" color="#CCCCCC" :stroke-width="1.5"
            :style="{ transform: editing ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }"
          />
        </button>
        <Transition name="expand">
          <div v-if="editing" class="flex flex-col gap-y-3 px-4 pb-4 border-t border-[#F0F0F0]">
            <div class="flex flex-col gap-y-1.5 mt-3">
              <span class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Name</span>
              <input
                v-model="editName"
                type="text"
                class="w-full px-3 py-2 rounded-[8px] bg-[#F4F4F4] border border-[#E5E5E5] font-sans text-xs text-[#121212] outline-none focus:border-[#121212] transition-colors duration-150"
              />
            </div>
            <div class="flex flex-col gap-y-1.5">
              <span class="font-sans text-[10px] text-[#BBBBBB] uppercase tracking-widest">Role</span>
              <div class="flex gap-x-2">
                <button
                  v-for="role in roles"
                  :key="role"
                  @click="editRole = role"
                  class="flex-1 py-1.5 rounded-[8px] border font-sans text-[10px] transition-colors duration-150"
                  :class="editRole === role
                    ? 'bg-[#121212] border-[#121212] text-[#FFFFFF]'
                    : 'bg-[#F4F4F4] border-[#E5E5E5] text-[#555555]'"
                >
                  {{ role }}
                </button>
              </div>
            </div>
            <button
              @click="saveEdit"
              class="w-full py-2 rounded-full bg-[#121212] border border-[#121212]"
            >
              <span class="font-sans text-xs text-[#FFFFFF]">Save</span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Task history -->
      <div class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden">
        <div class="px-4 py-3 border-b border-[#F0F0F0]">
          <span class="font-sans text-[10px] text-[#999999] uppercase tracking-widest">Task history</span>
        </div>
        <div
          v-for="(task, i) in tasks"
          :key="task.id"
          class="flex items-center justify-between px-4 py-3"
          :class="i !== tasks.length - 1 ? 'border-b border-[#F0F0F0]' : ''"
        >
          <div class="flex flex-col gap-y-0.5">
            <span
              class="font-sans text-xs"
              :class="task.status === 'done' ? 'text-[#BBBBBB] line-through' : 'text-[#121212]'"
            >
              {{ task.name }}
            </span>
            <span class="font-sans text-[10px] text-[#CCCCCC]">{{ task.time }}</span>
          </div>
          <span class="font-sans text-[10px] text-[#999999]">{{ task.spent }} USDC</span>
        </div>
        <div v-if="tasks.length === 0" class="px-4 py-4">
          <span class="font-sans text-xs text-[#CCCCCC]">No tasks yet</span>
        </div>
      </div>

      <!-- Delete -->
      <div class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] overflow-hidden">
        <button
          @click="confirmDelete = !confirmDelete"
          class="flex items-center justify-between px-4 py-3"
        >
          <span class="font-sans text-[10px] text-[#FF4444] uppercase tracking-widest">Delete agent</span>
          <Trash2 :size="12" color="#FF4444" :stroke-width="1.5" />
        </button>
        <Transition name="expand">
          <div v-if="confirmDelete" class="flex flex-col gap-y-2 px-4 pb-4 border-t border-[#F0F0F0]">
            <p class="font-sans text-xs text-[#999999] mt-3">
              This will remove the agent and deallocate its budget back to your master wallet. This cannot be undone.
            </p>
            <button
              @click="deleteAgent"
              class="w-full py-2 rounded-full bg-[#FF4444] border border-[#FF4444] mt-1"
            >
              <span class="font-sans text-xs text-[#FFFFFF]">Yes, delete</span>
            </button>
            <button
              @click="confirmDelete = false"
              class="w-full py-2 rounded-full bg-[#F4F4F4] border border-[#E5E5E5]"
            >
              <span class="font-sans text-xs text-[#555555]">Cancel</span>
            </button>
          </div>
        </Transition>
      </div>

    </div>
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
  max-height: 400px;
  opacity: 1;
}
</style>