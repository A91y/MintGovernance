const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [owner, otherAccount] = await ethers.getSigners();
  const transactionCount = await owner.getTransactionCount();

  // gets the address of the token before it is deployed
  const futureAddress = ethers.utils.getContractAddress({
    from: owner.address,
    nonce: transactionCount + 1,
  });

  const MyGovernor = await ethers.getContractFactory("MyGovernor");
  const governor = await MyGovernor.deploy(futureAddress);

  const MyToken = await ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy(governor.address);

  const addresses = {
    governor: governor.address,
    token: token.address,
  };

  console.log(
    `Governor deployed to ${governor.address}`,
    `\nToken deployed to ${token.address}`
  );

  fs.writeFileSync(
    "deployedAddresses.json",
    JSON.stringify(addresses, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
