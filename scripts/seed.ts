import { db } from "../server/db";
import {
  currencies, InsertCurrency,
  exchangeRates, InsertExchangeRate,
  liquidityPools, InsertLiquidityPool
} from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Clear existing data first
    console.log("Clearing existing data...");
    await db.delete(liquidityPools);
    await db.delete(exchangeRates);
    await db.delete(currencies);

    // Create currencies
    console.log("Creating currencies...");
    const usd = await createCurrency({
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      parachainName: "Acala",
      parachainId: "USDC Stablecoin"
    });
    
    const eur = await createCurrency({
      code: "EUR",
      name: "Euro",
      symbol: "€",
      parachainName: "Moonbeam",
      parachainId: "EUR Stablecoin"
    });
    
    const gbp = await createCurrency({
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      parachainName: "Astar",
      parachainId: "GBP Stablecoin"
    });
    
    const sgd = await createCurrency({
      code: "SGD",
      name: "Singapore Dollar",
      symbol: "S$",
      parachainName: "Parallel Finance",
      parachainId: "SGD Stablecoin"
    });
    
    const php = await createCurrency({
      code: "PHP",
      name: "Philippine Peso",
      symbol: "₱",
      parachainName: "Equilibrium",
      parachainId: "PHP Stablecoin"
    });
    
    const myr = await createCurrency({
      code: "MYR",
      name: "Malaysian Ringgit",
      symbol: "RM",
      parachainName: "Phala",
      parachainId: "MYR Stablecoin"
    });
    
    const thb = await createCurrency({
      code: "THB",
      name: "Thai Baht",
      symbol: "฿",
      parachainName: "Centrifuge",
      parachainId: "THB Stablecoin"
    });
    
    const idr = await createCurrency({
      code: "IDR",
      name: "Indonesian Rupiah",
      symbol: "Rp",
      parachainName: "HydraDX",
      parachainId: "IDR Stablecoin"
    });
    
    // Create exchange rates
    console.log("Creating exchange rates...");
    await createExchangeRate({ sourceCurrencyId: usd.id, targetCurrencyId: php.id, rate: 55.27 });
    await createExchangeRate({ sourceCurrencyId: usd.id, targetCurrencyId: myr.id, rate: 4.435 });
    await createExchangeRate({ sourceCurrencyId: usd.id, targetCurrencyId: thb.id, rate: 35.67 });
    await createExchangeRate({ sourceCurrencyId: usd.id, targetCurrencyId: idr.id, rate: 15255 });
    
    await createExchangeRate({ sourceCurrencyId: eur.id, targetCurrencyId: php.id, rate: 58.93 });
    await createExchangeRate({ sourceCurrencyId: eur.id, targetCurrencyId: myr.id, rate: 4.73 });
    await createExchangeRate({ sourceCurrencyId: eur.id, targetCurrencyId: thb.id, rate: 38.05 });
    await createExchangeRate({ sourceCurrencyId: eur.id, targetCurrencyId: idr.id, rate: 16278 });
    
    await createExchangeRate({ sourceCurrencyId: gbp.id, targetCurrencyId: php.id, rate: 68.42 });
    await createExchangeRate({ sourceCurrencyId: gbp.id, targetCurrencyId: myr.id, rate: 5.49 });
    await createExchangeRate({ sourceCurrencyId: gbp.id, targetCurrencyId: thb.id, rate: 44.18 });
    await createExchangeRate({ sourceCurrencyId: gbp.id, targetCurrencyId: idr.id, rate: 18894 });
    
    await createExchangeRate({ sourceCurrencyId: sgd.id, targetCurrencyId: php.id, rate: 40.68 });
    await createExchangeRate({ sourceCurrencyId: sgd.id, targetCurrencyId: myr.id, rate: 3.26 });
    await createExchangeRate({ sourceCurrencyId: sgd.id, targetCurrencyId: thb.id, rate: 26.26 });
    await createExchangeRate({ sourceCurrencyId: sgd.id, targetCurrencyId: idr.id, rate: 11230 });
    
    // Create liquidity pools
    console.log("Creating liquidity pools...");
    await createLiquidityPool({
      sourceCurrencyId: usd.id,
      targetCurrencyId: php.id,
      totalLiquidity: 2456789,
      dailyVolume: 132654,
      apy: 4.8
    });
    
    await createLiquidityPool({
      sourceCurrencyId: usd.id,
      targetCurrencyId: myr.id,
      totalLiquidity: 1856432,
      dailyVolume: 98765,
      apy: 5.2
    });
    
    await createLiquidityPool({
      sourceCurrencyId: eur.id,
      targetCurrencyId: php.id,
      totalLiquidity: 978345,
      dailyVolume: 45678,
      apy: 3.9
    });

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

async function createCurrency(data: InsertCurrency) {
  const [currency] = await db.insert(currencies).values(data).returning();
  return currency;
}

async function createExchangeRate(data: InsertExchangeRate) {
  const [rate] = await db.insert(exchangeRates).values({
    ...data,
    updatedAt: new Date()
  }).returning();
  return rate;
}

async function createLiquidityPool(data: InsertLiquidityPool) {
  const [pool] = await db.insert(liquidityPools).values(data).returning();
  return pool;
}

// Run the seed function
seedDatabase();