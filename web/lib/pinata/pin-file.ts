export async function pinFile(file: File, key: string) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }))
  formData.append("pinataMetadata", JSON.stringify({ name: file.name }))

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.details || "Upload failed")
  }

  const data: { IpfsHash: string } = await response.json()
  return `ipfs://${data.IpfsHash}`
}
