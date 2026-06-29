# tipjar-base-miniapp

A mobile-first Base MiniApp for creator support, social payments, and transparent onchain community voting.

## Overview

TipJar is designed to provide a simple, focused experience in Base App browsers and standard desktop browsers.

The app uses an English-only interface with a warm, card-based layout.

The main user action is voting in a poll.

After the first interaction, the app provides immediate local reward feedback.

Poll creation is intentionally lightweight and supports two choices.

The current deployed contract flow uses an available contract method as the confirmed onchain action for publishing and voting.

Future contract deployments can use the poll helper methods already present in the local contract source.

## Features

- Mobile-first layout for Base App and desktop browsers
- English-only user interface
- Clear primary action for casting a vote
- Immediate local reward feedback after the first interaction
- Simple poll creation with two options
- Native Wagmi configuration
- Support for injected wallets
- Support for Coinbase Wallet
- No RainbowKit dependency
- No WalletConnect project ID
- No WalletConnect connectors

## Wallet Support

The MiniApp supports these wallet connection paths:

- Base App embedded wallet through `injected()`
- MetaMask through `injected()`
- OKX through `injected()`
- Coinbase Wallet through `coinbaseWallet()`

When the Base App embedded wallet is detected, the app can connect to it automatically.

Users can still disconnect from the wallet button and choose another wallet from the wallet modal.

## Attribution

Offchain attribution is defined directly in `app/layout.tsx`.

```tsx
<meta name="base:app_id" content="6a212c211bf1ab98bb37b99b" />
```

This tag should remain directly inside the document `<head>`.

It is not generated through the Next.js metadata API.

Keeping the tag in the document head allows Base to count Offchain attribution when users open the MiniApp.

Onchain attribution is configured in `lib/wagmi.ts` with `dataSuffix`.

Each `writeContract` call also passes the same `dataSuffix` explicitly.

```bash
NEXT_PUBLIC_BUILDER_CODE=bc_395dhtq2
NEXT_PUBLIC_BUILDER_CODE_DATA_SUFFIX=0x62635f33393564687471320b0080218021802180218021802180218021
```

The encoded Builder Code is appended to Wagmi clients and contract writes so Base can detect onchain interactions.

## Contract

The deployed Base contract address is:

```bash
0x7436e55bb95Ce016938c16f8cB0B9158e537d088
```

The deployed contract supports creator registration and tipping functions.

The MiniApp currently uses `registerCreator` as the confirmed onchain proof for poll publishing and voting.

This approach is used because `registerCreator` is available on the deployed contract.

The local contract source also includes poll helpers intended for a future redeploy:

- `createPoll(question, optionA, optionB)`
- `castVote(pollId, option)`
- `getPoll(pollId)`

## Environment Variables

Create a local environment file and set the deployed contract address and chain configuration.

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x7436e55bb95Ce016938c16f8cB0B9158e537d088
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_BUILDER_CODE_DATA_SUFFIX=0x62635f33393564687471320b0080218021802180218021802180218021
```

Use Base Sepolia by setting:

```bash
NEXT_PUBLIC_CHAIN_ID=84532
```

## Local Development

Clone the repository:

```bash
git clone https://github.com/Hornby5415/tipjar-base-miniapp.git
cd tipjar-base-miniapp
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local development URL shown in the terminal.

## Build

Create a production build with:
