// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";
import "../Utility/CircularVector.sol";

contract CalculateTwap is StateVariables {
    using CircularVectorLib for CircularVector;
    function calculateTwap() internal view returns (int256) {
        int256 summationOfTimeWeightedPrice = 0;
        int256 summationOfTimeInterval = 0;

        (
            int256[10] memory lastTenPerpPrices,
            int256[10] memory correspondingDuration
        ) = lastTenPerpPriceWithTimestamp
                .getPerpPriceVectorAndTimeDurationVector();

        for (uint256 i = 0; i < 10; i++) {
            summationOfTimeWeightedPrice +=
                lastTenPerpPrices[i] *
                correspondingDuration[i];
            summationOfTimeInterval += correspondingDuration[i];
        }

        // below , we are checking the very rare case, where if all the 10 perp price changes happened in the same block, then their block.timestamp would be same. And we have implemented getPerpPriceVectorAndTimeDurationVector function in such a way that it will keep all the correspondingDuration vector entries as 0. In that case,we would get following condition.

        // We have implemented getPerpPriceVectorAndTimeDurationVector function in such a way that if summationOfTimeWeightedPrice is 0 then summationOfTimeInterval would for sure be 0. Hence we are not checking for the condition->  summationOfTimeWeightedPrice ==0.
        if (summationOfTimeInterval == 0) {
            return currentPriceOfPerp;
        } else {
            return summationOfTimeWeightedPrice / summationOfTimeInterval;
        }
    }
}
