const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const data = fs.readFileSync("deployedAddresses.json", "utf8");
  const addresses = JSON.parse(data);

  const [owner, otherAccount] = await ethers.getSigners();
  const governor = await ethers.getContractAt("MyGovernor", addresses.governor);
  const token = await ethers.getContractAt("MyToken", addresses.token);
  console.log(
    `Governor contract at ${governor.address}`,
    `\nToken contract at ${token.address}`
  );

  await token.delegate(owner.address);

  console.log("Delegated to owner at: ", owner.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
