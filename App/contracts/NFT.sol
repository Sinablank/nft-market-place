// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721URIStorage{

    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;

    address private NftMarketAddress;
    event mint (address owner, uint256 tokenId);

    constructor (address NftMarketA) ERC721("Sina", "SIN"){
        NftMarketAddress = NftMarketA;
    }

    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenId.increment();
        uint256 newTokenId = _tokenId.current();

        _mint(_msgSender(), newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        setApprovalForAll(NftMarketAddress, true);
        
        emit mint (_msgSender(), newTokenId);
        return newTokenId;
    }

}

