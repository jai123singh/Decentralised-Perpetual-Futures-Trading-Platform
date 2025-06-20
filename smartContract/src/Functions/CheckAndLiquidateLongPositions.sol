// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";
import "../Utility/MaxHeap.sol";
import "../Events.sol";
import "./CalculatePerpPriceForShortPositionTrader.sol";
import "../Utility/CircularVector.sol";
import "./PlatformFeeCalculationFunctions.sol";

contract CheckAndLiquidateLongPositions is
    StateVariables,
    CalculatePerpPriceForShortPositionTrader,
    PlatformFeeCalculationFunctions
{
    using MaxHeapLib for MaxHeap;
    using CircularVectorLib for CircularVector;

    // checkAndLiquidateSLongPositions checks for automatic liquidation of long position traders when perp price decreases
    // this function calls closeLongPosition function
    // The price update event would be emitted only if didTradeOccur(represents if it was actual trade and not just funding rate mechanism) is true or initialPerpPrice != currentPriceOfPerp
    function checkAndLiquidateLongPositions(
        int256 initialPerpPrice,
        bool didTradeOccur
    ) internal {
        if (triggerPriceForLongPositionLiquidationHeap.heap.length > 0) {
            (
                address traderAddress,
                int256 triggerPrice
            ) = triggerPriceForLongPositionLiquidationHeap.top();

            if (currentPriceOfPerp < triggerPrice) {
                // Below we are calculating and deducting platform fee from user's deposit for automated liquidation. We are taking 5 percent of remaining margin ( intital margin - total loss) after liquidation, as the platform fee. We would collect this fee, only if remaining margin after liquidation doesnt become <=0.

                // calculate the perp price at which the liquidation will occur
                int256 newPerpPriceIfPositionIsLiquidated = calculatePerpPriceForShortPositionTrader(
                        perpCountOfTraderWithLongPositionHashmap[traderAddress]
                    );

                // below we have calculated effective remaining margin after liquidation ie initial margin- final loss.

                int256 effectiveRemainingMargin = marginOfLongPositionTraderHashmap[
                        traderAddress
                    ] -
                        ((priceAtWhichPerpWasBoughtHashmap[traderAddress] -
                            newPerpPriceIfPositionIsLiquidated) *
                            perpCountOfTraderWithLongPositionHashmap[
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

                closeLongPosition(
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

    // closeLongPosition function is used to close position for a trader with long position. It is called when long position trader's position is closed ( either by his will(by calling closeOpenPosition function) or by automatic liquidation)
    // this function calls checkAndLiquidateLongPositions function
    function closeLongPosition(
        address traderAddress,
        int256 initialPerpPrice,
        bool didTradeOccur
    ) internal {
        // Update liquidity pool & currentPriceOfPerp, and adjust trader's deposit based on their profit/loss

        // Update liquidity pool & currentPriceOfPerp
        int256 perpCountToBeSoldToCloseLongPosition = perpCountOfTraderWithLongPositionHashmap[
                traderAddress
            ];

        currentPriceOfPerp = calculatePerpPriceForShortPositionTrader(
            perpCountToBeSoldToCloseLongPosition
        );

        numberOfWeiInLiquidityPool =
            (numberOfPerpInLiquidityPool * numberOfWeiInLiquidityPool) /
            (numberOfPerpInLiquidityPool +
                perpCountToBeSoldToCloseLongPosition);

        numberOfPerpInLiquidityPool += perpCountToBeSoldToCloseLongPosition;

        // Update traderDepositHashmap
        if (
            currentPriceOfPerp <=
            priceAtWhichPerpWasBoughtHashmap[traderAddress]
        ) {
            traderDepositHashmap[traderAddress] -=
                (priceAtWhichPerpWasBoughtHashmap[traderAddress] -
                    currentPriceOfPerp) *
                perpCountOfTraderWithLongPositionHashmap[traderAddress];
        } else {
            traderDepositHashmap[traderAddress] +=
                (currentPriceOfPerp -
                    priceAtWhichPerpWasBoughtHashmap[traderAddress]) *
                perpCountOfTraderWithLongPositionHashmap[traderAddress];
        }

        // Update all the database of the user

        triggerPriceForLongPositionLiquidationHeap.deleteUser(traderAddress);
        delete leverageUsedByTraderHashMap[traderAddress];
        delete priceAtWhichPerpWasBoughtHashmap[traderAddress];
        delete maintenanceMarginOfLongPositionTraderHashmap[traderAddress];
        delete marginOfLongPositionTraderHashmap[traderAddress];
        delete perpCountOfTraderWithLongPositionHashmap[traderAddress];

        checkAndLiquidateLongPositions(initialPerpPrice, didTradeOccur);
    }
}
