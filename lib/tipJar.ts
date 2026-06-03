import type { Address } from "viem";

export const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as Address;

export const tipJarAbi = [
  {
    type: "function",
    name: "registerCreator",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "tagline", type: "string" },
      { name: "category", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getCreator",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "tagline", type: "string" },
          { name: "category", type: "string" },
          { name: "registered", type: "bool" },
          { name: "totalReceived", type: "uint256" },
          { name: "tipCount", type: "uint256" },
        ],
      },
    ],
  },
] as const;
