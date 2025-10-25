/**
 * verify-hashscan.ts
 *
 * Verifies Hedera (chainId 296) deployed contracts using the HashScan Smart Contract
 * Verification API (Sourcify-compatible server).
 *
 * Endpoints used:
 *   POST /verify  (metadata.json + source files)
 *   GET  /files/any/{chain}/{address} (status/files)
 *
 * Usage examples (note the '--' separator before script-specific args):
 *   pnpm hardhat run scripts/verify-hashscan.ts --network hederaTestnet -- --address 0x... --name WikiStakeDAO
 *   Shorthand single (name:address): pnpm hardhat run scripts/verify-hashscan.ts --network hederaTestnet -- --address WikiStakeDAO:0x...
 *   Multi-contract: pnpm hardhat run scripts/verify-hashscan.ts --network hederaTestnet -- --contracts WikiStakeDAO:0x...
 *
 * Optional:
 *   --server https://server-verify.hashscan.io  (overrides default or HASHSCAN_VERIFY_SERVER env)
 *
 * Environment (optional):
 *   HASHSCAN_VERIFY_SERVER=https://server-verify.hashscan.io
 *
 * Notes:
 * - Requires prior compilation so that artifacts/contracts/<Name>.sol/<Name>.json exists.
 * - Uses artifact.metadata (string) and metadata.sources[*].content to build 'files' map.
 * - Reports result status ('perfect' or 'partial'). On success, fetches files summary.
 */

import fs from "fs";
import path from "path";
import process from "process";

interface ContractSpec {
  name: string;
  address: string;
}

function parseArgs(): { server: string; single?: ContractSpec; multi?: ContractSpec[] } {
  const args = process.argv.slice(2);
  let server = process.env.HASHSCAN_VERIFY_SERVER || "https://server-verify.hashscan.io";
  let address = "";
  let name = "";
  let contractsList = "";

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--address" && args[i + 1]) {
      address = args[++i];
    } else if (a.startsWith("--address=")) {
      address = a.split("=")[1];
    } else if (a === "--name" && args[i + 1]) {
      name = args[++i];
    } else if (a.startsWith("--name=")) {
      name = a.split("=")[1];
    } else if (a === "--contracts" && args[i + 1]) {
      contractsList = args[++i];
    } else if (a.startsWith("--contracts=")) {
      contractsList = a.split("=")[1];
    } else if (a === "--server" && args[i + 1]) {
      server = args[++i];
    } else if (a.startsWith("--server=")) {
      server = a.split("=")[1];
    }
  }

  // Shorthand address format support: --address Name:0xABC...
  if (address && address.includes(":")) {
    const [possibleName, addrVal] = address.split(":");
    if (addrVal && !name) {
      name = possibleName;
      address = addrVal;
    }
  }
  let single: ContractSpec | undefined;
  let multi: ContractSpec[] | undefined;

  if (contractsList) {
    multi = contractsList.split(",").filter(Boolean).map(entry => {
      const [n, addr] = entry.split(":");
      if (!n || !addr) throw new Error(`Invalid --contracts item: ${entry}`);
      return { name: n, address: addr };
    });
  } else if (address && name) {
    single = { name, address };
  } else if (!address && !contractsList) {
    throw new Error("Provide either --address <addr> --name <Name> OR --contracts Name:addr,...");
  }

  return { server, single, multi };
}

function loadArtifact(name: string) {
  const artifactPath = path.join(process.cwd(), "artifacts", "contracts", `${name}.sol`, `${name}.json`);
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found: ${artifactPath}. Did you compile?`);
  }
  const raw = fs.readFileSync(artifactPath, "utf8");
  const artifact = JSON.parse(raw);
  if (!artifact.metadata) throw new Error(`No metadata field in artifact for ${name}`);
  let metadata: any;
  try {
    metadata = JSON.parse(artifact.metadata);
  } catch (e) {
    throw new Error(`Failed to parse metadata JSON for ${name}: ${(e as Error).message}`);
  }
  return { artifact, metadata, metadataRaw: artifact.metadata };
}

async function verifyContract(server: string, spec: ContractSpec): Promise<boolean> {
  console.log(`[${spec.name}] Starting verification for address ${spec.address}`);
  const { metadata, metadataRaw } = loadArtifact(spec.name);

  const sources: Record<string, any> = metadata.sources || {};
  const files: Record<string, string> = { "metadata.json": metadataRaw };

  for (const srcPath of Object.keys(sources)) {
    const contentObj = sources[srcPath];
    const content = contentObj?.content;
    if (content) {
      files[srcPath] = content;
    } else {
      console.warn(`[${spec.name}] Missing content for source: ${srcPath}`);
    }
  }

  const payload = {
    address: spec.address,
    chain: "296",
    files
  };

  const resp = await fetch(`${server}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const text = await resp.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!resp.ok) {
    console.error(`[${spec.name}] Verification request failed (status ${resp.status}):`, json);
    return false;
  }

  const resultArr = json.result || [];
  const status = resultArr[0]?.status;
  console.log(`[${spec.name}] Verification response status: ${status || "unknown"}`);

  // Fetch files summary
  const filesResp = await fetch(`${server}/files/any/296/${spec.address}`);
  if (filesResp.ok) {
    const filesJson: any = await filesResp.json();
    const filesCount = Array.isArray(filesJson.files) ? filesJson.files.length : (filesJson.files?.length || 0);
    console.log(
      `[${spec.name}] Repository status: ${filesJson.status}, files count: ${filesCount}`
    );
  } else {
    console.warn(`[${spec.name}] Could not fetch files summary (status ${filesResp.status})`);
  }

  return status === "perfect" || status === "full" || status === "partial";
}

async function main() {
  const { server, single, multi } = parseArgs();
  console.log("HashScan verification server:", server);

  const contracts: ContractSpec[] = multi || (single ? [single] : []);
  let successes = 0;

  for (const c of contracts) {
    try {
      const ok = await verifyContract(server, c);
      if (ok) successes++;
    } catch (e) {
      console.error(`[${c.name}] Unexpected error:`, (e as Error).message);
    }
  }

  console.log(`Verification complete. Success: ${successes}/${contracts.length}`);
  if (successes !== contracts.length) {
    process.exitCode = 1;
  }
}

main().catch(e => {
  console.error("Script fatal error:", e);
  process.exitCode = 1;
});
