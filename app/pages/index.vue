<script setup lang="ts">
definePageMeta({
  layout: "home"
})

</script>

<template>
  <div class="bg-[#F4F4F4] flex justify-center w-screen h-screen">
    <section class="w-225 gap-y-3 border-t-0 border-b-0 flex flex-col items-center">
      <span class="font-sans text-4xl font-regular text-center w-100 leading-10 text-[#121212]">Deploy AI agents that research, decide, and pay autonomously, onchain.</span>
      <div class="flex gap-x-2 items-center">
        <a href="/auth/login?returnTo=/home" returnTo="/home" class="flex items-center justify-center bg-[#121210] opacity-[0.80] rounded-lg border border-0.5 border-[#D9D9D9] h-7 pl-3.5 pr-3.5 py-1">
          <span class="font-sans text-xs font-normal text-[#FFFFFF]">Try for free</span>
        </a>
        <a href="/auth/logout" class="bg-[#FFFFFF] border border-[#D9D9D9] rounded-lg flex justify-center items-center h-7 pl-3.5 pr-3.5 py-1">
          <span class="font-sans text-xs font-normal text-[#121212]">Watch demo</span>
        </a>
      </div>
    </section>
  </div>
</template>