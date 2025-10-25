/**
 * flow-wikistakedao.ts (hardcoded configuration)
 *
 * Comprehensive flow test for WikiStakeDAO with NO command-line arguments:
 *  - Deploy
 *  - Optionally adjust params (fast voting window)
 *  - Propose create
 *  - Stake & vote (For / Against)
 *  - Time travel past voting window
 *  - Finalize proposal
 *  - Claim winning stake
 *  - Log balances, gas costs, summary
 *
 * Run:
 *   npx hardhat run scripts/flow-wikistakedao.ts
 *
 * Hardcoded constants below can be edited directly in this file if needed.
 */

import { network } from "hardhat";

// ================= Hardcoded Configuration =================
const CID = "QmFlowCID";
const FOR_STAKE = 500_000000000000000000n;       // 0.5 ether
const AGAINST_STAKE = 200_000000000000000000n;   // 0.2 ether
const USE_FAST_PARAMS = true;                    // apply shortened voting duration
const FAST_DURATION = 20n;                       // seconds
const TREASURY_USE_DEPLOYER = true;              // treasury = deployer
const GAS_LOG = true;                            // log gas metrics
// ===========================================================

async function main() {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const accounts = await viem.getWalletClients();
  if (accounts.length < 3) throw new Error("Need at least 3 accounts");

  const deployer = accounts[0];
  const voterA = accounts[1];
  const voterB = accounts[2];

  console.log("Hardcoded flow config:", {
    CID,
    FOR_STAKE: FOR_STAKE.toString(),
    AGAINST_STAKE: AGAINST_STAKE.toString(),
    USE_FAST_PARAMS,
    FAST_DURATION: FAST_DURATION.toString(),
    TREASURY_USE_DEPLOYER,
    GAS_LOG
  });

  async function trackTx(hash: `0x${string}`, label: string) {
    if (!GAS_LOG) return 0n;
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
    console.log(label, "gasUsed=", receipt.gasUsed.toString(), "gasCost=", gasCost.toString());
    return gasCost;
  }

  // Deploy
  const dao = await (viem as any).deployContract("WikiStakeDAO", []);
  console.log("Deployed WikiStakeDAO at:", dao.address, "self-treasury");

  // Optional fast params
  if (USE_FAST_PARAMS) {
    const proposalDeposit = await dao.read.PROPOSAL_DEPOSIT();
    const minStake = await dao.read.MIN_VOTER_STAKE();
    const feePct = await dao.read.PROTOCOL_FEE_PCT();
    const tx = await dao.write.setParams([proposalDeposit, minStake, FAST_DURATION, feePct]);
    await trackTx(tx as `0x${string}`, "setParams(fast)");
    console.log("Applied fast params duration=", FAST_DURATION.toString(), "seconds");
  }

  // Deposit requirement
  const depositReq = await dao.read.PROPOSAL_DEPOSIT();
  console.log("Deposit requirement:", depositReq.toString());

  // Propose create
  const proposeTx = await dao.write.proposeCreate([CID], { value: depositReq });
  await trackTx(proposeTx as `0x${string}`, "proposeCreate");
  console.log("Proposal transaction hash:", proposeTx);
  const proposalId = 1n;

  // Vote FOR
  const voteATx = await voterA.writeContract({
    address: dao.address,
    abi: dao.abi,
    functionName: "stakeAndVote",
    args: [proposalId, 1],
    value: FOR_STAKE
  });
  await trackTx(voteATx as `0x${string}`, "stakeAndVote FOR");
  console.log("VoterA staked FOR:", FOR_STAKE.toString());

  // Vote AGAINST
  const voteBTx = await voterB.writeContract({
    address: dao.address,
    abi: dao.abi,
    functionName: "stakeAndVote",
    args: [proposalId, 2],
    value: AGAINST_STAKE
  });
  await trackTx(voteBTx as `0x${string}`, "stakeAndVote AGAINST");
  console.log("VoterB staked AGAINST:", AGAINST_STAKE.toString());

  // Advance time
  const duration = await dao.read.VOTING_DURATION();
  const advanceSeconds = Number(duration + 2n);
  await (publicClient as any).request({ method: "evm_increaseTime", params: [advanceSeconds] });
  await (publicClient as any).request({ method: "evm_mine", params: [] });
  console.log("Time advanced by", advanceSeconds, "seconds");

  // Finalize
  const finalizeTx = await dao.write.finalizeProposal([proposalId]);
  await trackTx(finalizeTx as `0x${string}`, "finalizeProposal");
  console.log("Finalized proposal", proposalId.toString());

  // Summary
  const summary = await dao.read.proposalSummary([proposalId]) as any;
  const accepted: boolean = summary[11];
  console.log("Accepted:", accepted, "totalFor:", summary[8].toString(), "totalAgainst:", summary[9].toString());

  if (accepted) {
    const pageData = await dao.read.getPage([summary[1]]) as any;
    console.log("Page created: id=", summary[1].toString(), "cid=", pageData[0], "exists=", pageData[1]);
  }

  // Claim (For side only if accepted)
  const balBeforeClaim = await publicClient.getBalance({ address: voterA.account.address });
  if (accepted) {
    const claimTx = await voterA.writeContract({
      address: dao.address,
      abi: dao.abi,
      functionName: "claim",
      args: [proposalId]
    });
    await trackTx(claimTx as `0x${string}`, "claim");
    const balAfterClaim = await publicClient.getBalance({ address: voterA.account.address });
    console.log("VoterA balance before claim:", balBeforeClaim.toString());
    console.log("VoterA balance after  claim:", balAfterClaim.toString());
    console.log("Claim delta:", (balAfterClaim - balBeforeClaim).toString());
  } else {
    console.log("Proposal rejected; For side not winner, skipping claim.");
  }

  // Treasury balance
  const treasuryBal = await publicClient.getBalance({ address: dao.address });
  console.log("Contract (treasury) balance:", treasuryBal.toString());

  console.log("Hardcoded flow complete.");
}

main().catch(e => {
  console.error("Flow script error:", e);
  process.exitCode = 1;
});
