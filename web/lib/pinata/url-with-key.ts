export function getPinataWithKey(url: string) {
  return `${url}?pinataGatewayToken=${process.env.PINATA_GATEWAY_KEY}`
}
