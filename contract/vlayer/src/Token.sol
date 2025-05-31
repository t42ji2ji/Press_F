// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    string public xUrl;
    string public xUser;

    constructor(
        string memory tokenName_,
        string memory tokenSymbol_,
        uint256 initialSupply,
        string memory _xUrl,
        string memory _xUser
    ) ERC20(tokenName_, tokenSymbol_) {
        _mint(msg.sender, initialSupply);
        xUrl = _xUrl;
        xUser = _xUser;
    }
}
