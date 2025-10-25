// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title WikiStakeDAO (Native HBAR Staking Governance for Wiki Pages)
/// @notice On-chain proposal + staking based governance for wiki page creation, edits, and deletion.
///         Uses native HBAR (msg.value) for proposer deposit and voter stakes. No on-chain history
///         array; page lifecycle and edits are reconstructed off-chain via emitted events (Envio).
/// @dev Educational example. Not audited. Parameters adjustable by owner; consider decentralized
///      governance + timelocks + multisig for production.

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract WikiStakeDAO is Ownable, ReentrancyGuard {
    // ============================= Enums =============================
    enum VoteSide { None, For, Against }
    enum ProposalKind { Create, Edit, Delete }

    // ============================= Structs ===========================
    struct Page {
        string cid;     // latest accepted content CID
        bool exists;    // false if deleted
    }

    struct Proposal {
        uint256 id;
        uint256 pageId;        // 0 during a Create proposal until accepted
        ProposalKind kind;
        address proposer;
        string cid;            // proposed CID (empty for Delete)
        uint256 depositAmount;
        uint256 startTime;
        uint256 endTime;
        uint256 totalFor;
        uint256 totalAgainst;
        bool finalized;
        bool accepted;
    }

    // ============================= Storage ===========================
    mapping(uint256 => Page) public pages;
    mapping(uint256 => Proposal) public proposals;
    // stakes[proposalId][voter] = amount staked
    mapping(uint256 => mapping(address => uint256)) public stakes;
    // votes[proposalId][voter] = VoteSide
    mapping(uint256 => mapping(address => VoteSide)) public votes;

    uint256 public pageCount;
    uint256 public proposalCount;

    address payable public treasury; // set to contract itself in constructor; protocol funds accumulate here

    // Parameters (modifiable by owner)
    uint256 public PROPOSAL_DEPOSIT = 1 ether;      // Example: 1 HBAR
    uint256 public MIN_VOTER_STAKE = 0.01 ether;    // Example: 0.01 HBAR
    uint256 public VOTING_DURATION = 1 days;
    uint256 public PROTOCOL_FEE_PCT = 1000;         // inactive (full refund on success); kept for backward compatibility

    // ============================= Events ============================
    event ProposalCreated(
        uint256 indexed id,
        uint256 indexed pageId,
        ProposalKind kind,
        address indexed proposer,
        string cid,
        uint256 startTime,
        uint256 endTime
    );
    event Staked(uint256 indexed proposalId, address indexed voter, VoteSide side, uint256 amount);
    event Finalized(uint256 indexed proposalId, bool accepted, uint256 totalFor, uint256 totalAgainst);
    event Claimed(uint256 indexed proposalId, address indexed account, uint256 amount);
    event PageCreated(uint256 indexed pageId, string cid);
    event PageUpdated(uint256 indexed pageId, string cid);
    event PageDeleted(uint256 indexed pageId);
    event TreasuryChanged(address indexed oldTreasury, address indexed newTreasury);
    event ParamsUpdated(uint256 deposit, uint256 minStake, uint256 votingDuration, uint256 feePct);

    // ============================= Constructor =======================
    constructor() Ownable(msg.sender) {
        treasury = payable(address(this)); // self-treasury
    }

    // ============================= Modifiers =========================
    modifier validProposal(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "invalid proposal");
        _;
    }

    modifier votingOpen(uint256 proposalId) {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp >= p.startTime && block.timestamp < p.endTime, "voting closed");
        require(!p.finalized, "finalized");
        _;
    }

    // ============================= Proposal Creation =================
    /// @notice Propose creation of a new wiki page.
    /// @param cid Content identifier of the proposed page.
    function proposeCreate(string calldata cid) external payable nonReentrant returns (uint256) {
        require(msg.value == PROPOSAL_DEPOSIT, "deposit mismatch");
        require(bytes(cid).length > 0, "empty cid");

        uint256 id = ++proposalCount;
        Proposal storage p = proposals[id];
        p.id = id;
        p.pageId = 0; // will be assigned if accepted
        p.kind = ProposalKind.Create;
        p.proposer = msg.sender;
        p.cid = cid;
        p.depositAmount = msg.value;
        p.startTime = block.timestamp;
        p.endTime = block.timestamp + VOTING_DURATION;

        emit ProposalCreated(id, 0, ProposalKind.Create, msg.sender, cid, p.startTime, p.endTime);
        return id;
    }

    /// @notice Propose an edit to an existing page.
    function proposeEdit(uint256 pageId, string calldata cid) external payable nonReentrant returns (uint256) {
        require(msg.value == PROPOSAL_DEPOSIT, "deposit mismatch");
        require(pageId > 0 && pageId <= pageCount, "invalid page");
        require(pages[pageId].exists, "page deleted");
        require(bytes(cid).length > 0, "empty cid");

        uint256 id = ++proposalCount;
        Proposal storage p = proposals[id];
        p.id = id;
        p.pageId = pageId;
        p.kind = ProposalKind.Edit;
        p.proposer = msg.sender;
        p.cid = cid;
        p.depositAmount = msg.value;
        p.startTime = block.timestamp;
        p.endTime = block.timestamp + VOTING_DURATION;

        emit ProposalCreated(id, pageId, ProposalKind.Edit, msg.sender, cid, p.startTime, p.endTime);
        return id;
    }

    /// @notice Propose deletion of an existing page.
    function proposeDelete(uint256 pageId) external payable nonReentrant returns (uint256) {
        require(msg.value == PROPOSAL_DEPOSIT, "deposit mismatch");
        require(pageId > 0 && pageId <= pageCount, "invalid page");
        require(pages[pageId].exists, "page deleted");

        uint256 id = ++proposalCount;
        Proposal storage p = proposals[id];
        p.id = id;
        p.pageId = pageId;
        p.kind = ProposalKind.Delete;
        p.proposer = msg.sender;
        p.cid = ""; // not used
        p.depositAmount = msg.value;
        p.startTime = block.timestamp;
        p.endTime = block.timestamp + VOTING_DURATION;

        emit ProposalCreated(id, pageId, ProposalKind.Delete, msg.sender, "", p.startTime, p.endTime);
        return id;
    }

    // ============================= Voting / Staking =================
    /// @notice Stake HBAR to vote For (1) or Against (2) a proposal.
    function stakeAndVote(uint256 proposalId, uint8 side) external payable nonReentrant validProposal(proposalId) votingOpen(proposalId) {
        require(side == uint8(VoteSide.For) || side == uint8(VoteSide.Against), "invalid side");
        require(msg.value >= MIN_VOTER_STAKE, "stake too small");
        require(votes[proposalId][msg.sender] == VoteSide.None, "already voted");

        Proposal storage p = proposals[proposalId];

        votes[proposalId][msg.sender] = VoteSide(side);
        stakes[proposalId][msg.sender] = msg.value;

        if (VoteSide(side) == VoteSide.For) {
            p.totalFor += msg.value;
        } else {
            p.totalAgainst += msg.value;
        }

        emit Staked(proposalId, msg.sender, VoteSide(side), msg.value);
    }

    // ============================= Finalization ======================
    /// @notice Finalize a proposal after its voting window ended.
    function finalizeProposal(uint256 proposalId) external nonReentrant validProposal(proposalId) {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp >= p.endTime, "voting ongoing");
        require(!p.finalized, "already finalized");

        p.finalized = true;
        p.accepted = p.totalFor > p.totalAgainst; // tie = reject

        // Handle proposer deposit: full refund if accepted; if rejected deposit remains in contract
        if (p.accepted) {
            _safeTransfer(payable(p.proposer), p.depositAmount);
        }

        // Slash losing side stakes: no action (losing stakes already reside in contract balance).

        // Apply page change if accepted
        if (p.accepted) {
            if (p.kind == ProposalKind.Create) {
                uint256 newPageId = ++pageCount;
                pages[newPageId] = Page({ cid: p.cid, exists: true });
                p.pageId = newPageId; // update stored proposal to reference created page
                emit PageCreated(newPageId, p.cid);
            } else if (p.kind == ProposalKind.Edit) {
                Page storage pg = pages[p.pageId];
                // already validated exists at proposal time; can still exist unless deleted by separate accepted delete
                if (pg.exists) {
                    pg.cid = p.cid;
                    emit PageUpdated(p.pageId, p.cid);
                } else {
                    // If page was deleted by a different proposal finalized earlier (rare race), do nothing.
                }
            } else if (p.kind == ProposalKind.Delete) {
                Page storage pgDel = pages[p.pageId];
                if (pgDel.exists) {
                    pgDel.exists = false;
                    emit PageDeleted(p.pageId);
                }
            }
        }

        emit Finalized(proposalId, p.accepted, p.totalFor, p.totalAgainst);
    }

    // ============================= Claim =============================
    /// @notice Claim staked HBAR if on the winning side. Losing stakes already slashed.
    function claim(uint256 proposalId) external nonReentrant validProposal(proposalId) {
        Proposal storage p = proposals[proposalId];
        require(p.finalized, "not finalized");

        uint256 staked = stakes[proposalId][msg.sender];
        require(staked > 0, "no stake");

        VoteSide userSide = votes[proposalId][msg.sender];
        bool isWinner = (p.accepted && userSide == VoteSide.For) || (!p.accepted && userSide == VoteSide.Against);

        // Clear storage before external transfer
        stakes[proposalId][msg.sender] = 0;
        votes[proposalId][msg.sender] = VoteSide.None;

        if (isWinner) {
            _safeTransfer(payable(msg.sender), staked);
            emit Claimed(proposalId, msg.sender, staked);
        } else {
            emit Claimed(proposalId, msg.sender, 0);
        }
    }

    // ============================= Admin Setters =====================
    // function setTreasury(...) removed: treasury fixed to contract itself

    function setParams(
        uint256 _proposalDeposit,
        uint256 _minStake,
        uint256 _duration,
        uint256 _feePct
    ) external onlyOwner {
        require(_feePct <= 5000, "fee too high");
        PROPOSAL_DEPOSIT = _proposalDeposit;
        MIN_VOTER_STAKE = _minStake;
        VOTING_DURATION = _duration;
        PROTOCOL_FEE_PCT = _feePct;
        emit ParamsUpdated(_proposalDeposit, _minStake, _duration, _feePct);
    }

    // ============================= Views =============================
    function getPage(uint256 pageId) external view returns (string memory cid, bool exists) {
        Page storage pg = pages[pageId];
        return (pg.cid, pg.exists);
    }

    function proposalSummary(uint256 proposalId) external view returns (
        uint256 id,
        uint256 pageId,
        ProposalKind kind,
        address proposer,
        string memory cid,
        uint256 depositAmount,
        uint256 startTime,
        uint256 endTime,
        uint256 totalFor,
        uint256 totalAgainst,
        bool finalized,
        bool accepted
    ) {
        Proposal storage p = proposals[proposalId];
        return (
            p.id,
            p.pageId,
            p.kind,
            p.proposer,
            p.cid,
            p.depositAmount,
            p.startTime,
            p.endTime,
            p.totalFor,
            p.totalAgainst,
            p.finalized,
            p.accepted
        );
    }

    // ============================= Internal ==========================
    function _safeTransfer(address payable to, uint256 amount) internal {
        if (amount == 0) return;
        (bool sent, ) = to.call{ value: amount }("");
        require(sent, "transfer failed");
    }

    // Accept accidental HBAR transfers (not required but convenient)
    receive() external payable {}
    fallback() external payable {}
}
