// composables/useOKXWallet.ts
export const useOKXWallet = () => {

  const isInstalled = () => {
    return typeof window !== "undefined" && !!window.okxwallet
  }

  const connect = async (): Promise<string | null> => {
    if (!isInstalled()) return null
    const accounts = await window.okxwallet.request({
      method: "eth_requestAccounts"
    })
    return accounts?.[0] ?? null
  }

  const switchToXLayer = async () => {
    try {
      await window.okxwallet.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xC3" }], // 195 in hex = X Layer mainnet
      })
    } catch (err: any) {
      // Chain not added yet — add it
      if (err.code === 4902) {
        await window.okxwallet.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0xC3",
            chainName: "X Layer Mainnet",
            nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
            rpcUrls: ["https://rpc.xlayer.tech"],
            blockExplorerUrls: ["https://www.okx.com/explorer/x-layer"],
          }]
        })
      }
    }
  }

  const fundWallet = async (
    toAddress: string,
    amountOkb: number
  ): Promise<string> => {
    if (!isInstalled()) throw new Error("OKX Wallet not installed")

    const fromAddress = await connect()
    if (!fromAddress) throw new Error("Could not connect wallet")

    await switchToXLayer()

    // Convert OKB amount to hex wei
    const amountWei = BigInt(Math.floor(amountOkb * 1e18))
    const amountHex = "0x" + amountWei.toString(16)

    const txHash = await window.okxwallet.request({
      method: "eth_sendTransaction",
      params: [{
        from: fromAddress,
        to: toAddress,
        value: amountHex,
        gas: "0x5208", // 21000 — standard transfer
      }]
    })

    return txHash
  }

  return { isInstalled, connect, switchToXLayer, fundWallet }
}