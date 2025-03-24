# RemittanceCrosslink 🌐💸

A DeFi-powered cross-border remittance platform built on Polkadot for the Philippines Hackathon 2025.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://remittance-crosslink-jennieahhhhhh.replit.app/)
[![Polkadot](https://img.shields.io/badge/Polkadot-Ready-E6007A)](https://polkadot.network/)

## 🎯 Problem Statement

Traditional remittance systems face challenges with:
- High transaction fees (5-7% average)
- Long processing times (2-3 business days)
- Limited accessibility
- Lack of transparency

## 💡 Solution

RemittanceCrosslink leverages Polkadot's blockchain technology and DeFi mechanisms to provide:
- Near-instant cross-border transfers
- Low transaction fees (<1%)
- 24/7 availability
- Complete transparency
- Automated market making for better exchange rates

## 🚀 Key Features

- **Automated Market Making (AMM)**
  - Liquidity pools for USDC/PHP pairs
  - Efficient price discovery
  - Yield generation for liquidity providers

- **Cross-Chain Integration**
  - Seamless integration with Polkadot ecosystem
  - Support for multiple tokens
  - Secure cross-chain transactions

- **User-Friendly Interface**
  - Intuitive remittance flow
  - Real-time rate display
  - Transaction history tracking
  - Educational content for DeFi concepts

## 🛠️ Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Express.js, PostgreSQL
- **Blockchain**: Polkadot/Substrate
- **Smart Contracts**: Solidity
- **Infrastructure**: Vercel, Replit

## 🔧 Architecture

```
RemittanceCrosslink/
├── client/           # Frontend React application
├── server/           # Backend Express server
├── contracts/        # Smart contracts
│   ├── LiquidityPool.sol
│   ├── USDCToken.sol
│   └── PHPToken.sol
├── scripts/         # Deployment and test scripts
└── shared/          # Shared types and utilities
```

## 🏃‍♂️ Running Locally

1. Clone the repository:
```bash
git clone https://github.com/robin0x234/RemittanceCrosslink.git
cd RemittanceCrosslink
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your configuration
```

4. Start the development server:
```bash
npm run dev
```

## 🔐 Security Considerations

- Smart contract security best practices implemented
- Regular security audits
- Protected API endpoints
- Secure key management
- Rate limiting and DDoS protection

## 🌟 Future Roadmap

- Multi-currency support
- Mobile application
- Enhanced analytics dashboard
- Additional DeFi features
- Cross-chain bridges expansion

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Contact

For any queries regarding this project, please open an issue or contact us at remittancecrosslink@gmail.com.
