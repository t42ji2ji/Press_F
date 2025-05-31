// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PumpFun.sol";
import "../src/Token.sol";
import "../src/TokenFactory.sol";

contract TradeTokensScript is Script {
    function run() public {
        // Read private key from env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Read contract addresses from env
        address pumpFunAddress = vm.envAddress("PUMPFUN_ADDRESS");
        address tokenFactoryAddress = vm.envAddress("TOKENFACTORY_ADDRESS");

        PumpFun pumpFun = PumpFun(payable(pumpFunAddress));
        TokenFactory tokenFactory = TokenFactory(tokenFactoryAddress);

        // Constants
        uint256 buyAmount = 1_000_000 * 1e18;
        uint256 maxEthCost = 0.05 ether;

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Process first 3 tokens
        for (uint i = 0; i < 3; i++) {
            // Get token address from factory
            (
                address tokenAddress,
                string memory name,
                string memory symbol,
                ,
                ,

            ) = tokenFactory.tokens(i);
            console.log(
                string.concat("\nProcessing token: ", name, " (", symbol, ")")
            );
            console.log("Token address:", tokenAddress);

            // Get token instance
            Token token = Token(tokenAddress);

            // Buy tokens
            console.log("\nBuying tokens...");
            console.log("Amount:", buyAmount);
            console.log("Max ETH cost:", maxEthCost);

            pumpFun.buy{value: maxEthCost}(tokenAddress, buyAmount, maxEthCost);
            IERC20(tokenAddress).approve(pumpFunAddress, buyAmount);

            // Get token balance
            uint256 balance = token.balanceOf(address(this));
            console.log("Token balance after buy:", balance);

            // Sell all tokens
            console.log("\nSelling all tokens...");
            pumpFun.sell(
                tokenAddress,
                buyAmount,
                0 // minEthOutput = 0 to ensure transaction goes through
            );

            // Get final token balance
            balance = token.balanceOf(address(this));
            console.log("Final token balance:", balance);
        }

        vm.stopBroadcast();
    }
}
