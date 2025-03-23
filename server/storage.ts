import {
  users, User, InsertUser,
  currencies, Currency, InsertCurrency,
  exchangeRates, ExchangeRate, InsertExchangeRate,
  transactions, Transaction, InsertTransaction,
  liquidityPools, LiquidityPool, InsertLiquidityPool,
  liquidityPositions, LiquidityPosition, InsertLiquidityPosition,
  auditLogs, AuditLog, InsertAuditLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Currency methods
  getCurrencies(): Promise<Currency[]>;
  getCurrencyById(id: number): Promise<Currency | undefined>;
  getCurrencyByCode(code: string): Promise<Currency | undefined>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;

  // Exchange rate methods
  getExchangeRates(): Promise<ExchangeRate[]>;
  getExchangeRate(sourceCurrencyId: number, targetCurrencyId: number): Promise<ExchangeRate | undefined>;
  createExchangeRate(rate: InsertExchangeRate): Promise<ExchangeRate>;

  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string, txHash?: string): Promise<Transaction | undefined>;

  // Liquidity pool methods
  getLiquidityPools(): Promise<LiquidityPool[]>;
  getLiquidityPoolById(id: number): Promise<LiquidityPool | undefined>;
  createLiquidityPool(pool: InsertLiquidityPool): Promise<LiquidityPool>;
  updateLiquidityPool(id: number, updates: Partial<LiquidityPool>): Promise<LiquidityPool | undefined>;

  // Liquidity position methods
  getLiquidityPositions(): Promise<LiquidityPosition[]>;
  getLiquidityPositionsByUserId(userId: number): Promise<LiquidityPosition[]>;
  createLiquidityPosition(position: InsertLiquidityPosition): Promise<LiquidityPosition>;
  updateLiquidityPosition(id: number, amount: number): Promise<LiquidityPosition | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Currency methods
  async getCurrencies(): Promise<Currency[]> {
    return await db.select().from(currencies);
  }

  async getCurrencyById(id: number): Promise<Currency | undefined> {
    const [currency] = await db.select().from(currencies).where(eq(currencies.id, id));
    return currency || undefined;
  }

  async getCurrencyByCode(code: string): Promise<Currency | undefined> {
    const [currency] = await db.select().from(currencies).where(eq(currencies.code, code));
    return currency || undefined;
  }

  async createCurrency(insertCurrency: InsertCurrency): Promise<Currency> {
    const [currency] = await db.insert(currencies).values(insertCurrency).returning();
    return currency;
  }

  // Exchange rate methods
  async getExchangeRates(): Promise<ExchangeRate[]> {
    return await db.select().from(exchangeRates);
  }

  async getExchangeRate(sourceCurrencyId: number, targetCurrencyId: number): Promise<ExchangeRate | undefined> {
    const [rate] = await db.select().from(exchangeRates).where(
      and(
        eq(exchangeRates.sourceCurrencyId, sourceCurrencyId),
        eq(exchangeRates.targetCurrencyId, targetCurrencyId)
      )
    );
    return rate || undefined;
  }

  async createExchangeRate(insertRate: InsertExchangeRate): Promise<ExchangeRate> {
    const [rate] = await db.insert(exchangeRates).values({
      ...insertRate,
      updatedAt: new Date()
    }).returning();
    return rate;
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async createTransaction(insertTx: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values({
      ...insertTx,
      createdAt: new Date()
    }).returning();
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string, txHash?: string): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db.update(transactions)
      .set({ 
        status,
        ...(txHash ? { txHash } : {})
      })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction || undefined;
  }

  // Liquidity pool methods
  async getLiquidityPools(): Promise<LiquidityPool[]> {
    return await db.select().from(liquidityPools);
  }

  async getLiquidityPoolById(id: number): Promise<LiquidityPool | undefined> {
    const [pool] = await db.select().from(liquidityPools).where(eq(liquidityPools.id, id));
    return pool || undefined;
  }

  async createLiquidityPool(insertPool: InsertLiquidityPool): Promise<LiquidityPool> {
    const [pool] = await db.insert(liquidityPools).values(insertPool).returning();
    return pool;
  }

  async updateLiquidityPool(id: number, updates: Partial<LiquidityPool>): Promise<LiquidityPool | undefined> {
    const [updatedPool] = await db.update(liquidityPools)
      .set(updates)
      .where(eq(liquidityPools.id, id))
      .returning();
    return updatedPool || undefined;
  }

  // Liquidity position methods
  async getLiquidityPositions(): Promise<LiquidityPosition[]> {
    return await db.select().from(liquidityPositions);
  }

  async getLiquidityPositionsByUserId(userId: number): Promise<LiquidityPosition[]> {
    return await db.select().from(liquidityPositions).where(eq(liquidityPositions.userId, userId));
  }

  async createLiquidityPosition(insertPosition: InsertLiquidityPosition): Promise<LiquidityPosition> {
    const [position] = await db.insert(liquidityPositions).values({
      ...insertPosition,
      createdAt: new Date()
    }).returning();
    return position;
  }

  async updateLiquidityPosition(id: number, amount: number): Promise<LiquidityPosition | undefined> {
    const [updatedPosition] = await db.update(liquidityPositions)
      .set({ amount })
      .where(eq(liquidityPositions.id, id))
      .returning();
    return updatedPosition || undefined;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private currencies: Map<number, Currency>;
  private exchangeRates: Map<string, ExchangeRate>;
  private transactions: Map<number, Transaction>;
  private liquidityPools: Map<number, LiquidityPool>;
  private liquidityPositions: Map<number, LiquidityPosition>;
  
  private userCurrentId: number;
  private currencyCurrentId: number;
  private exchangeRateCurrentId: number;
  private transactionCurrentId: number;
  private liquidityPoolCurrentId: number;
  private liquidityPositionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.currencies = new Map();
    this.exchangeRates = new Map();
    this.transactions = new Map();
    this.liquidityPools = new Map();
    this.liquidityPositions = new Map();
    
    this.userCurrentId = 1;
    this.currencyCurrentId = 1;
    this.exchangeRateCurrentId = 1;
    this.transactionCurrentId = 1;
    this.liquidityPoolCurrentId = 1;
    this.liquidityPositionCurrentId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create currencies
    const usd = this.createCurrency({
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      parachainName: "Acala",
      parachainId: "USDC Stablecoin"
    });
    
    const eur = this.createCurrency({
      code: "EUR",
      name: "Euro",
      symbol: "€",
      parachainName: "Moonbeam",
      parachainId: "EUR Stablecoin"
    });
    
    const gbp = this.createCurrency({
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      parachainName: "Astar",
      parachainId: "GBP Stablecoin"
    });
    
    const sgd = this.createCurrency({
      code: "SGD",
      name: "Singapore Dollar",
      symbol: "S$",
      parachainName: "Parallel Finance",
      parachainId: "SGD Stablecoin"
    });
    
    const php = this.createCurrency({
      code: "PHP",
      name: "Philippine Peso",
      symbol: "₱",
      parachainName: "Equilibrium",
      parachainId: "PHP Stablecoin"
    });
    
    const myr = this.createCurrency({
      code: "MYR",
      name: "Malaysian Ringgit",
      symbol: "RM",
      parachainName: "Phala",
      parachainId: "MYR Stablecoin"
    });
    
    const thb = this.createCurrency({
      code: "THB",
      name: "Thai Baht",
      symbol: "฿",
      parachainName: "Centrifuge",
      parachainId: "THB Stablecoin"
    });
    
    const idr = this.createCurrency({
      code: "IDR",
      name: "Indonesian Rupiah",
      symbol: "Rp",
      parachainName: "HydraDX",
      parachainId: "IDR Stablecoin"
    });
    
    // Create exchange rates
    this.createExchangeRate({ sourceCurrencyId: usd.id, targetCurrencyId: php.id, rate: 55.27 });
    this.createExchangeRate({ sourceCurrencyId: usd.id, targetCurrencyId: myr.id, rate: 4.435 });
    this.createExchangeRate({ sourceCurrencyId: usd.id, targetCurrencyId: thb.id, rate: 35.67 });
    this.createExchangeRate({ sourceCurrencyId: usd.id, targetCurrencyId: idr.id, rate: 15255 });
    
    this.createExchangeRate({ sourceCurrencyId: eur.id, targetCurrencyId: php.id, rate: 58.93 });
    this.createExchangeRate({ sourceCurrencyId: eur.id, targetCurrencyId: myr.id, rate: 4.73 });
    this.createExchangeRate({ sourceCurrencyId: eur.id, targetCurrencyId: thb.id, rate: 38.05 });
    this.createExchangeRate({ sourceCurrencyId: eur.id, targetCurrencyId: idr.id, rate: 16278 });
    
    this.createExchangeRate({ sourceCurrencyId: gbp.id, targetCurrencyId: php.id, rate: 68.42 });
    this.createExchangeRate({ sourceCurrencyId: gbp.id, targetCurrencyId: myr.id, rate: 5.49 });
    this.createExchangeRate({ sourceCurrencyId: gbp.id, targetCurrencyId: thb.id, rate: 44.18 });
    this.createExchangeRate({ sourceCurrencyId: gbp.id, targetCurrencyId: idr.id, rate: 18894 });
    
    this.createExchangeRate({ sourceCurrencyId: sgd.id, targetCurrencyId: php.id, rate: 40.68 });
    this.createExchangeRate({ sourceCurrencyId: sgd.id, targetCurrencyId: myr.id, rate: 3.26 });
    this.createExchangeRate({ sourceCurrencyId: sgd.id, targetCurrencyId: thb.id, rate: 26.26 });
    this.createExchangeRate({ sourceCurrencyId: sgd.id, targetCurrencyId: idr.id, rate: 11230 });
    
    // Create liquidity pools
    this.createLiquidityPool({
      sourceCurrencyId: usd.id,
      targetCurrencyId: php.id,
      totalLiquidity: 2456789,
      dailyVolume: 132654,
      apy: 4.8
    });
    
    this.createLiquidityPool({
      sourceCurrencyId: usd.id,
      targetCurrencyId: myr.id,
      totalLiquidity: 1856432,
      dailyVolume: 98765,
      apy: 5.2
    });
    
    this.createLiquidityPool({
      sourceCurrencyId: eur.id,
      targetCurrencyId: php.id,
      totalLiquidity: 978345,
      dailyVolume: 45678,
      apy: 3.9
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.walletAddress === walletAddress);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Currency methods
  async getCurrencies(): Promise<Currency[]> {
    return Array.from(this.currencies.values());
  }

  async getCurrencyById(id: number): Promise<Currency | undefined> {
    return this.currencies.get(id);
  }

  async getCurrencyByCode(code: string): Promise<Currency | undefined> {
    return Array.from(this.currencies.values()).find(currency => currency.code === code);
  }

  async createCurrency(insertCurrency: InsertCurrency): Promise<Currency> {
    const id = this.currencyCurrentId++;
    const currency: Currency = { ...insertCurrency, id };
    this.currencies.set(id, currency);
    return currency;
  }

  // Exchange rate methods
  async getExchangeRates(): Promise<ExchangeRate[]> {
    return Array.from(this.exchangeRates.values());
  }

  async getExchangeRate(sourceCurrencyId: number, targetCurrencyId: number): Promise<ExchangeRate | undefined> {
    const key = `${sourceCurrencyId}-${targetCurrencyId}`;
    return this.exchangeRates.get(key);
  }

  async createExchangeRate(insertRate: InsertExchangeRate): Promise<ExchangeRate> {
    const id = this.exchangeRateCurrentId++;
    const rate: ExchangeRate = { 
      ...insertRate, 
      id, 
      updatedAt: new Date() 
    };
    const key = `${rate.sourceCurrencyId}-${rate.targetCurrencyId}`;
    this.exchangeRates.set(key, rate);
    return rate;
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(tx => tx.userId === userId);
  }

  async createTransaction(insertTx: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    const transaction: Transaction = { 
      ...insertTx, 
      id, 
      createdAt: new Date() 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string, txHash?: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { 
      ...transaction, 
      status,
      ...(txHash ? { txHash } : {})
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Liquidity pool methods
  async getLiquidityPools(): Promise<LiquidityPool[]> {
    return Array.from(this.liquidityPools.values());
  }

  async getLiquidityPoolById(id: number): Promise<LiquidityPool | undefined> {
    return this.liquidityPools.get(id);
  }

  async createLiquidityPool(insertPool: InsertLiquidityPool): Promise<LiquidityPool> {
    const id = this.liquidityPoolCurrentId++;
    const pool: LiquidityPool = { ...insertPool, id };
    this.liquidityPools.set(id, pool);
    return pool;
  }

  async updateLiquidityPool(id: number, updates: Partial<LiquidityPool>): Promise<LiquidityPool | undefined> {
    const pool = this.liquidityPools.get(id);
    if (!pool) return undefined;
    
    const updatedPool = { ...pool, ...updates };
    this.liquidityPools.set(id, updatedPool);
    return updatedPool;
  }

  // Liquidity position methods
  async getLiquidityPositions(): Promise<LiquidityPosition[]> {
    return Array.from(this.liquidityPositions.values());
  }

  async getLiquidityPositionsByUserId(userId: number): Promise<LiquidityPosition[]> {
    return Array.from(this.liquidityPositions.values()).filter(pos => pos.userId === userId);
  }

  async createLiquidityPosition(insertPosition: InsertLiquidityPosition): Promise<LiquidityPosition> {
    const id = this.liquidityPositionCurrentId++;
    const position: LiquidityPosition = { 
      ...insertPosition, 
      id, 
      createdAt: new Date() 
    };
    this.liquidityPositions.set(id, position);
    return position;
  }

  async updateLiquidityPosition(id: number, amount: number): Promise<LiquidityPosition | undefined> {
    const position = this.liquidityPositions.get(id);
    if (!position) return undefined;
    
    const updatedPosition = { ...position, amount };
    this.liquidityPositions.set(id, updatedPosition);
    return updatedPosition;
  }
}

// Change this line to use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
