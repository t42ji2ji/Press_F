// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/TokenFactory.sol";
import "../src/PumpFun.sol";

contract DeployFactoryScript is Script {
    function run() public {
        // Read private key from env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Read PumpFun address from env
        address pumpFunAddress = vm.envAddress("PUMPFUN_ADDRESS");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy TokenFactory
        TokenFactory tokenFactory = new TokenFactory();
        console.log("TokenFactory deployed at:", address(tokenFactory));

        // Set PumpFun address in TokenFactory
        tokenFactory.setPoolAddress(pumpFunAddress);
        console.log("TokenFactory pool address set to:", pumpFunAddress);

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Deployment Info ===");
        console.log("PumpFun Address:", pumpFunAddress);
        console.log("TokenFactory Address:", address(tokenFactory));
    }
}
