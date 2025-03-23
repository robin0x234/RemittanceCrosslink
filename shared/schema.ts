import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

// Currencies
export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  parachainName: text("parachain_name").notNull(),
  parachainId: text("parachain_id").notNull(),
});

export const insertCurrencySchema = createInsertSchema(currencies).pick({
  code: true,
  name: true,
  symbol: true,
  parachainName: true,
  parachainId: true,
});

// Exchange rates
export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  sourceCurrencyId: integer("source_currency_id").notNull(),
  targetCurrencyId: integer("target_currency_id").notNull(),
  rate: doublePrecision("rate").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).pick({
  sourceCurrencyId: true,
  targetCurrencyId: true,
  rate: true,
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  sourceAmount: doublePrecision("source_amount").notNull(),
  sourceCurrencyId: integer("source_currency_id").notNull(),
  targetAmount: doublePrecision("target_amount").notNull(),
  targetCurrencyId: integer("target_currency_id").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  fee: doublePrecision("fee").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  sourceAmount: true,
  sourceCurrencyId: true,
  targetAmount: true,
  targetCurrencyId: true,
  recipientAddress: true,
  fee: true,
  status: true,
  txHash: true,
});

// Liquidity pools
export const liquidityPools = pgTable("liquidity_pools", {
  id: serial("id").primaryKey(),
  sourceCurrencyId: integer("source_currency_id").notNull(),
  targetCurrencyId: integer("target_currency_id").notNull(),
  totalLiquidity: doublePrecision("total_liquidity").notNull(),
  dailyVolume: doublePrecision("daily_volume").notNull(),
  apy: doublePrecision("apy").notNull(),
});

export const insertLiquidityPoolSchema = createInsertSchema(liquidityPools).pick({
  sourceCurrencyId: true,
  targetCurrencyId: true,
  totalLiquidity: true,
  dailyVolume: true,
  apy: true,
});

// Liquidity positions
export const liquidityPositions = pgTable("liquidity_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  poolId: integer("pool_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLiquidityPositionSchema = createInsertSchema(liquidityPositions).pick({
  userId: true,
  poolId: true,
  amount: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type LiquidityPool = typeof liquidityPools.$inferSelect;
export type InsertLiquidityPool = z.infer<typeof insertLiquidityPoolSchema>;

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  details: text("details").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  userId: true,
  action: true, 
  details: true
});

export type LiquidityPosition = typeof liquidityPositions.$inferSelect;
export type InsertLiquidityPosition = z.infer<typeof insertLiquidityPositionSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
