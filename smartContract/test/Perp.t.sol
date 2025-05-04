// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Perp} from "../src/Perp.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// In this contract, there are tests for all the external functions that would be called by users
contract PerpTest is Test {
    Perp public perp;
    address public owner;
    address public beneficiary;
    address public backend;

    // Chainlink addresses from SNXPriceInWei.sol
    address constant SNX_USD_FEED = 0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC;
    address constant ETH_USD_FEED = 0x694AA1769357215DE4FAC081bf1f309aDC325306;

    function setUp() public {
        owner = address(this);
        beneficiary = makeAddr("beneficiary");
        backend = makeAddr("backend");

        // Mock price feeds before deployment
        mockPriceFeed(SNX_USD_FEED, 2e8);
        mockPriceFeed(ETH_USD_FEED, 2000e8);

        // Fund owner and deploy contract with 1 ETH
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        perp = new Perp{value: 1 ether}(100000);

        // Setup roles
        vm.prank(owner);
        perp.changeBeneficiary(beneficiary);
        vm.prank(owner);
        perp.changeBackend(backend);
    }

    function mockPriceFeed(address priceFeed, int256 price) internal {
        // Mock latestRoundData
        vm.mockCall(
            priceFeed,
            abi.encodeWithSelector(
                AggregatorV3Interface.latestRoundData.selector
            ),
            abi.encode(
                uint80(0), // roundId
                price, // answer
                uint256(0), // startedAt
                block.timestamp, // updatedAt
                uint80(0) // answeredInRound
            )
        );

        // Mock decimals
        vm.mockCall(
            priceFeed,
            abi.encodeWithSelector(AggregatorV3Interface.decimals.selector),
            abi.encode(uint8(8))
        );
    }

    // Helper function to convert ETH amounts
    function toWei(uint256 amount) internal pure returns (uint256) {
        return amount * 1e18;
    }

    function testBasicDeployment() public view {
        // Verify initial price calculation
        int256 expectedPrice = (2e8 * 1e18) / 2000e8;
        assertEq(perp.getOraclePrice(), expectedPrice);
    }

    // tests for deposit function
    function testDepositIncreasesTraderBalanceAndWeiPool() public {
        address alice = makeAddr("alice");
        uint256 depositAmount = toWei(1);

        vm.deal(alice, depositAmount);
        vm.prank(alice);
        perp.deposit{value: depositAmount}(alice, int256(depositAmount));

        assertEq(perp.getAmountOfDepositOfTrader(alice), int256(depositAmount));
        assertEq(perp.getAmountOfWeiInWeiPool(), int256(depositAmount) + 1e18); // 1e18 from initial deployment
    }

    function testMultipleDepositsAccumulate() public {
        address alice = makeAddr("alice");
        uint256 firstDeposit = toWei(1);
        uint256 secondDeposit = toWei(2);

        vm.deal(alice, firstDeposit + secondDeposit);
        vm.startPrank(alice);
        perp.deposit{value: firstDeposit}(alice, int256(firstDeposit));
        perp.deposit{value: secondDeposit}(alice, int256(secondDeposit));
        vm.stopPrank();

        assertEq(
            perp.getAmountOfDepositOfTrader(alice),
            int256(firstDeposit + secondDeposit)
        );
        assertEq(
            perp.getAmountOfWeiInWeiPool(),
            int256(firstDeposit + secondDeposit) + 1e18
        );
    }

    function testFailDepositMismatchedValue() public {
        address alice = makeAddr("alice");
        uint256 sentValue = toWei(1);
        uint256 declaredValue = toWei(2);

        vm.deal(alice, sentValue);
        vm.prank(alice);
        perp.deposit{value: sentValue}(alice, int256(declaredValue));
    }

    function testDepositZero() public {
        address alice = makeAddr("alice");

        vm.prank(alice);
        perp.deposit{value: 0}(alice, 0);

        assertEq(perp.getAmountOfDepositOfTrader(alice), 0);
        assertEq(perp.getAmountOfWeiInWeiPool(), 1e18); //  initial deployment ETH
    }

    // tests for buy function

    function testBasicBuyPosition() public {
        address alice = makeAddr("alice");
        uint256 depositAmount = toWei(10);
        vm.deal(alice, depositAmount);

        vm.startPrank(alice);
        perp.deposit{value: depositAmount}(alice, int256(depositAmount));

        int256 initialPrice = perp.getOraclePrice();

        int256 perpCount = 10;
        int256 leverage = 2;
        int256 slippageTolerance = 50;

        perp.buy(alice, perpCount, leverage, initialPrice, slippageTolerance);

        // Verify position was opened correctly
        assertEq(perp.getPositionOfTrader(alice), 1); // 1 means long position
        assertEq(perp.getNumberOfPerpInOpenPositionOfTrader(alice), perpCount);
        assertEq(perp.getLeverageUsedByTrader(alice), leverage);

        // Verify the price at which perps were bought
        int256 buyPrice = perp.getPerpPriceAtWhichTraderEnteredTheTrade(alice);
        assertGt(buyPrice, 0); // Price should be positive

        // Verify trader's margin is properly set
        int256 margin = perp.getMarginOfTrader(alice);
        assertGt(margin, 0); // Margin should be positive

        // Verify maintenance margin is properly set
        int256 maintenanceMargin = perp.getMaintenanceMarginOfTrader(alice);
        assertGt(maintenanceMargin, 0); // Maintenance margin should be positive
        assertLt(maintenanceMargin, margin); // Maintenance margin should be less than initial margin
        vm.stopPrank();
    }

    function testFailBuyWithInsufficientDeposit() public {
        address bob = makeAddr("bob");
        uint256 depositAmount = 1e17; // 0.1 ETH deposit (1e17 wei)
        vm.deal(bob, depositAmount);

        vm.startPrank(bob);
        perp.deposit{value: depositAmount}(bob, int256(depositAmount));

        // Get initial price from oracle
        int256 initialPrice = perp.getOraclePrice();

        int256 perpCount = 5000;
        int256 leverage = 1;
        int256 slippageTolerance = 1000; //10%

        perp.buy(bob, perpCount, leverage, initialPrice, slippageTolerance);

        // Verify no position was opened
        assertEq(perp.getPositionOfTrader(bob), 0); // 0 means no position
        vm.stopPrank();
    }

    function testFailBuyWithSlippageExceeded() public {
        address charlie = makeAddr("charlie");
        uint256 depositAmount = toWei(100); //100 ETH
        vm.deal(charlie, depositAmount);

        vm.startPrank(charlie);
        perp.deposit{value: depositAmount}(charlie, int256(depositAmount));

        int256 initialPrice = perp.getOraclePrice();

        // Prepare buy parameters - buying many perps with very low slippage tolerance
        int256 perpCount = 90000;
        int256 leverage = 20;
        int256 slippageTolerance = 1; // Only 0.01% slippage tolerance (very strict)

        // Expect revert due to slippage exceeding tolerance
        perp.buy(charlie, perpCount, leverage, initialPrice, slippageTolerance);

        // Verify no position was opened
        assertEq(perp.getPositionOfTrader(charlie), 0); // 0 means no position
        vm.stopPrank();
    }

    // tests for sell function
    function testBasicSellPosition() public {
        address alice = makeAddr("alice");
        uint256 depositAmount = toWei(10);
        vm.deal(alice, depositAmount);

        vm.startPrank(alice);
        perp.deposit{value: depositAmount}(alice, int256(depositAmount));

        int256 initialPrice = perp.getOraclePrice();

        int256 perpCount = 10;
        int256 leverage = 2;
        int256 slippageTolerance = 50; // 0.5%

        perp.sell(alice, perpCount, leverage, initialPrice, slippageTolerance);

        // Verify position was opened correctly
        assertEq(perp.getPositionOfTrader(alice), -1); // -1 means short position
        assertEq(perp.getNumberOfPerpInOpenPositionOfTrader(alice), perpCount);
        assertEq(perp.getLeverageUsedByTrader(alice), leverage);

        // Verify the price at which perps were sold
        int256 sellPrice = perp.getPerpPriceAtWhichTraderEnteredTheTrade(alice);
        assertGt(sellPrice, 0); // Price should be positive

        // Verify trader's margin is properly set
        int256 margin = perp.getMarginOfTrader(alice);
        assertGt(margin, 0); // Margin should be positive

        // Verify maintenance margin is properly set
        int256 maintenanceMargin = perp.getMaintenanceMarginOfTrader(alice);
        assertGt(maintenanceMargin, 0); // Maintenance margin should be positive
        assertLt(maintenanceMargin, margin); // Maintenance margin should be less than initial margin
        vm.stopPrank();
    }

    function testFailSellWithInsufficientDeposit() public {
        address bob = makeAddr("bob");
        uint256 depositAmount = 1e17; // 0.1 ETH deposit (1e17 wei)
        vm.deal(bob, depositAmount);

        vm.startPrank(bob);
        perp.deposit{value: depositAmount}(bob, int256(depositAmount));

        int256 initialPrice = perp.getOraclePrice();

        int256 perpCount = 5000;
        int256 leverage = 1;
        int256 slippageTolerance = 1000; // 10%

        // This will fail because bob doesn't have enough deposit
        perp.sell(bob, perpCount, leverage, initialPrice, slippageTolerance);

        // Verify no position was opened
        assertEq(perp.getPositionOfTrader(bob), 0); // 0 means no position
        vm.stopPrank();
    }

    function testFailSellWithSlippageExceeded() public {
        address charlie = makeAddr("charlie");
        uint256 depositAmount = toWei(100); // 100 ETH deposit
        vm.deal(charlie, depositAmount);

        vm.startPrank(charlie);
        perp.deposit{value: depositAmount}(charlie, int256(depositAmount));

        int256 initialPrice = perp.getOraclePrice();

        // Prepare sell parameters - selling many perps with very low slippage tolerance
        int256 perpCount = 90000; // Sell almost all available perps (expecting high slippage)
        int256 leverage = 20;
        int256 slippageTolerance = 1; // Only 0.01% slippage tolerance (very strict)

        // This will fail due to slippage exceeding tolerance
        perp.sell(
            charlie,
            perpCount,
            leverage,
            initialPrice,
            slippageTolerance
        );

        // Verify no position was opened
        assertEq(perp.getPositionOfTrader(charlie), 0); // 0 means no position
        vm.stopPrank();
    }

    // tests for addMoreMarginToOpenPosition function
    function testAddMarginToLongPosition() public {
        address alice = makeAddr("alice");
        uint256 depositAmount = toWei(10);
        int256 extraMargin = int256(toWei(1));

        // Setup long position
        vm.deal(alice, depositAmount);
        vm.startPrank(alice);
        perp.deposit{value: depositAmount}(alice, int256(depositAmount));

        // Open long position
        perp.buy(alice, 100, 2, perp.getOraclePrice(), 100);

        // Get initial values
        int256 initialTraderMargin = perp.getMarginOfTrader(alice);
        int256 initialTriggerPrice = perp.getTriggerPriceOfTrader(alice);

        // Add more margin
        perp.addMoreMarginToOpenPosition(alice, extraMargin);

        // Verify updates
        assertEq(
            perp.getMarginOfTrader(alice),
            initialTraderMargin + extraMargin,
            "Margin should increase"
        );
        assertTrue(
            perp.getTriggerPriceOfTrader(alice) < initialTriggerPrice,
            "Trigger price should decrease"
        );

        vm.stopPrank();
    }

    function testAddMarginToShortPosition() public {
        address bob = makeAddr("bob");
        uint256 depositAmount = toWei(10);
        int256 extraMargin = int256(toWei(1));

        // Setup short position
        vm.deal(bob, depositAmount);
        vm.startPrank(bob);
        perp.deposit{value: depositAmount}(bob, int256(depositAmount));

        // Open short position
        perp.sell(bob, 100, 2, perp.getOraclePrice(), 100);

        // Get initial values
        int256 initialTraderMargin = perp.getMarginOfTrader(bob);
        int256 initialTriggerPrice = perp.getTriggerPriceOfTrader(bob);

        // Add more margin
        perp.addMoreMarginToOpenPosition(bob, extraMargin);

        // Verify margin increase

        assertEq(
            perp.getMarginOfTrader(bob),
            initialTraderMargin + extraMargin,
            "Margin should increase"
        );

        assertTrue(
            perp.getTriggerPriceOfTrader(bob) > initialTriggerPrice,
            "Trigger price should increase"
        );

        vm.stopPrank();
    }

    // tests for takeOutDeposit function

    // Test withdrawing deposit when trader has a long position
    function testTakeOutDepositWithLongPosition() public {
        address alice = makeAddr("alice");
        uint256 depositAmount = toWei(10);
        vm.deal(alice, depositAmount);

        // Setup deposit
        vm.startPrank(alice);
        perp.deposit{value: depositAmount}(alice, int256(depositAmount));

        // Open long position
        perp.buy(alice, 100, 2, perp.getOraclePrice(), 100);

        // Verify initial state
        int256 initialDeposit = perp.getAmountOfDepositOfTrader(alice);

        // Try to withdraw some amount
        int256 withdrawAmount = initialDeposit / 4; // 25% of deposit
        perp.takeOutDeposit(alice, withdrawAmount);

        // Verify state after withdrawal
        assertEq(
            perp.getAmountOfDepositOfTrader(alice),
            initialDeposit - withdrawAmount,
            "Deposit should decrease by withdrawn amount"
        );

        vm.stopPrank();
    }

    // Test withdrawing deposit when trader has a short position
    function testTakeOutDepositWithShortPosition() public {
        address bob = makeAddr("bob");
        uint256 depositAmount = toWei(10); // 10 ETH
        vm.deal(bob, depositAmount);

        // Setup deposit
        vm.startPrank(bob);
        perp.deposit{value: depositAmount}(bob, int256(depositAmount));

        // Open short position
        perp.sell(bob, 100, 2, perp.getOraclePrice(), 100);

        // Verify initial state
        int256 initialDeposit = perp.getAmountOfDepositOfTrader(bob);

        //  withdraw 25% amount
        int256 withdrawAmount = initialDeposit / 4; // 25% of deposit
        perp.takeOutDeposit(bob, withdrawAmount);

        // Verify state after withdrawal
        assertEq(
            perp.getAmountOfDepositOfTrader(bob),
            initialDeposit - withdrawAmount,
            "Deposit should decrease by withdrawn amount"
        );

        vm.stopPrank();
    }

    // Test attempting to withdraw more than allowed (should fail)
    function testFailTakeOutDepositExceedingAllowedAmount() public {
        address charlie = makeAddr("charlie");
        uint256 depositAmount = toWei(5); // 5 ETH deposit
        vm.deal(charlie, depositAmount);

        // Setup deposit
        vm.startPrank(charlie);
        perp.deposit{value: depositAmount}(charlie, int256(depositAmount));

        // Open long position that uses most of the deposit as margin
        perp.buy(charlie, 300, 3, perp.getOraclePrice(), 100);

        // Try to withdraw more than allowed (exceeding available funds)
        int256 withdrawAmount = int256(depositAmount);
        // Trying to withdraw full deposit
        // This should fail because some deposit is locked as margin
        perp.takeOutDeposit(charlie, withdrawAmount);
        vm.stopPrank();
    }

    // tests for closeOpenPosition function

    // Test closing a long position
    function testCloseOpenPositionForLongPosition() public {
        address alice = makeAddr("alice");
        uint256 depositAmount = toWei(10);
        vm.deal(alice, depositAmount);

        // Setup deposit
        vm.startPrank(alice);
        perp.deposit{value: depositAmount}(alice, int256(depositAmount));

        // Open long position
        perp.buy(alice, 100, 2, perp.getOraclePrice(), 100);

        // Verify we have a long position
        assertEq(
            perp.getPositionOfTrader(alice),
            1,
            "Should have a long position"
        );

        // Close the position
        perp.closeOpenPosition(alice);

        // Verify position is closed
        assertEq(
            perp.getPositionOfTrader(alice),
            0,
            "Position should be closed (0)"
        );

        vm.stopPrank();
    }

    // Test closing a short position
    function testCloseOpenPositionForShortPosition() public {
        address bob = makeAddr("bob");
        uint256 depositAmount = toWei(10);
        vm.deal(bob, depositAmount);

        // Setup deposit
        vm.startPrank(bob);
        perp.deposit{value: depositAmount}(bob, int256(depositAmount));

        // Open short position
        perp.sell(bob, 100, 2, perp.getOraclePrice(), 100);

        // Verify we have a short position
        assertEq(
            perp.getPositionOfTrader(bob),
            -1,
            "Should have a short position"
        );

        // Close the position
        perp.closeOpenPosition(bob);

        // Verify position is closed
        assertEq(
            perp.getPositionOfTrader(bob),
            0,
            "Position should be closed (0)"
        );

        vm.stopPrank();
    }

    // Test attempting to close a position when there is none (should fail)
    function testFailClosePositionWithNoOpenPosition() public {
        address charlie = makeAddr("charlie");
        uint256 depositAmount = toWei(5);
        vm.deal(charlie, depositAmount);

        // Setup deposit only, no position opened
        vm.startPrank(charlie);
        perp.deposit{value: depositAmount}(charlie, int256(depositAmount));

        // Try to close a non-existent position
        // This should revert with "You have no open position"
        perp.closeOpenPosition(charlie);
        vm.stopPrank();
    }
}
