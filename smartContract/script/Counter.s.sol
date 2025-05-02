// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Perp} from "../src/Perp.sol";

contract CounterScript is Script {
    Perp public perp;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        perp = new Perp(1000000);

        vm.stopBroadcast();
    }
}
