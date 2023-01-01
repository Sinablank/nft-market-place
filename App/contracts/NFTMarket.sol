// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract NFTMarket is ReentrancyGuard, Context {
    using Counters for Counters.Counter;

    Counters.Counter private _itemId;
    Counters.Counter private _itemSold;

    address private owner;
    uint256 private listingPrice = 0.01 ether;

    constructor() {
        owner = payable(_msgSender());
    }

    struct marketItem {
        uint256 itemId;
        uint256 tokenId;
        uint256 price;
        address nftContract;
        address payable seller;
        address payable owner;
        string itemName;
        string itemDescription;
        string tokenURI;
        bool sold;
    }

    mapping(uint256 => marketItem) private itemToMarket;

    event marketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getItems(uint256 id) public view returns (marketItem memory) {
        return itemToMarket[id];
    }

    function listItems(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        string memory name,
        string memory description,
        string memory tokenURI
    ) public payable nonReentrant {
        require(price > 0);
        require(msg.value == listingPrice);
        _itemId.increment();
        uint256 itemId = _itemId.current();
        itemToMarket[itemId] = marketItem(
            itemId,
            tokenId,
            price,
            nftContract,
            payable(_msgSender()),
            payable(address(0)),
            name,
            description,
            tokenURI,
            false
        );

        IERC721(nftContract).transferFrom(_msgSender(), address(this), tokenId);

        emit marketItemCreated(
            itemId,
            nftContract,
            tokenId,
            _msgSender(),
            address(0),
            price,
            false
        );
    }

    function sellMarket(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = itemToMarket[itemId].price;
        uint256 tokenId = itemToMarket[itemId].tokenId;

        require(msg.value == price);
        require(_msgSender() != itemToMarket[itemId].seller);

        Address.sendValue(itemToMarket[itemId].seller, price);
        IERC721(nftContract).transferFrom(address(this), _msgSender(), tokenId);
        itemToMarket[itemId].owner = payable(_msgSender());
        itemToMarket[itemId].sold = true;
        _itemSold.increment();
        Address.sendValue(payable(owner), listingPrice);
    }

    function showMarketItem() public view returns (marketItem[] memory) {
        uint256 itemCount = _itemId.current();
        uint256 unsoldItems = itemCount - _itemSold.current();
        uint256 currentIndex = 0;

        marketItem[] memory items = new marketItem[](unsoldItems);
        for (uint256 index = 0; index < itemCount; index++) {
            if (itemToMarket[index + 1].owner == address(0)) {
                uint256 CurrentId = index + 1;
                marketItem storage currentItem = itemToMarket[CurrentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return items;
    }

    function showMyMarketItem() public view returns (marketItem[] memory) {
        uint256 itemCount = _itemId.current();
        uint256 unsoldItems = itemCount - _itemSold.current();
        uint256 currentIndex = 0;

        marketItem[] memory items = new marketItem[](unsoldItems);
        for (uint256 index = 0; index < itemCount; index++) {
            if (itemToMarket[index + 1].owner == _msgSender()) {
                uint256 CurrentId = index + 1;
                marketItem storage currentItem = itemToMarket[CurrentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return items;
    }

    function showCreatedNFTMarketItem() public view returns (marketItem[] memory) {
        uint256 itemCount = _itemId.current();
        uint256 unsoldItems = itemCount - _itemSold.current();
        uint256 currentIndex = 0;

        marketItem[] memory items = new marketItem[](unsoldItems);
        for (uint256 index = 0; index < itemCount; index++) {
            if (itemToMarket[index + 1].seller == address(0)) {
                uint256 CurrentId = index + 1;
                marketItem storage currentItem = itemToMarket[CurrentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return items;
    }
}
