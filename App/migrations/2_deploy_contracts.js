const NFT = artifacts.require("NFT");
const NFTMarket = artifacts.require("NFTMarket");

module.exports = function (deployer) {
  deployer.deploy(NFTMarket).then(function () {
    return deployer.deploy(NFT, NFTMarket.address);
  })
};