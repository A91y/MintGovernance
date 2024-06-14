const { ethers } = require("hardhat");
const fs = require("fs");

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

  const tx = await governor.castVote(proposalId, 1);
  const receipt = await tx.wait();
  const voteCastEvent = receipt.events.find((x) => x.event === "VoteCast");

  // wait for the 1 block voting period
//   await hre.network.provider.send("evm_mine");

  const voteWeight = voteCastEvent.args.weight.toString();
  console.log(`Vote weight: ${voteWeight}`);

  console.log(`Vote cast for proposal ${proposalId}`);

  // Test for should have set the vote
  const stateAfterVote = await governor.state(proposalId);
  console.log(`Proposal state after vote: ${stateAfterVote}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
