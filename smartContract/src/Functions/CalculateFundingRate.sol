// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";
import "./SNXPriceInWei.sol";

contract CalculateFundingRate is StateVariables, SNXPriceInWei {
    // calculateFundingRate() function calculates the funding rate
    // this function calls getSNXPriceInWei function

    function calculateFundingRate(int256 twap) internal view returns (int256) {
        int256 spotPrice = getSNXPriceInWei();

        require(
            spotPrice > 0,
            "Something went wrong, spotPrice of SNX in terms of wei came out to be 0"
        );
        // Improve calculation to prevent precision loss
        int256 premiumIndex = ((twap - spotPrice) * 1e18) / spotPrice;

        int256 currentFundingRate = 0;

        if (premiumIndex > 0) {
            currentFundingRate = ((premiumIndex * 1e6) +
                (RISK_FREE_INTEREST_RATE_FOR_EIGHT_HOURS * 1e18));
        } else if (premiumIndex < 0) {
            currentFundingRate = ((premiumIndex * 1e6) -
                (RISK_FREE_INTEREST_RATE_FOR_EIGHT_HOURS * 1e18));
        }

        // wherever u use currentFundingRate , u must divide it by 1e6 * 1e18= 1e24
        if (currentFundingRate > 0) {
            if (
                currentFundingRate < MAXIMUM__MAGNITUDE_OF_FUNDING_RATE * 1e22
            ) {
                return currentFundingRate;
            } else {
                return MAXIMUM__MAGNITUDE_OF_FUNDING_RATE * 1e22;
            }
        } else {
            if (
                currentFundingRate <
                -1 * MAXIMUM__MAGNITUDE_OF_FUNDING_RATE * 1e22
            ) {
                return -1 * MAXIMUM__MAGNITUDE_OF_FUNDING_RATE * 1e22;
            } else {
                return currentFundingRate;
            }
        }
    }
}
