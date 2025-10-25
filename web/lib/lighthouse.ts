import lighthouse from "@lighthouse-web3/sdk"

export const uploadJSONToIPFS = async (json: object) => {
  const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY
  if (!apiKey) {
    throw new Error("Lighthouse API key not found in environment variables.")
  }

  const response = await lighthouse.uploadText(JSON.stringify(json), apiKey)

  if (!response.data.Hash) {
    throw new Error("Failed to upload to IPFS.")
  }

  return response.data.Hash
}