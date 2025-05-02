// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Perp} from "../src/Perp.sol";

contract PerpTest is Test {
    Perp public perp;

    function setUp() public {
        perp = new Perp(1000000);
    }

    function test_Increment() public {}

    function testFuzz_SetNumber(uint256 x) public {}
}
