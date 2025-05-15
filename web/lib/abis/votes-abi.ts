export const VotesAbi = [
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
    ],
    name: "getPastVotes",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "getVotes",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const
