// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract LiquidityPool {
    address public token0; // USDC token address
    address public token1; // PHP token address
    
    uint256 public reserve0; // USDC reserve
    uint256 public reserve1; // PHP reserve
    
    uint256 public totalSupply; // LP tokens
    mapping(address => uint256) public balanceOf; // LP token balances
    
    uint256 public constant MINIMUM_LIQUIDITY = 10**3;
    
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
    event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to);
    
    constructor(address _token0, address _token1) {
        token0 = _token0;
        token1 = _token1;
    }
    
    // Add liquidity to the pool and mint LP tokens
    function addLiquidity(uint256 amount0, uint256 amount1) external returns (uint256 liquidity) {
        // Transfer tokens to this contract
        IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1);
        
        uint256 _totalSupply = totalSupply;
        
        if (_totalSupply == 0) {
            // First time adding liquidity
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            totalSupply = MINIMUM_LIQUIDITY; // Create some LP tokens for the contract, to avoid division by zero
            balanceOf[address(0)] = MINIMUM_LIQUIDITY;
        } else {
            // Calculate the proportion based on existing reserves
            liquidity = min(
                (amount0 * _totalSupply) / reserve0,
                (amount1 * _totalSupply) / reserve1
            );
        }
        
        require(liquidity > 0, "INSUFFICIENT_LIQUIDITY_MINTED");
        
        // Update reserves
        reserve0 += amount0;
        reserve1 += amount1;
        
        // Mint LP tokens to the provider
        balanceOf[msg.sender] += liquidity;
        totalSupply += liquidity;
        
        emit Mint(msg.sender, amount0, amount1);
        
        return liquidity;
    }
    
    // Remove liquidity and get back tokens
    function removeLiquidity(uint256 liquidity) external returns (uint256 amount0, uint256 amount1) {
        require(liquidity > 0, "INSUFFICIENT_LIQUIDITY_BURNED");
        require(balanceOf[msg.sender] >= liquidity, "INSUFFICIENT_LIQUIDITY_BALANCE");
        
        // Calculate token amounts to return
        amount0 = (liquidity * reserve0) / totalSupply;
        amount1 = (liquidity * reserve1) / totalSupply;
        
        require(amount0 > 0 && amount1 > 0, "INSUFFICIENT_LIQUIDITY_BURNED");
        
        // Update balances and total supply
        balanceOf[msg.sender] -= liquidity;
        totalSupply -= liquidity;
        
        // Update reserves
        reserve0 -= amount0;
        reserve1 -= amount1;
        
        // Transfer tokens back to user
        IERC20(token0).transfer(msg.sender, amount0);
        IERC20(token1).transfer(msg.sender, amount1);
        
        emit Burn(msg.sender, amount0, amount1, msg.sender);
        
        return (amount0, amount1);
    }
    
    // Swap tokens
    function swap(uint256 amount0Out, uint256 amount1Out, address to) external {
        require(amount0Out > 0 || amount1Out > 0, "INSUFFICIENT_OUTPUT_AMOUNT");
        require(amount0Out < reserve0 && amount1Out < reserve1, "INSUFFICIENT_LIQUIDITY");
        
        // Calculate input amounts
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        
        uint256 amount0In = balance0 > reserve0 - amount0Out ? balance0 - (reserve0 - amount0Out) : 0;
        uint256 amount1In = balance1 > reserve1 - amount1Out ? balance1 - (reserve1 - amount1Out) : 0;
        
        require(amount0In > 0 || amount1In > 0, "INSUFFICIENT_INPUT_AMOUNT");
        
        // Verify K constant (x * y = k)
        uint256 balance0Adjusted = balance0 * 1000 - amount0In * 3; // 0.3% fee
        uint256 balance1Adjusted = balance1 * 1000 - amount1In * 3; // 0.3% fee
        
        require(balance0Adjusted * balance1Adjusted >= reserve0 * reserve1 * 1000**2, "K");
        
        // Update reserves
        reserve0 = balance0;
        reserve1 = balance1;
        
        // Send tokens
        if (amount0Out > 0) IERC20(token0).transfer(to, amount0Out);
        if (amount1Out > 0) IERC20(token1).transfer(to, amount1Out);
        
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }
    
    // Helper function to calculate square root (from Uniswap)
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    // Helper function to return the minimum of two values
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    // Get current exchange rate
    function getExchangeRate() external view returns (uint256) {
        // Rate is reserve1 / reserve0 (how many PHP tokens for 1 USDC)
        return (reserve1 * 10**6) / reserve0;
    }
}