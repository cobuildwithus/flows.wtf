export function getRevnetTokenLogo(tokenSymbol: string) {
  if (tokenSymbol === "CREMA") {
    return "https://ipfs.io/ipfs/Qme9q6r2EFDjwNsmaquEGBz6wAnxG1UbD4tgMSihtS8isp"
  }
  if (tokenSymbol === "FOUNS") {
    return "https://ipfs.io/ipfs/Qma7knXezhyuAPx9dcaCQG5QD5nawMNFX3TXgj7waA1vKu"
  }
  return "/eth.png"
}
