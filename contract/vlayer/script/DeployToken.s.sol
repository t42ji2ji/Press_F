// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/TokenFactory.sol";
import "../src/Token.sol";

contract DeployTokenScript is Script {
    struct TokenParams {
        string symbol;
        string name;
        string xUrl;
        string xUser;
    }

    function run() public {
        // Read private key from env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Read TokenFactory address from env
        address tokenFactoryAddress = vm.envAddress("TOKENFACTORY_ADDRESS");
        TokenFactory tokenFactory = TokenFactory(tokenFactoryAddress);

        // Define tokens to deploy
        TokenParams[] memory tokens = new TokenParams[](3);

        // Devcon 7
        tokens[0] = TokenParams({
            symbol: "DC",
            name: "Devcon 7",
            xUrl: "https://x.com/cbd1913/status/1860724653645561992",
            xUser: "cbd1913"
        });

        // OpenAI
        tokens[1] = TokenParams({
            symbol: "OAI",
            name: "OpenAI",
            xUrl: "https://x.com/DoraraHsieh/status/1800681948379312286",
            xUser: "DoraraHsieh"
        });

        // GM
        tokens[2] = TokenParams({
            symbol: "GM",
            name: "GM",
            xUrl: "https://x.com/kgpwfluteng/status/1928769572179448058",
            xUser: "kgpwfluteng"
        });

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy each token
        for (uint i = 0; i < tokens.length; i++) {
            console.log("\nDeploying token:", tokens[i].name);

            // Deploy token
            tokenFactory.deployERC20Token{value: 0 ether}(
                tokens[i].name,
                tokens[i].symbol,
                tokens[i].xUrl,
                tokens[i].xUser
            );

            // Get the deployed token address
            (address tokenAddress, , , , , ) = tokenFactory.tokens(i);
            console.log("Token deployed at:", tokenAddress);

            // Get token instance
            Token token = Token(tokenAddress);

            // Log token details
            console.log("Token Symbol:", token.symbol());
            console.log("Token Name:", token.name());
            console.log("Token X URL:", token.xUrl());
            console.log("Token X User:", token.xUser());
        }

        vm.stopBroadcast();
    }
}
