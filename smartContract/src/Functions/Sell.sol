// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "../Utility/MinHeap.sol";
import "./CalculatePerpPriceForShortPositionTrader.sol";
import "./CalculateMarginRequired.sol";
import "./CalculateMaintenanceMargin.sol";
import "./CalculateTriggerPriceForShortPosition.sol";
import "./CheckAndLiquidateLongPositions.sol";
import "../Modifiers.sol";

contract Sell is
    CalculateMarginRequired,
    CalculateMaintenanceMargin,
    CalculatePerpPriceForShortPositionTrader,
    CalculateTriggerPriceForShortPosition,
    CheckAndLiquidateLongPositions,
    Modifiers
{
    // Below function is executed when user sells some perps

    //Functions called by " sell " function -  CalculatePerpPriceForShortPositionTrader() , CalculateMarginRequired() , CalculateMaintenanceMargin() , CalculateTriggerPriceForShortPosition() , CheckAndLiquidateLongPositions()

    //Sell function can only be called by the trader, if no other position is open for trader already. (in our MVP, we have implemented that one must close one position before he can open another position)

    using MinHeapLib for MinHeap;
    function sell(
        address addressOfTrader,
        int256 numberOfPerpSold,
        int256 leverageUsedByTrader,
        int256 perpPriceWhenTraderClickedSell,
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
            perpPriceWhenTraderClickedSell > 0,
            "Price at which you want to sell the perp cannot be lesser than or equal to 0."
        );
        // In our MVP, number of perp sold can only be integers , and it must be greater than 0 and lesser than total number of perp in liquidity pool(we have set upper limit so that , people cannot misuse it and long position trader and short position trader both can have atmost same impact on perp price change)
        require(
            numberOfPerpSold > 0 &&
                numberOfPerpSold < numberOfPerpInLiquidityPool,
            string(
                abi.encodePacked(
                    "Number of perps to be sold to enter a short position must be greater than 0 and lesser than ",
                    Strings.toString(uint256(numberOfPerpInLiquidityPool)),
                    ", but you are requesting to sell: ",
                    Strings.toString(uint256(numberOfPerpSold))
                )
            )
        );

        //Below we are dividing by 10000 instead of 100 bcoz we are using slippageToleranceOfTrader and we have to divide the product by 100 wherever we use slippageToleranceOfTrader

        int256 minimumPerpPriceAtWhichTraderIsWillingToSellBasedOnSlippageTolerance = ((perpPriceWhenTraderClickedSell *
                10000) -
                (perpPriceWhenTraderClickedSell * slippageToleranceOfTrader)) /
                10000;

        // calculatePerpPriceForTheShortPositionTrader function calculates the price (using constant product algorithm) to determine the price at which the trade would sell the perps

        int256 perpPriceAtWhichTraderWouldSellThePerp = calculatePerpPriceForShortPositionTrader(
                numberOfPerpSold
            );

        require(
            minimumPerpPriceAtWhichTraderIsWillingToSellBasedOnSlippageTolerance <=
                perpPriceAtWhichTraderWouldSellThePerp,
            "Your trade is changing the perp price such that it is going beyond your slippage tolerance limit. Try increasing slippage tolerance percentage or reduce trade size"
        );

        // Check if the trader has sufficient deposit to cover the margins

        //calculateMarginRequired function returns the margin required for a trade.

        int256 marginRequired = calculateMarginRequired(
            numberOfPerpSold,
            leverageUsedByTrader,
            perpPriceAtWhichTraderWouldSellThePerp
        );

        require(
            traderDepositHashmap[addressOfTrader] >= marginRequired,
            "You do not have enough deposit to cover the margin."
        );

        // check if trader has enough deposits to cover platform charges or not
        int256 platformFeeToSellPerp = calculateOpeningANewPositionFee(
            numberOfPerpSold * perpPriceAtWhichTraderWouldSellThePerp
        );

        require(
            traderDepositHashmap[addressOfTrader] >=
                (marginRequired + platformFeeToSellPerp),
            "You do not have enough deposit to cover platform fee after paying for margin."
        );

        // All the required checks are done

        // Deduct platform fee from trader's deposit
        traderDepositHashmap[addressOfTrader] -= platformFeeToSellPerp;
        // update totalPlatformFeeCollected
        totalPlatformFeeCollected += platformFeeToSellPerp;
        // update numberOfWeiInWeiPool
        numberOfWeiInWeiPool -= platformFeeToSellPerp;

        // update the perpCountOfTraderWithShortPositionHashmap hashmap

        perpCountOfTraderWithShortPositionHashmap[
            addressOfTrader
        ] = numberOfPerpSold;

        // update the leverageUsedByTraderHashMap hashmap to store the leverage of the trader

        leverageUsedByTraderHashMap[addressOfTrader] = leverageUsedByTrader;

        // update the priceAtWhichPerpWasSoldtHashmap hashmap to store the price at which trader is selling the perp

        priceAtWhichPerpWasSoldHashmap[
            addressOfTrader
        ] = perpPriceAtWhichTraderWouldSellThePerp;

        //update the current price of the perp

        currentPriceOfPerp = perpPriceAtWhichTraderWouldSellThePerp;

        //enter the margin of the trader in marginOfShortPositionTraderHashmap hashmap

        marginOfShortPositionTraderHashmap[addressOfTrader] = marginRequired;

        //enter the maintenance margin of the trader in  maintenanceMarginOfShortPositionTraderHashmap hashmap

        int256 maintenanceMarginOfTrade = calculateMaintenanceMargin(
            numberOfPerpSold,
            perpPriceAtWhichTraderWouldSellThePerp
        );

        maintenanceMarginOfShortPositionTraderHashmap[
            addressOfTrader
        ] = maintenanceMarginOfTrade;

        // calculate the trigger price (price of perp at which this trader's position would be liquidated) for this trader

        int256 triggerPriceOfPerpForLiquidationForThisTrader = calculateTriggerPriceForShortPosition(
                addressOfTrader
            );

        //enter this trigger price and trader's address in triggerPriceForShortPositionLiquidationHeap heap

        triggerPriceForShortPositionLiquidationHeap.push(
            addressOfTrader,
            triggerPriceOfPerpForLiquidationForThisTrader
        );

        // update the liquidity pool

        numberOfPerpInLiquidityPool =
            numberOfPerpInLiquidityPool +
            numberOfPerpSold;

        numberOfWeiInLiquidityPool =
            numberOfWeiInLiquidityPool -
            currentPriceOfPerp *
            numberOfPerpSold;

        //Check for liquidation and do any liquidation that is required.

        checkAndLiquidateLongPositions(initialPerpPrice, true);
    }
}
