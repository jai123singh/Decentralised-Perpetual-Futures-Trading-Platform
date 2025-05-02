// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "./TakeOutDepositForLongPosition.sol";
import "./TakeOutDepositForShortPosition.sol";
import "./TakeOutDepositForNoOpenPosition.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../Modifiers.sol";

contract TakeOutDeposit is
    ReentrancyGuard,
    TakeOutDepositForLongPosition,
    TakeOutDepositForNoOpenPosition,
    TakeOutDepositForShortPosition,
    Modifiers
{
    // takeOutDeposit function is used when a user wants to withdraw his deposit

    // this function calls takeOutDepositForLongPosition, takeOutDepositForShortPosition function, takeOutDepositForNoOpenPosition
    function takeOutDeposit(
        address traderAddress,
        int256 amountToBeWithdrawn
    )
        external
        nonReentrant
        executeFundingRateIfNeeded
        checkUserValidity(traderAddress)
    {
        require(
            traderDepositHashmap[traderAddress] >= 0,
            "You cannot withdraw any deposit as your balance is negative."
        );
        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            takeOutDepositForLongPosition(traderAddress, amountToBeWithdrawn);
        } else if (marginOfShortPositionTraderHashmap[traderAddress] != 0) {
            takeOutDepositForShortPosition(traderAddress, amountToBeWithdrawn);
        } else {
            takeOutDepositForNoOpenPosition(traderAddress, amountToBeWithdrawn);
        }
    }
}
