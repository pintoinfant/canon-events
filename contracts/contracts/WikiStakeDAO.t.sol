// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {WikiStakeDAO} from "./WikiStakeDAO.sol";

contract WikiStakeDAOTest is Test {
    WikiStakeDAO dao;
    // treasury is the contract itself now; no external treasury address

    address voterA = address(0xA11CE);
    address voterB = address(0xB0B);
    address proposer = address(0xCAFE);

    uint256 constant PROPOSAL_DEPOSIT = 1 ether;
    uint256 constant MIN_STAKE = 0.01 ether;
    uint256 constant DURATION = 1 days;
    uint256 constant FEE_PCT = 1000; // 10%

    function setUp() public {
        // fund participants
        vm.deal(voterA, 10 ether);
        vm.deal(voterB, 10 ether);
        vm.deal(proposer, 10 ether);

        dao = new WikiStakeDAO();
        // ensure params are expected (defaults already match but explicit for clarity)
        dao.setParams(PROPOSAL_DEPOSIT, MIN_STAKE, DURATION, FEE_PCT);
    }

    function _fastForward(uint256 secs) internal {
        vm.warp(block.timestamp + secs);
    }

    function test_CreateAcceptedFlow() public {
        vm.startPrank(proposer);
        uint256 pid = dao.proposeCreate{value: PROPOSAL_DEPOSIT}("QmCID1");
        vm.stopPrank();

        // voter stakes
        vm.prank(voterA);
        dao.stakeAndVote{value: 0.5 ether}(pid, uint8(WikiStakeDAO.VoteSide.For));

        vm.prank(voterB);
        dao.stakeAndVote{value: 0.2 ether}(pid, uint8(WikiStakeDAO.VoteSide.Against));

        // move time forward
        _fastForward(DURATION + 1);

        dao.finalizeProposal(pid);
        (,,,,,,,,,, bool finalized, bool accepted) = dao.proposalSummary(pid);
        assertTrue(finalized, "should be finalized");
        assertTrue(accepted, "should be accepted");
        assertEq(dao.pageCount(), 1, "pageCount should increment");
        (string memory cid, bool exists) = dao.getPage(1);
        assertEq(cid, "QmCID1", "CID mismatch");
        assertTrue(exists, "page should exist");

        // Winning voter claims stake
        uint256 balBefore = voterA.balance;
        vm.prank(voterA);
        dao.claim(pid);
        assertGt(voterA.balance, balBefore, "winner should receive stake back");
    }

    function test_RevertFinalizeEarly() public {
        vm.prank(proposer);
        uint256 pid = dao.proposeCreate{value: PROPOSAL_DEPOSIT}("QmEarly");

        vm.expectRevert("voting ongoing");
        dao.finalizeProposal(pid);
    }

    function test_DoubleVoteReverts() public {
        vm.prank(proposer);
        uint256 pid = dao.proposeCreate{value: PROPOSAL_DEPOSIT}("QmDouble");

        vm.prank(voterA);
        dao.stakeAndVote{value: 0.05 ether}(pid, uint8(WikiStakeDAO.VoteSide.For));

        vm.prank(voterA);
        vm.expectRevert("already voted");
        dao.stakeAndVote{value: 0.05 ether}(pid, uint8(WikiStakeDAO.VoteSide.For));
    }

    function test_TieRejected() public {
        vm.prank(proposer);
        uint256 pid = dao.proposeCreate{value: PROPOSAL_DEPOSIT}("QmTie");

        vm.prank(voterA);
        dao.stakeAndVote{value: 0.2 ether}(pid, uint8(WikiStakeDAO.VoteSide.For));

        vm.prank(voterB);
        dao.stakeAndVote{value: 0.2 ether}(pid, uint8(WikiStakeDAO.VoteSide.Against));

        _fastForward(DURATION + 1);
        dao.finalizeProposal(pid);

        (,,,,,,,,,, bool finalizedTie, bool acceptedTie) = dao.proposalSummary(pid);
        assertTrue(finalizedTie, "should be finalized");
        assertFalse(acceptedTie, "tie should reject");
        assertEq(dao.pageCount(), 0, "no page should be created");
    }

    function test_LosingStakeSlashed() public {
        vm.prank(proposer);
        uint256 pid = dao.proposeCreate{value: PROPOSAL_DEPOSIT}("QmSlash");

        vm.prank(voterA);
        dao.stakeAndVote{value: 0.3 ether}(pid, uint8(WikiStakeDAO.VoteSide.For));

        vm.prank(voterB);
        dao.stakeAndVote{value: 0.1 ether}(pid, uint8(WikiStakeDAO.VoteSide.Against));

        // initial contract balance (deposit + both stakes)
        // At this point contract holds proposal deposit (1 ether) + both stakes (0.3 + 0.1) = 1.4 ether
        _fastForward(DURATION + 1);
        dao.finalizeProposal(pid);
        // After finalize: proposer refunded 1 ether; losing stake (0.1) stays; winning stake (0.3) still locked until claim.
        uint256 afterFinalize = address(dao).balance;
        // Expected balance: before - deposit (1.4 - 1.0) = 0.4 ether (deposit refunded; both stakes still locked in contract)
        assertEq(afterFinalize, 0.4 ether, "contract should retain unclaimed winning + losing stake");
        // Winner claims -> contract reduces by winning stake (0.3 ether) leaving only losing stake (0.1 ether)
        vm.prank(voterA);
        dao.claim(pid);
        uint256 afterClaim = address(dao).balance;
        assertEq(afterClaim, 0.1 ether, "after winner claim only losing stake remains");
    }

    function test_WinnerClaimOnlyOnce() public {
        vm.prank(proposer);
        uint256 pid = dao.proposeCreate{value: PROPOSAL_DEPOSIT}("QmClaim");

        vm.prank(voterA);
        dao.stakeAndVote{value: 0.4 ether}(pid, uint8(WikiStakeDAO.VoteSide.For));

        vm.prank(voterB);
        dao.stakeAndVote{value: 0.1 ether}(pid, uint8(WikiStakeDAO.VoteSide.Against));

        _fastForward(DURATION + 1);
        dao.finalizeProposal(pid);

        vm.startPrank(voterA);
        uint256 before = voterA.balance;
        dao.claim(pid);
        uint256 mid = voterA.balance;
        // second claim should revert due to no stake
        vm.expectRevert("no stake");
        dao.claim(pid);
        vm.stopPrank();

        assertGt(mid, before, "first claim returns stake");
    }
}
