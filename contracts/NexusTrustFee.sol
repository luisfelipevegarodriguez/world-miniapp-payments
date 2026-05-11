// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NexusTrust Fee Capture — World Chain + Celo
 * @notice Non-custodial: 0.5% fee on verified human payments
 * @dev Deploy on World Chain (chainId 480) and Celo (chainId 42220)
 * Revenue model: 0.5% per tx — at 10K daily tx × $10 avg = $500/day = $182K/year
 */
contract NexusTrustFee is Ownable, ReentrancyGuard {
    uint256 public constant FEE_BPS = 50; // 0.5%
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public totalFeesCollected;
    uint256 public totalTransactions;

    mapping(bytes32 => bool) public processedRefs;
    mapping(address => uint256) public tokenFees;

    event PaymentProcessed(
        bytes32 indexed ref,
        address indexed token,
        address indexed from,
        address to,
        uint256 amount,
        uint256 fee,
        uint256 ts
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Process a verified human payment with 0.5% fee
     * @param ref Unique payment reference from /api/initiate-payment
     * @param token USDC/WLD/stablecoin address
     * @param to Recipient address
     * @param amount Gross amount (fee deducted from this)
     */
    function processPayment(
        bytes32 ref,
        address token,
        address to,
        uint256 amount
    ) external nonReentrant {
        require(!processedRefs[ref], 'Ref already processed');
        require(amount > 0, 'Zero amount');
        require(to != address(0), 'Zero recipient');

        processedRefs[ref] = true;
        totalTransactions++;

        uint256 fee = (amount * FEE_BPS) / BPS_DENOMINATOR;
        uint256 net = amount - fee;

        // Transfer gross from sender to contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        // Send net to recipient immediately (non-custodial for recipient)
        IERC20(token).transfer(to, net);
        // Fee stays in contract for owner to collect
        tokenFees[token] += fee;
        totalFeesCollected += fee;

        emit PaymentProcessed(ref, token, msg.sender, to, net, fee, block.timestamp);
    }

    /** @notice Collect accumulated fees */
    function collectFees(address token) external onlyOwner {
        uint256 amount = tokenFees[token];
        require(amount > 0, 'No fees');
        tokenFees[token] = 0;
        IERC20(token).transfer(owner(), amount);
    }

    /** @notice Revenue projection helper */
    function revenueProjection(uint256 dailyTx, uint256 avgAmountUsd)
        external pure returns (uint256 dailyUsd, uint256 yearlyUsd)
    {
        dailyUsd = (dailyTx * avgAmountUsd * FEE_BPS) / BPS_DENOMINATOR;
        yearlyUsd = dailyUsd * 365;
    }
}
