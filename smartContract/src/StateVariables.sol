// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./Utility/MinHeap.sol";
import "./Utility/CircularVector.sol";
import "./Utility/MaxHeap.sol";

contract StateVariables {
    address internal owner;
    address internal backend = 0x4Aeabd84f257C0A46F1b0455CD23B12367231E2e;
    // beneficiary is the address that can withdraw platform fee collected
    address internal beneficiary = 0x83534e0d0034DEE503055133Cf9e1e542aaC962c;

    // numberOfPerpInLiquidityPool and numberOfWeiInLiquidityPool are used to create virtual liquidity pool
    int256 internal numberOfPerpInLiquidityPool;
    int256 internal numberOfWeiInLiquidityPool;

    //wei pool is used to keep deposits and send them to users when they withdraw their deposits
    int256 internal numberOfWeiInWeiPool;

    // totalPlatformFeeCollected is used to keep track of amount that is collected as platform fees . This amount can only be extracted out by owner as a net profit from the smart contract.
    int256 internal totalPlatformFeeCollected;

    // currentPriceOfPerp is the perp price at which it was last traded
    int256 public currentPriceOfPerp;

    //lastTenPerpPriceWithTimestamp array stores latest 10 perp prices along with their timestamp for calculating TWAP
    using CircularVectorLib for CircularVector;

    CircularVector internal lastTenPerpPriceWithTimestamp;

    // where ever u use RISK_FREE_INTEREST_RATE_FOR_EIGHT_HOURS, the product must be divided by 1000000
    int256 internal RISK_FREE_INTEREST_RATE_FOR_EIGHT_HOURS = 65; //assuming 7.2 percent per annum risk free interest rate.

    //MAXIMUM__MAGNITUDE_OF_FUNDING_RATE is a variable that puts the upper cap on the magnitude of funding rate
    // where ever u use MAXIMUM__MAGNITUDE_OF_FUNDING_RATE, the product must be divided by 100
    int256 internal MAXIMUM__MAGNITUDE_OF_FUNDING_RATE = 2;

    // lastFundingRate stores the funding rate of last funding rate mechanism (in decimals)
    // it is storing actual funding rate * 1e24. So, whereever u need to use it, u must do lastFundingRate/1e24
    // When showing it in frontend, u have to show it in percentage , hence ---(lastFundingRate/1e24)*1e2 = lastFundingRate/1e22
    int256 public lastFundingRate;

    // lastFundingTime stores the timestamp of last funding rate mechanism
    int256 public lastFundingTime;

    // nextFundingTime stores the timestamp when next funding rate mechanism is expected to happen
    int256 internal nextFundingTime;

    //traderDepositHashmap is a hashmap that keeps track of the users deposit
    mapping(address => int256) internal traderDepositHashmap;

    //leverageUsedByTraderHashMap is a hashmap that stores the leverage used by the trader.
    mapping(address => int256) internal leverageUsedByTraderHashMap;

    //below are the variables that exclusively store data about long position traders

    //perpCountOfTraderWithLongPositionHashmap is a hashmap that keeps track of how many perps have long position traders bought
    mapping(address => int256)
        internal perpCountOfTraderWithLongPositionHashmap;

    //priceAtWhichPerpWasBoughtHashmap is a hashmap that stores the price of the perp at which trader bought it.
    mapping(address => int256) internal priceAtWhichPerpWasBoughtHashmap;

    //MarginOfLongPositionTraderHashmap is a hashmap that keeps track of the margin of the long position traders
    mapping(address => int256) internal marginOfLongPositionTraderHashmap;

    //maintenanceMarginOfLongPositionTraderHashmap is a hashmap that keeps track of the maintenance margin of the long position traders
    mapping(address => int256)
        internal maintenanceMarginOfLongPositionTraderHashmap;

    //triggerPriceForLongPositionLiquidationHeap is a MaxHeap (ie, the largest number is stored first) for trigger price of long traders. It a PQ of pair whose first value is an address second value is trigger price. And it is sorted based on trigger value. For eg---------------- ( add1,100) , (add2, 100) , (add3, 100) , (add4, 90) , (add5, 70) and so on.

    using MaxHeapLib for MaxHeap;

    MaxHeap internal triggerPriceForLongPositionLiquidationHeap;

    //below are the variables that exclusively store data about short position traders

    //perpCountOfTraderWithShortPositionHashmap is a hashmap that keeps track of how many perps have short position traders sold
    mapping(address => int256)
        internal perpCountOfTraderWithShortPositionHashmap;

    //priceAtWhichPerpWasSoldHashmap is a hashmap that stores the price of the perp at which trader sold it.
    mapping(address => int256) internal priceAtWhichPerpWasSoldHashmap;

    //MarginOfShortPositionTraderHashmap is a hashmap that keeps track of the margin of the short position traders
    mapping(address => int256) internal marginOfShortPositionTraderHashmap;

    //maintenanceMarginOfShortPositionTraderHashmap is a hashmap that keeps track of the maintenance margin of the short position traders
    mapping(address => int256)
        internal maintenanceMarginOfShortPositionTraderHashmap;

    //triggerPriceForShortPositionLiquidationHeap stores the trigger price for liquidation in increasing order that is smallest price first to largest price. It a PQ of pair whose first value is an address and second value is trigger price. And it is sorted based on second value. For eg----------------(add1, 70) , (add2, 90) , (add3, 100) , (add4, 100) , (add5, 100) and so on.
    using MinHeapLib for MinHeap;

    MinHeap internal triggerPriceForShortPositionLiquidationHeap;
}
