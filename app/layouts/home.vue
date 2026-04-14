<template>
  <main class="flex flex-col items-center gap-y-3 w-screen bg-[#F4F4F4]">
    <nav class="flex items-center justify-between py-2 w-225">
      <div class="flex gap-x-0">
        <NuxtImg 
          src="../assets/images/Agentart-logo.png"
          alt="Art logo"
          quality="100"
          width="24"
          height="24"
          class=""
        />
        <div class="flex items-center">
          <Logotext class="mt-1" />
        </div>  
      </div>
      <div class="flex gap-y-2 bg-transparent">
        <button class="flex items-center justify-center bg-[#121210] opacity-[0.80] rounded-lg border border-0.5 border-[#D9D9D9] h-7 pl-3.5 pr-3.5 py-1">
          <span class="font-sans text-xs font-normal text-[#FFFFFF]">Sign in</span>
        </button>
      </div>
    </nav>
    <NuxtPage />
  </main>
</template>