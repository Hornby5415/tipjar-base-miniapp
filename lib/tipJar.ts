import type { Address } from "viem";

export const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x7436e55bb95Ce016938c16f8cB0B9158e537d088") as Address;

export const tipJarAbi = [
  {
    type: "function",
    name: "createPoll",
    stateMutability: "nonpayable",
    inputs: [
      { name: "question", type: "string" },
      { name: "optionA", type: "string" },
      { name: "optionB", type: "string" },
    ],
    outputs: [{ name: "pollId", type: "uint256" }],
  },
  {
    type: "function",
    name: "castVote",
    stateMutability: "nonpayable",
    inputs: [
      { name: "pollId", type: "uint256" },
      { name: "option", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getPoll",
    stateMutability: "view",
    inputs: [{ name: "pollId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "question", type: "string" },
          { name: "optionA", type: "string" },
          { name: "optionB", type: "string" },
          { name: "votesA", type: "uint256" },
          { name: "votesB", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
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
