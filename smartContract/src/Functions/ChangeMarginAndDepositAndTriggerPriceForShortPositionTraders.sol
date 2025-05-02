// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";
import "./CalculateTriggerPriceForShortPosition.sol";
import "../Utility/MinHeap.sol";
import "./PlatformFeeCalculationFunctions.sol";

contract ChangeMarginAndDepositAndTriggerPriceForShortPositionTraders is
    StateVariables,
    CalculateTriggerPriceForShortPosition,
    PlatformFeeCalculationFunctions
{
    using MinHeapLib for MinHeap;
    // This function changes the margin, deposits, and trigger price of short position traders with an open position. It handles both- ie if funding rate is positive, it will increase short position tranders deposits , and if it is negative, it will decrease depsoits of short position traders

    // this function uses calculateTriggerPriceForShortPosition function

    function changeMarginAndDepositAndTriggerPriceForShortPositionTraders(
        int256 fundingRate,
        int256 twap
    ) internal {
        // We update deposits only for traders who have an open position, and then will update margin and trigger price, only if current margin > new deposit
        for (
            uint256 i = 0;
            i < triggerPriceForShortPositionLiquidationHeap.heap.length;
            i++
        ) {
            address currentTraderAddress = triggerPriceForShortPositionLiquidationHeap
                    .heap[i]
                    .userAddress;

            // Update the deposit
            // The formula applies for both positive and negative funding rates
            int256 amountChangeDueToFundingRateMechanism = (fundingRate *
                perpCountOfTraderWithShortPositionHashmap[
                    currentTraderAddress
                ] *
                twap) / (1e24);

            traderDepositHashmap[currentTraderAddress] += (
                amountChangeDueToFundingRateMechanism
            );

            // Below we are collecting platform fee for funding rate mechanism

            // we deduct platform fee, only from gainers. So we check if fundingRate > 0 to ensure that short position trader is gaining , and hence only then he should be charged
            if (fundingRate > 0) {
                // calculate platform fee for funding rate mechanism
                int256 platformFeeForFundingRateMechanism = calculateFundingRateMechanismFee(
                        amountChangeDueToFundingRateMechanism
                    );
                // deduct this fee user's deposit
                traderDepositHashmap[
                    currentTraderAddress
                ] -= platformFeeForFundingRateMechanism;
                // update totalPlatformFeeCollected
                totalPlatformFeeCollected += platformFeeForFundingRateMechanism;
                // update numberOfWeiInWeiPool
                numberOfWeiInWeiPool -= platformFeeForFundingRateMechanism;
            }
            // platform fee collection done

            // Check if current margin > new deposit. If it is so, then only update margin and trigger price
            if (
                marginOfShortPositionTraderHashmap[currentTraderAddress] >
                traderDepositHashmap[currentTraderAddress]
            ) {
                // update the margin. We make margin equals to user deposit, so that there is least change in the user margin and thus his liquidation chances are least
                marginOfShortPositionTraderHashmap[
                    currentTraderAddress
                ] = traderDepositHashmap[currentTraderAddress];

                // Update the trigger price priority queue
                int256 newTriggerPriceForCurrentTrader = calculateTriggerPriceForShortPosition(
                        currentTraderAddress
                    );
                triggerPriceForShortPositionLiquidationHeap.push(
                    currentTraderAddress,
                    newTriggerPriceForCurrentTrader
                );
            }
        }
    }
}
