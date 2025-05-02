// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract PlatformFeeCalculationFunctions {
    // following function gives the platform fee required to open a new position
    function calculateOpeningANewPositionFee(
        int256 positionSize
    ) internal pure returns (int256) {
        return ((positionSize * 5) / 10000);
        // We are taking 0.05 percent of position size as the platform fee to buy or sell the perp
    }

    // following function gives the platform fee required during funding rate mechanism. We deduct this fee only from gainers and not from losers.

    // we are taking 10 % of funding rate as platform fee rate. so if amountChangeDueToFundingRateMechanism (fundingRate * position size * TWAP) is the amount gained by someone during funding mechanism, then he would be charged (10 percent of fundingRate * position size * TWAP), effectively it becomes 10% of amountChangeDueToFundingRateMechanism
    function calculateFundingRateMechanismFee(
        int256 amountChangeDueToFundingRateMechanism
    ) internal pure returns (int256) {
        int256 platformFeeForFundingRateMechanism;

        if (amountChangeDueToFundingRateMechanism <= 0) {
            platformFeeForFundingRateMechanism = ((-1 *
                amountChangeDueToFundingRateMechanism *
                10) / 100);
        } else if (amountChangeDueToFundingRateMechanism > 0) {
            platformFeeForFundingRateMechanism = ((amountChangeDueToFundingRateMechanism *
                10) / 100);
        }
        return platformFeeForFundingRateMechanism;
    }

    // following function calculates the platform fee for automated liquidation based on remaining margin (intital margin - net loss) after liquidation. We deduct 5 percent of it (if it is >0) as platform fee
    function calculateAutomatedLiquidationFee(
        int256 totalRemainingMargin
    ) internal pure returns (int256) {
        return ((totalRemainingMargin * 5) / 100);
        // we are taking 5 percent of total remaining margin as the platform fee for automated liquidation
    }
}
