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

export const uploadImageToIPFS = async (file: File): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY
  if (!apiKey) {
    throw new Error("Lighthouse API key not found. Please set NEXT_PUBLIC_LIGHTHOUSE_API_KEY in your environment variables.")
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const response = await lighthouse.uploadBuffer(fileBuffer, apiKey)

    if (!response.data.Hash) {
      throw new Error("Failed to upload image to IPFS. No hash returned.")
    }

    return `https://gateway.lighthouse.storage/ipfs/${response.data.Hash}`
  } catch (error) {
    console.error("Lighthouse upload error:", error)
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}