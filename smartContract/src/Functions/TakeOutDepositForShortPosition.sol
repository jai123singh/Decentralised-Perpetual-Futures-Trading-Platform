// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";
import "./CalculateTriggerPriceForShortPosition.sol";
import "../Utility/MinHeap.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TakeOutDepositForShortPosition is
    StateVariables,
    CalculateTriggerPriceForShortPosition
{
    using MinHeapLib for MinHeap;
    // takeOutDepositForShortPosition() function lets traders in short position withdraw their deposits using takeOutDeposit function
    // this function uses calculateTriggerPriceForShortPosition function
    function takeOutDepositForShortPosition(
        address traderAddress,
        int256 amountToBeWithdrawn
    ) internal {
        // Following are the checks to validate the amountToBeWithdrawn
        require(
            amountToBeWithdrawn > 0,
            "Amount to be withdrawn must be greater than 0"
        );

        int256 maximumDepositThatCanBeWithdrawn = traderDepositHashmap[
            traderAddress
        ] - maintenanceMarginOfShortPositionTraderHashmap[traderAddress];

        if (
            currentPriceOfPerp > priceAtWhichPerpWasSoldHashmap[traderAddress]
        ) {
            maximumDepositThatCanBeWithdrawn =
                maximumDepositThatCanBeWithdrawn -
                ((currentPriceOfPerp -
                    priceAtWhichPerpWasSoldHashmap[traderAddress]) *
                    perpCountOfTraderWithShortPositionHashmap[traderAddress]);
        }

        require(
            amountToBeWithdrawn <= maximumDepositThatCanBeWithdrawn,
            string(
                abi.encodePacked(
                    "Currently, the maximum amount that can be withdrawn is ",
                    Strings.toString(uint256(maximumDepositThatCanBeWithdrawn)),
                    ", but you are requesting to withdraw: ",
                    Strings.toString(uint256(amountToBeWithdrawn))
                )
            )
        );
        // If amount to be withdrawn is greater than (deposit - margin), update margin and trigger price
        if (
            amountToBeWithdrawn >
            traderDepositHashmap[traderAddress] -
                marginOfShortPositionTraderHashmap[traderAddress]
        ) {
            marginOfShortPositionTraderHashmap[traderAddress] =
                traderDepositHashmap[traderAddress] -
                amountToBeWithdrawn;

            int256 newTriggerPrice = calculateTriggerPriceForShortPosition(
                traderAddress
            );

            triggerPriceForShortPositionLiquidationHeap.push(
                traderAddress,
                newTriggerPrice
            );
        }

        // Transfer the deposit and update numberOfWeiInWeiPool and traderDepositHashmap
        (bool success, ) = payable(traderAddress).call{
            value: uint256(amountToBeWithdrawn)
        }("");
        require(success, "Something went wrong while transferring the amount.");

        numberOfWeiInWeiPool = numberOfWeiInWeiPool - amountToBeWithdrawn;
        traderDepositHashmap[traderAddress] =
            traderDepositHashmap[traderAddress] -
            amountToBeWithdrawn;
    }
}
