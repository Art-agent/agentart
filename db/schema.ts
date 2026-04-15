// db/schema.ts
import { pgTable, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { nanoid } from "nanoid"

// ── Enums ──
export const agentStatusEnum = pgEnum("agent_status", ["active", "idle", "running"])
export const taskStatusEnum = pgEnum("task_status", ["pending", "running", "done", "failed"])
export const txTypeEnum = pgEnum("tx_type", ["deposit", "allocation", "payment", "withdrawal"])

// ── Users ──
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  auth0Id: text("auth0_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  picture: text("picture"),
  agenticWalletAddress: text("agentic_wallet_address"),
  balanceOkb: real("balance_okb").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ── Agents ──
export const agents = pgTable("agents", {
  id: text("id").primaryKey().$defaultFn(() => `agent_${nanoid(12)}`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Array of roles: can be any combination of researcher, comparator, purchaser
  roles: text("roles").array().notNull().default([]),
  status: agentStatusEnum("status").default("idle").notNull(),
  subWalletIndex: integer("sub_wallet_index").notNull(),
  subWalletAddress: text("sub_wallet_address"),
  budgetAllocated: real("budget_allocated").default(0).notNull(),
  budgetRemaining: real("budget_remaining").default(0).notNull(),
  lastAction: text("last_action"),
  txCount: integer("tx_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ── Tasks ──
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => `task_${nanoid(12)}`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("pending").notNull(),
  assignedAgentIds: text("assigned_agent_ids").array().notNull().default([]),
  result: text("result"),
  totalSpent: real("total_spent").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ── Task logs ──
export const taskLogs = pgTable("task_logs", {
  id: text("id").primaryKey().$defaultFn(() => `log_${nanoid(12)}`),
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  agentId: text("agent_id").references(() => agents.id, { onDelete: "set null" }),
  message: text("message").notNull(),
  txHash: text("tx_hash"),
  amountOkb: real("amount_okb"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ── Transactions ──
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => `tx_${nanoid(12)}`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentId: text("agent_id").references(() => agents.id, { onDelete: "set null" }),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),
  txHash: text("tx_hash"),
  type: txTypeEnum("type").notNull(),
  amountOkb: real("amount_okb").notNull(),
  chain: text("chain").default("x-layer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ── Type Exports ──
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Agent = typeof agents.$inferSelect
export type NewAgent = typeof agents.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert