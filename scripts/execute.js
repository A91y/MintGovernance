const { ethers } = require("hardhat");
const fs = require("fs");
const { toUtf8Bytes, keccak256, parseEther } = ethers.utils;

async function main() {
  // Read and parse the JSON file containing deployed contract addresses
  const addressesData = fs.readFileSync("deployedAddresses.json", "utf8");
  const addresses = JSON.parse(addressesData);

  // Read and parse the JSON file containing the proposal ID
  const proposalData = fs.readFileSync("proposalData.json", "utf8");
  const proposal = JSON.parse(proposalData);
  const proposalId = proposal.proposalId;

  const [owner, otherAccount] = await ethers.getSigners();
  const governor = await ethers.getContractAt("MyGovernor", addresses.governor);
  const token = await ethers.getContractAt("MyToken", addresses.token);
  console.log(
    `Governor contract at ${governor.address}`,
    `\nToken contract at ${token.address}`
  );

  console.log(`Loaded proposal with id ${proposalId}`);

  // You can now use the proposalId as needed in your script
  const state = await governor.state(proposalId);
  console.log(`Proposal state: ${state}`);

  await governor.execute(
    [token.address],
    [0],
    [
      token.interface.encodeFunctionData("mint", [
        owner.address,
        parseEther("25000"),
      ]),
    ],
    keccak256(toUtf8Bytes("Give the owner more tokens!"))
  );

  console.log(`Executed proposal ${proposalId}`);

  const stateAfterExecution = await governor.state(proposalId);
  console.log(`Proposal state after execution: ${stateAfterExecution}`);

  const balance = await token.balanceOf(owner.address);
  console.log(`Owner balance: ${ethers.utils.formatEther(balance)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
