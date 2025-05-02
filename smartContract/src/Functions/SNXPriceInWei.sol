// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract SNXPriceInWei {
    AggregatorV3Interface internal SNXUsdPriceFeed =
        AggregatorV3Interface(0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC);
    AggregatorV3Interface internal ethUsdPriceFeed =
        AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);

    function getSNXPriceInWei() internal view returns (int256) {
        // Get latest price data
        (, int256 SNXPrice, , , ) = SNXUsdPriceFeed.latestRoundData();
        (, int256 ethPrice, , , ) = ethUsdPriceFeed.latestRoundData();

        // Validate prices
        require(SNXPrice > 0 && ethPrice > 0, "Invalid price feed response.");

        // Convert to wei-based price
        int256 SNXPriceInTermsOfWei = (SNXPrice * 1e18) / ethPrice;

        return SNXPriceInTermsOfWei;
    }
}
