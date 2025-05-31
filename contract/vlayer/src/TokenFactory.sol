// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "./Token.sol";

interface IPumpFun {
    function createPool(address token, uint256 amount) external payable;

    function getCreateFee() external view returns (uint256);
}

contract TokenFactory {
    uint256 public tokenCount = 0;
    uint256 public immutable INITIAL_AMOUNT = 10 ** 27;

    address public contractAddress;

    struct TokenStructure {
        address tokenAddress;
        string tokenName;
        string tokenSymbol;
        uint256 totalSupply;
        string xUrl;
        string xUser;
    }

    TokenStructure[] public tokens;

    constructor() {}

    function deployERC20Token(
        string memory name,
        string memory ticker,
        string memory xUrl,
        string memory xUser
    ) public payable {
        Token token = new Token(name, ticker, INITIAL_AMOUNT, xUrl, xUser);
        tokenCount++;
        tokens.push(
            TokenStructure(
                address(token),
                name,
                ticker,
                INITIAL_AMOUNT,
                xUrl,
                xUser
            )
        );

        token.approve(contractAddress, INITIAL_AMOUNT);
        uint256 balance = IPumpFun(contractAddress).getCreateFee();

        require(msg.value >= balance, "Input Balance Should Be larger");
        IPumpFun(contractAddress).createPool{value: balance}(
            address(token),
            INITIAL_AMOUNT
        );
    }

    function setPoolAddress(address newAddr) public {
        require(newAddr != address(0), "Non zero Address");
        contractAddress = newAddr;
    }

    function getTokenByXUrl(
        string memory xUrl
    ) public view returns (TokenStructure memory) {
        for (uint256 i = 0; i < tokens.length; i++) {
            if (keccak256(bytes(tokens[i].xUrl)) == keccak256(bytes(xUrl))) {
                return tokens[i];
            }
        }
        revert("Token not found");
    }

    function getTokensByXUser(
        string memory xUser
    ) public view returns (TokenStructure[] memory) {
        uint256 count = 0;

        // First count matching tokens
        for (uint256 i = 0; i < tokens.length; i++) {
            if (keccak256(bytes(tokens[i].xUser)) == keccak256(bytes(xUser))) {
                count++;
            }
        }

        // Create array of matching tokens
        TokenStructure[] memory userTokens = new TokenStructure[](count);
        uint256 index = 0;

        // Fill array with matching tokens
        for (uint256 i = 0; i < tokens.length; i++) {
            if (keccak256(bytes(tokens[i].xUser)) == keccak256(bytes(xUser))) {
                userTokens[index] = tokens[i];
                index++;
            }
        }

        return userTokens;
    }
}
