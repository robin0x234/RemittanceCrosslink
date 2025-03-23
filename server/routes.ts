import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertUserSchema, transactions, insertLiquidityPositionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // User routes
  apiRouter.post("/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.get("/users/:walletAddress", async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.params;
      const user = await storage.getUserByWalletAddress(walletAddress);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Currency routes
  apiRouter.get("/currencies", async (_req: Request, res: Response) => {
    try {
      const currencies = await storage.getCurrencies();
      res.json(currencies);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/currencies/:code", async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const currency = await storage.getCurrencyByCode(code);

      if (!currency) {
        return res.status(404).json({ message: "Currency not found" });
      }

      res.json(currency);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Exchange rate routes
  apiRouter.get("/exchange-rates", async (_req: Request, res: Response) => {
    try {
      const rates = await storage.getExchangeRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/exchange-rates/:source/:target", async (req: Request, res: Response) => {
    try {
      const { source, target } = req.params;

      const sourceCurrency = await storage.getCurrencyByCode(source);
      const targetCurrency = await storage.getCurrencyByCode(target);

      if (!sourceCurrency || !targetCurrency) {
        return res.status(404).json({ message: "Currency not found" });
      }

      const rate = await storage.getExchangeRate(sourceCurrency.id, targetCurrency.id);

      if (!rate) {
        // Handle case where rate is not found in the database.  This is a server-side fix.
        return res.status(404).json({ message: "Exchange rate not found for this currency pair." });
      }

      res.json(rate);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transaction routes
  apiRouter.post("/transactions", async (req: Request, res: Response) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);

      // Calculate fee (simplified for demo)
      const fee = transactionData.sourceAmount * 0.01; // 1% fee

      const newTransaction = await storage.createTransaction({
        ...transactionData,
        fee,
        status: "pending"
      });

      // Simulate blockchain transaction (would interact with Polkadot in real app)
      setTimeout(async () => {
        // 80% chance of success for demo purposes
        const success = Math.random() > 0.2;
        if (success) {
          await storage.updateTransactionStatus(
            newTransaction.id, 
            "completed", 
            `0x${Math.random().toString(16).substring(2, 10)}`
          );
        } else {
          await storage.updateTransactionStatus(
            newTransaction.id, 
            "failed"
          );
        }
      }, 5000); // 5 second delay

      res.status(201).json(newTransaction);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.get("/transactions", async (_req: Request, res: Response) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/transactions/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const transactions = await storage.getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Liquidity pools routes
  apiRouter.get("/liquidity-pools", async (_req: Request, res: Response) => {
    try {
      const pools = await storage.getLiquidityPools();

      // Fetch related currency information
      const poolsWithCurrencies = await Promise.all(pools.map(async (pool) => {
        const sourceCurrency = await storage.getCurrencyById(pool.sourceCurrencyId);
        const targetCurrency = await storage.getCurrencyById(pool.targetCurrencyId);

        return {
          ...pool,
          sourceCurrency,
          targetCurrency
        };
      }));

      res.json(poolsWithCurrencies);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Liquidity positions routes
  apiRouter.post("/liquidity-positions", async (req: Request, res: Response) => {
    try {
      const positionData = insertLiquidityPositionSchema.parse(req.body);
      const newPosition = await storage.createLiquidityPosition(positionData);

      // Update pool total liquidity
      const pool = await storage.getLiquidityPoolById(positionData.poolId);
      if (pool) {
        await storage.updateLiquidityPool(
          pool.id, 
          { totalLiquidity: pool.totalLiquidity + positionData.amount }
        );
      }

      res.status(201).json(newPosition);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.get("/liquidity-positions/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const positions = await storage.getLiquidityPositionsByUserId(userId);

      // Fetch related pool information
      const positionsWithDetails = await Promise.all(positions.map(async (position) => {
        const pool = await storage.getLiquidityPoolById(position.poolId);
        return {
          ...position,
          pool
        };
      }));

      res.json(positionsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Calculate route
  apiRouter.post("/calculate", async (req: Request, res: Response) => {
    try {
      const { sourceAmount, sourceCurrencyCode, targetCurrencyCode } = req.body;

      if (!sourceAmount || !sourceCurrencyCode || !targetCurrencyCode) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const sourceCurrency = await storage.getCurrencyByCode(sourceCurrencyCode);
      const targetCurrency = await storage.getCurrencyByCode(targetCurrencyCode);

      if (!sourceCurrency || !targetCurrency) {
        return res.status(404).json({ message: "Currency not found" });
      }

      const exchangeRate = await storage.getExchangeRate(sourceCurrency.id, targetCurrency.id);

      if (!exchangeRate) {
        return res.status(404).json({ message: "Exchange rate not found" });
      }

      // Calculate fee (1% for demo)
      const fee = sourceAmount * 0.01;

      // Calculate converted amount after fee
      const convertedAmount = (sourceAmount - fee) * exchangeRate.rate;

      res.json({
        sourceAmount,
        sourceCurrency,
        targetCurrency,
        exchangeRate: exchangeRate.rate,
        fee,
        convertedAmount
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Use apiRouter with /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}