// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "../Utility/MaxHeap.sol";
import "./CalculatePerpPriceForLongPositionTrader.sol";
import "./CalculateMarginRequired.sol";
import "./CalculateMaintenanceMargin.sol";
import "./CalculateTriggerPriceForLongPosition.sol";
import "./CheckAndLiquidateShortPositions.sol";
import "../Modifiers.sol";

contract Buy is
    CalculateMarginRequired,
    CalculateMaintenanceMargin,
    CalculatePerpPriceForLongPositionTrader,
    CalculateTriggerPriceForLongPosition,
    CheckAndLiquidateShortPositions,
    Modifiers
{
    // Below function is executed when user buys some perps

    //Functions called by " Buy " function -  calculatePerpPriceForLongPositionTrader() , calculateMarginRequired() , calculateMaintenanceMargin() , calculateTriggerPriceForLongPosition() , checkAndLiquidateShortPositions()

    // Buy function can only be called by the trader, if no other position is open for trader already. (in our MVP, we have implemented that one must close one position before he can open another position)

    using MaxHeapLib for MaxHeap;
    function buy(
        address addressOfTrader,
        int256 numberOfPerpBought,
        int256 leverageUsedByTrader,
        int256 perpPriceWhenTraderClickedBuy,
        int256 slippageToleranceOfTrader
    )
        external
        executeFundingRateIfNeeded
        checkUserValidity(addressOfTrader)
        doBasicChecks(
            addressOfTrader,
            leverageUsedByTrader,
            slippageToleranceOfTrader
        )
    {
        int256 initialPerpPrice = currentPriceOfPerp;

        require(
            perpPriceWhenTraderClickedBuy > 0,
            "Price at which you want to buy the perp cannot be lesser than or equal to 0."
        );
        // In our MVP, number of perp bought can only be integers , and it must be greater than 0 and lesser than total number of perp in liquidity pool
        require(
            numberOfPerpBought > 0 &&
                numberOfPerpBought < numberOfPerpInLiquidityPool,
            string(
                abi.encodePacked(
                    "Number of perps to be bought to open a long position must be greater than 0 and lesser than ",
                    Strings.toString(uint256(numberOfPerpInLiquidityPool)),
                    ", but you are requesting to buy: ",
                    Strings.toString(uint256(numberOfPerpBought))
                )
            )
        );

        //Below we are dividing by 10000 instead of 100 bcoz we are using slippageToleranceOfTrader and we have to divide the product by 100 wherever we use slippageToleranceOfTrader

        int256 maximumPerpPriceAtWhichTraderIsWillingToBuyBasedOnSlippageTolerance = ((perpPriceWhenTraderClickedBuy *
                10000) +
                (perpPriceWhenTraderClickedBuy * slippageToleranceOfTrader)) /
                10000;

        // calculatePerpPriceForTheLongPositionTrader function calculates the price (using constant product algorithm) to deteremine the price at which the trade would get the perps

        int256 perpPriceAtWhichTraderWouldGetThePerp = calculatePerpPriceForLongPositionTrader(
                numberOfPerpBought
            );

        require(
            maximumPerpPriceAtWhichTraderIsWillingToBuyBasedOnSlippageTolerance >=
                perpPriceAtWhichTraderWouldGetThePerp,
            "Your trade is changing the perp price such that it is going beyond your slippage tolerance limit. Try increasing slippage tolerance percentage or reduce trade size"
        );

        // Check if the trader has sufficient deposit to cover the margins

        //calculateMarginRequired function returns the margin required for a trade.

        int256 marginRequired = calculateMarginRequired(
            numberOfPerpBought,
            leverageUsedByTrader,
            perpPriceAtWhichTraderWouldGetThePerp
        );

        require(
            traderDepositHashmap[addressOfTrader] >= marginRequired,
            "You do not have enough deposit to cover the margin"
        );

        // check if trader has enough deposits to cover platform charges or not
        int256 platformFeeToBuyPerp = calculateOpeningANewPositionFee(
            numberOfPerpBought * perpPriceAtWhichTraderWouldGetThePerp
        );

        require(
            traderDepositHashmap[addressOfTrader] >=
                (marginRequired + platformFeeToBuyPerp),
            "You do not have enough deposit to cover platform fee after paying for margin"
        );

        // All the required checks are done

        // Deduct platform fee from trader's deposit
        traderDepositHashmap[addressOfTrader] -= platformFeeToBuyPerp;
        // update totalPlatformFeeCollected
        totalPlatformFeeCollected += platformFeeToBuyPerp;
        // update numberOfWeiInWeiPool
        numberOfWeiInWeiPool -= platformFeeToBuyPerp;

        // update the perpCountOfTraderWithLongPositionHashmap hashmap

        perpCountOfTraderWithLongPositionHashmap[
            addressOfTrader
        ] = numberOfPerpBought;

        // update the leverageUsedByTraderHashMap hashmap to store the leverage of the trader

        leverageUsedByTraderHashMap[addressOfTrader] = leverageUsedByTrader;

        // update the priceAtWhichPerpWasBoughtHashmap hashmap to store the price at which trader is buying the perp

        priceAtWhichPerpWasBoughtHashmap[
            addressOfTrader
        ] = perpPriceAtWhichTraderWouldGetThePerp;

        //update the current price of the perp

        currentPriceOfPerp = perpPriceAtWhichTraderWouldGetThePerp;

        //enter the margin of the trader in marginOfLongPositionTraderHashmap hashmap

        marginOfLongPositionTraderHashmap[addressOfTrader] = marginRequired;

        //enter the maintenance margin of the trader in maintenance_margin_of_long_position_trader_hashmap hashmap

        int256 maintenanceMarginOfTrade = calculateMaintenanceMargin(
            numberOfPerpBought,
            perpPriceAtWhichTraderWouldGetThePerp
        );

        maintenanceMarginOfLongPositionTraderHashmap[
            addressOfTrader
        ] = maintenanceMarginOfTrade;

        // calculate the trigger price (price of perp at which this trader's position would be liquidated) for this trader

        int256 triggerPriceOfPerpForLiquidationForThisTrader = calculateTriggerPriceForLongPosition(
                addressOfTrader
            );

        //enter this trigger price and trader's address in triggerPriceForLongPositionLiquidationHeap heap

        triggerPriceForLongPositionLiquidationHeap.push(
            addressOfTrader,
            triggerPriceOfPerpForLiquidationForThisTrader
        );

        // update the liquidity pool

        numberOfPerpInLiquidityPool =
            numberOfPerpInLiquidityPool -
            numberOfPerpBought;

        numberOfWeiInLiquidityPool =
            numberOfWeiInLiquidityPool +
            currentPriceOfPerp *
            numberOfPerpBought;

        //Check for liquidation and do any liquidation that is required.

        checkAndLiquidateShortPositions(initialPerpPrice, true);
    }
}
