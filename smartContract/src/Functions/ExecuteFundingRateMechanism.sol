// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "../StateVariables.sol";
import "./FundingRateMechanism.sol";
import "../Modifiers.sol";

contract ExecuteFundingRateMechanism is
    StateVariables,
    FundingRateMechanism,
    Modifiers
{
    // this function can be exclusively called by backend to intitiate funding rate mechanism
    function executeFundingRateMechanism() external onlyBackend {
        if (int256(block.timestamp) >= nextFundingTime) {
            fundingRateMechanism();
        }
    }
}
