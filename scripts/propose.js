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

  const tx = await governor.propose(
    [token.address],
    [0],
    [
      token.interface.encodeFunctionData("mint", [
        owner.address,
        ethers.utils.parseEther("25000"),
      ]),
    ],
    "Give the owner more tokens!"
  );
  const receipt = await tx.wait();
  const event = receipt.events.find((x) => x.event === "ProposalCreated");
  const { proposalId } = event.args;

  // Save the proposal ID to a JSON file
  const proposalData = {
    proposalId: proposalId.toString(),
  };
  fs.writeFileSync("proposalData.json", JSON.stringify(proposalData, null, 2));

  // Wait for the 1 block voting delay
//   await hre.network.provider.send("evm_mine");
  console.log(`Proposal created with id ${proposalId}`);

  const state = await governor.state(proposalId);
  console.log(`Proposal state: ${state}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
