# TipJar

A mobile-first Base MiniApp for creator support, social payments, and transparent onchain community voting.

## Experience

- English-only interface
- Warm card-based layout for Base App mobile browsers and desktop
- One primary action: cast a vote
- Instant local reward feedback on the first interaction
- Simple poll creation with two options
- Native Wagmi setup with only `injected()` and `coinbaseWallet()`
- No RainbowKit, no WalletConnect project ID, and no WalletConnect connectors

## Attribution

Offchain attribution is hardcoded in `app/layout.tsx`:

```tsx
<meta name="base:app_id" content="6a212c211bf1ab98bb37b99b" />
```

This tag stays directly in the `<head>` and is not generated through the Next.js metadata API, so Base can count Offchain attribution when users open the app.

Onchain attribution is configured in `lib/wagmi.ts` with `dataSuffix`, and every `writeContract` call also passes the same `dataSuffix` explicitly:

```bash
NEXT_PUBLIC_BUILDER_CODE=bc_395dhtq2
NEXT_PUBLIC_BUILDER_CODE_DATA_SUFFIX=0x62635f33393564687471320b0080218021802180218021802180218021
```

The encoded Builder Code is appended to Wagmi clients and each contract write so Base can detect onchain interactions in the dashboard.

## Wallets

Supported wallet paths:

- Base App embedded wallet through `injected()`
- MetaMask through `injected()`
- OKX through `injected()`
- Coinbase Wallet through `coinbaseWallet()`

The Base App embedded wallet can auto-connect when detected. Users can still disconnect from the wallet button and choose another wallet from the wallet modal.

## Contract

The deployed Base contract at `0x7436e55bb95Ce016938c16f8cB0B9158e537d088` supports creator registration and tipping functions. The MiniApp uses `registerCreator` as the confirmed onchain proof for poll publishing and voting because this is the method currently available on the deployed contract.

The local contract source also includes poll helpers for a future redeploy:

- `createPoll(question, optionA, optionB)`
- `castVote(pollId, option)`
- `getPoll(pollId)`

Set the deployed address with:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x7436e55bb95Ce016938c16f8cB0B9158e537d088
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_BUILDER_CODE_DATA_SUFFIX=0x62635f33393564687471320b0080218021802180218021802180218021
```

Use `NEXT_PUBLIC_CHAIN_ID=84532` for Base Sepolia.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
