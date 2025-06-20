// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";
import "../Utility/MinHeap.sol";
import "../Utility/CircularVector.sol";
import "../Events.sol";
import "./CalculatePerpPriceForLongPositionTrader.sol";
import "./PlatformFeeCalculationFunctions.sol";

contract CheckAndLiquidateShortPositions is
    StateVariables,
    CalculatePerpPriceForLongPositionTrader,
    PlatformFeeCalculationFunctions
{
    using MinHeapLib for MinHeap;
    using CircularVectorLib for CircularVector;

    // checkAndLiquidateShortPositions checks for automatic liquidation of short position traders when perp price increases
    // this function calls closeShortPosition function
    // The price update event would be emitted only if didTradeOccur(represents if it was actual trade and not just funding rate mechanism) is true or initialPerpPrice != currentPriceOfPerp
    function checkAndLiquidateShortPositions(
        int256 initialPerpPrice,
        bool didTradeOccur
    ) internal {
        if (triggerPriceForShortPositionLiquidationHeap.heap.length > 0) {
            (
                address traderAddress,
                int256 triggerPrice
            ) = triggerPriceForShortPositionLiquidationHeap.top();

            if (currentPriceOfPerp > triggerPrice) {
                // Below we are calculating and deducting platform fee from user's deposit for automated liquidation. We are taking 5 percent of remaining margin ( intital margin - total loss) after liquidation, as the platform fee. We would collect this fee, only if remaining margin after liquidation is > 0 .

                // calculate the perp price at which the liquidation will occur
                int256 newPerpPriceIfPositionIsLiquidated = calculatePerpPriceForLongPositionTrader(
                        perpCountOfTraderWithShortPositionHashmap[traderAddress]
                    );

                // below we have calculated effective remaining margin after liquidation ie initial margin- final loss.

                int256 effectiveRemainingMargin = marginOfShortPositionTraderHashmap[
                        traderAddress
                    ] -
                        ((newPerpPriceIfPositionIsLiquidated -
                            priceAtWhichPerpWasSoldHashmap[traderAddress]) *
                            perpCountOfTraderWithShortPositionHashmap[
                                traderAddress
                            ]);

                int256 platformFeeForAutomatedLiquidation = 0;

                if (effectiveRemainingMargin > 0) {
                    platformFeeForAutomatedLiquidation = calculateAutomatedLiquidationFee(
                        effectiveRemainingMargin
                    );
                    // deduct it from user's deposit
                    traderDepositHashmap[
                        traderAddress
                    ] -= platformFeeForAutomatedLiquidation;
                    // update totalPlatformFeeCollected
                    totalPlatformFeeCollected += platformFeeForAutomatedLiquidation;
                    // update numberOfWeiInWeiPool
                    numberOfWeiInWeiPool -= platformFeeForAutomatedLiquidation;
                }
                // Collecting platform fee for automated liquidation done.

                // emit event to inform frontend about liquidation

                emit Events.PositionLiquidated(
                    traderAddress,
                    int256(block.timestamp),
                    platformFeeForAutomatedLiquidation
                );
                // After that, the frontend will match that address with theirs and then, if it is theirs, they will poll the blockchain to get an update on their state.

                closeShortPosition(
                    traderAddress,
                    initialPerpPrice,
                    didTradeOccur
                );
            } else {
                // we update  lastTenPerpPriceWithTimestamp and emit PerpPriceUpdated event only if price of perp has some change or didTradeOccur is true
                if (
                    didTradeOccur == true ||
                    currentPriceOfPerp != initialPerpPrice
                ) {
                    //insert latest perp price in the lastTenPerpPriceWithTimestamp vector
                    lastTenPerpPriceWithTimestamp.push(
                        currentPriceOfPerp,
                        int256(block.timestamp)
                    );
                    // Emit the current price of the perp, for the frontend to update itself.
                    emit Events.PerpPriceUpdated(
                        currentPriceOfPerp,
                        int256(block.timestamp)
                    );
                }
            }
        } else {
            // we update  lastTenPerpPriceWithTimestamp and emit PerpPriceUpdated event only if price of perp has some change or didTradeOccur is true
            if (
                didTradeOccur == true || currentPriceOfPerp != initialPerpPrice
            ) {
                //insert latest perp price in the lastTenPerpPriceWithTimestamp vector
                lastTenPerpPriceWithTimestamp.push(
                    currentPriceOfPerp,
                    int256(block.timestamp)
                );
                // Emit the current price of the perp, for the frontend to update itself.
                emit Events.PerpPriceUpdated(
                    currentPriceOfPerp,
                    int256(block.timestamp)
                );
            }
        }
    }

    // closeShortPosition function is used to close position for a trader with short position. It is called when short position trader's position is closed ( either by his will (by calling closeOpenPosition function) or by automatic liquidation)
    // this function calls checkAndLiquidateShortPositions functions

    function closeShortPosition(
        address traderAddress,
        int256 initialPerpPrice,
        bool didTradeOccur
    ) internal {
        // Update liquidity pool & currentPriceOfPerp, and adjust trader's deposit based on their profit/loss

        // Update liquidity pool & currentPriceOfPerp
        int256 perpCountToBeBoughtToCloseShortPosition = perpCountOfTraderWithShortPositionHashmap[
                traderAddress
            ];

        currentPriceOfPerp = calculatePerpPriceForLongPositionTrader(
            perpCountToBeBoughtToCloseShortPosition
        );

        numberOfWeiInLiquidityPool =
            (numberOfPerpInLiquidityPool * numberOfWeiInLiquidityPool) /
            (numberOfPerpInLiquidityPool -
                perpCountToBeBoughtToCloseShortPosition);

        numberOfPerpInLiquidityPool -= perpCountToBeBoughtToCloseShortPosition;

        // Update traderDepositHashmap
        if (
            currentPriceOfPerp <= priceAtWhichPerpWasSoldHashmap[traderAddress]
        ) {
            traderDepositHashmap[traderAddress] +=
                (priceAtWhichPerpWasSoldHashmap[traderAddress] -
                    currentPriceOfPerp) *
                perpCountOfTraderWithShortPositionHashmap[traderAddress];
        } else {
            traderDepositHashmap[traderAddress] -=
                (currentPriceOfPerp -
                    priceAtWhichPerpWasSoldHashmap[traderAddress]) *
                perpCountOfTraderWithShortPositionHashmap[traderAddress];
        }

        // Update all the database of the user

        triggerPriceForShortPositionLiquidationHeap.deleteUser(traderAddress);
        delete leverageUsedByTraderHashMap[traderAddress];
        delete priceAtWhichPerpWasSoldHashmap[traderAddress];
        delete maintenanceMarginOfShortPositionTraderHashmap[traderAddress];
        delete marginOfShortPositionTraderHashmap[traderAddress];
        delete perpCountOfTraderWithShortPositionHashmap[traderAddress];

        checkAndLiquidateShortPositions(initialPerpPrice, didTradeOccur);
    }
}
