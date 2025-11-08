// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProofOfConnection is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    
    event ConnectionMinted(
        address indexed user,
        string method,
        uint256 tokenId,
        string metadataURI
    );

    constructor() ERC721("TapMint", "TAPM") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    function mintConnection(
        address to,
        string memory metadataURI,
        string memory connectionMethod
    ) external {
        require(to != address(0), "Invalid address");
        require(bytes(metadataURI).length > 0, "Invalid metadata URI");
        
        uint256 newTokenId = tokenCounter;
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        emit ConnectionMinted(to, connectionMethod, newTokenId, metadataURI);
        
        tokenCounter++;
    }

    function getTotalMinted() external view returns (uint256) {
        return tokenCounter;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
