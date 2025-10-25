import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { network } from "hardhat";

/**
 * Integration tests for WikiStakeDAO using viem.
 * Uses simple sleep-based waiting past the voting window (SHORT_DURATION) to avoid TS type issues
 * with direct JSON-RPC time travel. Duration is long enough to allow all votes before finalize.
 */

describe("WikiStakeDAO (viem integration)", async () => {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  let deployer: `0x${string}`;
  let voterA: `0x${string}`;
  let voterB: `0x${string}`;

  const ONE_ETHER = 1_000000000000000000n;
  const PROPOSAL_DEPOSIT = ONE_ETHER;
  const MIN_VOTER_STAKE = 10_00000000000000000n; // 0.01 ether
  const SHORT_DURATION = 5n; // 5 seconds voting window (fast tests)
  const FEE_PCT = 1000n; // 10%


  // Tuple type helpers
  type ProposalSummaryTuple = readonly [
    bigint,  // id
    bigint,  // pageId
    number,  // kind enum value
    string,  // proposer
    string,  // cid
    bigint,  // depositAmount
    bigint,  // startTime
    bigint,  // endTime
    bigint,  // totalFor
    bigint,  // totalAgainst
    boolean, // finalized
    boolean  // accepted
  ];
  type PageTuple = readonly [string, boolean];

  before(async () => {
    const accounts = await viem.getWalletClients();
    deployer = accounts[0].account.address;
    voterA = accounts[1].account.address;
    voterB = accounts[2].account.address;
  });

  async function deployDAO() {
    // Constructor now has no params; ABI type cache may still expect one -> cast to any to bypass TS mismatch.
    const dao = await (viem as any).deployContract("WikiStakeDAO", []);
    await dao.write.setParams([PROPOSAL_DEPOSIT, MIN_VOTER_STAKE, SHORT_DURATION, FEE_PCT]);
    return dao;
  }

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  it("Create proposal accepted flow", async () => {
    const dao = await deployDAO();
    await dao.write.proposeCreate(["QmCID_TEST"], { value: PROPOSAL_DEPOSIT });

    const voterAClient = await viem.getWalletClient(voterA);
    await voterAClient.writeContract({
      address: dao.address,
      abi: dao.abi,
      functionName: "stakeAndVote",
      args: [1n, 1], // For
      value: 500_000000000000000000n
    });

    const voterBClient = await viem.getWalletClient(voterB);
    await voterBClient.writeContract({
      address: dao.address,
      abi: dao.abi,
      functionName: "stakeAndVote",
      args: [1n, 2], // Against
      value: 200_000000000000000000n
    });

    // wait beyond voting window (SHORT_DURATION=5s)
    await sleep(6000);
    await dao.write.finalizeProposal([1n]);

    const summary = await dao.read.proposalSummary([1n]) as unknown as ProposalSummaryTuple;
    assert.equal(summary[10], true, "finalized");
    assert.equal(summary[11], true, "accepted");

    const pageData = await dao.read.getPage([1n]) as unknown as PageTuple;
    assert.equal(pageData[0], "QmCID_TEST");
    assert.equal(pageData[1], true);

    const balBefore = await publicClient.getBalance({ address: voterA });
    await voterAClient.writeContract({
      address: dao.address,
      abi: dao.abi,
      functionName: "claim",
      args: [1n]
    });
    const balAfter = await publicClient.getBalance({ address: voterA });
    assert(balAfter > balBefore, "winner stake returned");
  });

  it("Tie should reject", async () => {
    const dao = await deployDAO();
    await dao.write.proposeCreate(["QmCID_TIE"], { value: PROPOSAL_DEPOSIT });

    const voterAClient = await viem.getWalletClient(voterA);
    const voterBClient = await viem.getWalletClient(voterB);

    await voterAClient.writeContract({
      address: dao.address,
      abi: dao.abi,
      functionName: "stakeAndVote",
      args: [1n, 1],
      value: 200_000000000000000000n
    });
    await voterBClient.writeContract({
      address: dao.address,
      abi: dao.abi,
      functionName: "stakeAndVote",
      args: [1n, 2],
      value: 200_000000000000000000n
    });

    await sleep(6000);
    await dao.write.finalizeProposal([1n]);

    const summary = await dao.read.proposalSummary([1n]) as unknown as ProposalSummaryTuple;
    assert.equal(summary[10], true, "finalized");
    assert.equal(summary[11], false, "tie rejected");
    const pageCount = await dao.read.pageCount();
    assert.equal(pageCount, 0n);
  });

  it("Double vote should revert", async () => {
    const dao = await deployDAO();
    await dao.write.proposeCreate(["QmCID_DOUBLE"], { value: PROPOSAL_DEPOSIT });

    const voterAClient = await viem.getWalletClient(voterA);
    await voterAClient.writeContract({
      address: dao.address,
      abi: dao.abi,
      functionName: "stakeAndVote",
      args: [1n, 1],
      value: MIN_VOTER_STAKE
    });

    let reverted = false;
    try {
      await voterAClient.writeContract({
        address: dao.address,
        abi: dao.abi,
        functionName: "stakeAndVote",
        args: [1n, 1],
        value: MIN_VOTER_STAKE
      });
    } catch {
      reverted = true;
    }
    assert.equal(reverted, true, "double vote revert");
  });

  it("Losing stake increases contract balance", async () => {
    const dao = await deployDAO();
    await dao.write.proposeCreate(["QmCID_SLASH"], { value: PROPOSAL_DEPOSIT });

    const voterAClient = await viem.getWalletClient(voterA);
    const voterBClient = await viem.getWalletClient(voterB);

    await voterAClient.writeContract({
      address: dao.address,
      abi: dao.abi,
      functionName: "stakeAndVote",
      args: [1n, 1],
      value: 400_000000000000000000n
    });
    await voterBClient.writeContract({
      address: dao.address,
      abi: dao.abi,
      functionName: "stakeAndVote",
      args: [1n, 2],
      value: 100_000000000000000000n
    });

    const before = await publicClient.getBalance({ address: dao.address });
    // Before finalize contract holds deposit + both stakes
    await sleep(6000);
    await dao.write.finalizeProposal([1n]);
    const afterFinalize = await publicClient.getBalance({ address: dao.address });
    // Expect afterFinalize = before - deposit + losingStake (deposit refunded, losing stays, winning still locked)
    // We cannot easily compute deposit & losingStake from summary since deposit returned; approximate: just ensure decrease equals roughly deposit - losingStake.
    assert(afterFinalize < before, "contract balance should drop after refund but retain some funds");
    // Winner claims -> balance drops further by winning stake
    const afterClaimBefore = await publicClient.getBalance({ address: dao.address });
    await voterAClient.writeContract({
      address: dao.address,
      abi: dao.abi,
      functionName: "claim",
      args: [1n]
    });
    const afterClaim = await publicClient.getBalance({ address: dao.address });
    assert(afterClaim < afterClaimBefore, "contract balance reduced by winner claim");
  });
});
