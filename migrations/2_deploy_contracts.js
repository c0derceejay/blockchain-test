//deploys the files to blockchain by migrating state to state, in this case adding a smart contract to the blockchain
const Marketplace = artifacts.require("Marketplace");

module.exports = function(deployer) {
  deployer.deploy(Marketplace);
};

