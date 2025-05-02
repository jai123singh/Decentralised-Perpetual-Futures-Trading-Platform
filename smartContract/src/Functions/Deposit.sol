// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";
import "../Modifiers.sol";

contract Deposit is StateVariables, Modifiers {
    // Below function is executed when user deposits money for trading

    //  deposited amount must be greater than 0 and it would be in wei. Hence, it must not be in decimal, else Solidity will throw an error

    // deposit function can be called by the trader when they have 0 deposited amount or already have some deposited amount

    function deposit(
        address traderAddress,
        int256 amountOfWeiToBeDeposited
    )
        external
        payable
        executeFundingRateIfNeeded
        checkUserValidity(traderAddress)
    {
        // Check must be performed to ensure that the amountOfWeiToBeDeposited matches the actual amount sent to the contract.
        // If this is not the case, simply revert the transaction

        require(
            int256(msg.value) == amountOfWeiToBeDeposited,
            "You didnot send the amount that you mentioned"
        );

        numberOfWeiInWeiPool += amountOfWeiToBeDeposited;
        traderDepositHashmap[traderAddress] += amountOfWeiToBeDeposited;
    }
}
