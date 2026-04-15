# Art

Art is an autonomous agent platform built on X Layer. Users deploy AI agents with onchain wallets, assign them tasks, and let them research, compare, and execute purchases — settling payments via the OKX x402 protocol with zero gas fees.

---

## Architecture Overview

Art is a Nuxt 4 full-stack application with a Nitro server backend, Postgres database via Drizzle ORM, and OKX Onchain OS as the onchain execution layer.

```mermaid
flowchart TD
  User[User <br> Auth0] 
  --> Nuxt[Nuxt 4 Frontend]
  Nuxt --> Nitro[Nitro API Layer]
  Nitro --> DB[(Postgres Database <br> Drizzle ORM)]
  Nitro --> OKX[OKX Onchain OS]
  Nitro --> LangChain[LangChain.js Orchestrator]

  subgraph Database
      DB
  end

  subgraph "OKX Onchain OS"
      OKX_Wallet[Agentic Wallet API <br> Wallet provisioning, sub-wallet derivation]
      OKX_Payment[x402 Payment API <br> Micropayment settlement]
      OKX_Balance[Balance API <br> Live OKB balance sync]
  end

  subgraph "LangChain.js Orchestrator"
      Researcher[Researcher Agent <br> Tavily search, Firecrawl scraping]
      Comparator[Comparator Agent <br> Evaluation, ranking, decision making]
      Purchaser[Purchaser Agent <br> x402 payment execution, tx logging]
  end

Each user has one master Agentic Wallet provisioned via OKX Onchain OS. Up to 50 sub-wallets are derived from the master, one per agent. Private keys are generated and stored inside a TEE — inaccessible to Art, Anthropic, or OKX.

---

## Deployment

| Resource | Address / URL |
|---|---|
| App | https://art-agent.xyz |
| Network | X Layer Mainnet |
| Chain ID | 195 |
| Explorer | https://www.okx.com/explorer/x-layer |

---

## Onchain OS and Uniswap Skill Usage

Art uses three components of the OKX Onchain OS stack:

**Agentic Wallet**
Every user who signs into Art has a non-custodial Agentic Wallet provisioned on first login. The EVM address is stored in the Art database and used as the master funding address. Each agent the user creates is assigned a derived sub-wallet index (0–49), giving it an isolated onchain identity and spend limit.

**x402 Payment Protocol**
When the purchaser agent executes a task, it settles payment via the OKX x402 API — an implementation of the HTTP 402 payment standard designed for machine-to-machine micropayments. Payments are denominated in OKB on X Layer. Every payment writes a transaction record to the Art database and is verifiable on the X Layer block explorer.

**Balance API**
Art polls the OKX Wallet Balance API on every user session load and on a 10-second interval on the wallet page. This keeps the displayed OKB balance current without requiring the user to manually refresh or leave the app.

**Zero Gas**
All OKB transfers and x402 payments on X Layer incur zero gas fees. This makes the per-agent micropayment model economically viable — agents can fire dozens of small payments per task without the cost becoming prohibitive.

---

## How It Works

**1. Sign in**
The user authenticates via Auth0. On first login, Art checks whether they have an Agentic Wallet address stored. If not, a setup modal guides them through provisioning one via OKX Onchain OS using Claude Code, Cursor, or OpenClaw, then prompts them to paste their EVM address.

**2. Create an agent**
The user names an agent, assigns it a role (researcher, comparator, or purchaser), and allocates an OKB budget from their master wallet. Art derives the next available sub-wallet index and creates the agent in the database. The allocated budget is deducted from the user's master balance.

**3. Create a task**
The user describes a task and assigns one or more agents to it. Tasks are submitted via the Art UI. The API immediately returns the task as pending and kicks off the execution engine asynchronously.

**4. Execution**
The LangChain.js orchestrator runs assigned agents in role order: researcher first, then comparator, then purchaser. Each agent receives the full task context plus the output of the preceding agent.

- The researcher uses Tavily and Firecrawl to gather relevant data
- The comparator evaluates options against the task criteria and surfaces a recommendation
- The purchaser checks the agent's remaining OKB budget, then fires an x402 payment via OKX Onchain OS to settle the action onchain

Every agent action writes a log entry to the database. Every x402 payment writes a transaction record with the onchain tx hash.

**5. Results**
Once all agents complete, the task is marked done. The user can view the full execution log, total OKB spent, and link out to each transaction on the X Layer explorer.

---

## Team

| Name | Role | Handle |
|---|---|---|
| Marvellous | Founder, Engineer | 0x_aut |

Art is an independent project built under Prior, an AI holding company structured around multiple independently operating product subsidiaries.

---

## Positioning in the X Layer Ecosystem

Most AI agent platforms treat payments as an afterthought — either abstracting them away entirely or routing through traditional payment rails. Art inverts this. The onchain payment is not a feature of the agent; it is the output. Every task Art executes produces verifiable onchain activity.

X Layer is the right chain for this for three reasons. First, zero gas on OKB transfers makes micropayment-per-action economically viable at the scale agents operate. Second, OKX Onchain OS provides the wallet infrastructure natively — no custom key management, no third-party custody layer. Third, X Layer's EVM compatibility means the full Ethereum tooling ecosystem is available without friction.

Art is positioned as the consumer entry point for agentic commerce on X Layer. The target user is not a crypto-native trader but someone who wants AI to handle research and purchasing decisions on their behalf, with full auditability and without giving an AI system unconstrained access to their funds. The sub-wallet architecture enforces spend limits at the infrastructure level — agents can only spend what they are explicitly allocated.

The longer-term vision is a marketplace of specialized agents, each with an onchain identity and reputation built from their transaction history on X Layer.