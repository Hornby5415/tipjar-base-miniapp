# tipjar-base-miniapp

A mobile-first Base MiniApp for creator support, social payments, and transparent onchain community voting.

## Overview

TipJar is designed for a simple, focused mobile experience inside Base App browsers and on desktop.

The interface is English-only and uses a warm, card-based layout.

The primary user action is voting in a poll.

The first interaction provides immediate local reward feedback.

Poll creation is intentionally simple and supports two options.

## Features

- Mobile-first layout for Base App and desktop browsers
- English-only interface
- One clear primary action: cast a vote
- Local reward feedback after the first interaction
- Simple poll creation with two choices
- Native Wagmi configuration
- Support for injected wallets
- Support for Coinbase Wallet
- No RainbowKit dependency
- No WalletConnect project ID
- No WalletConnect connectors

## Wallet Support

The MiniApp supports the following wallet paths:

- Base App embedded wallet through `injected()`
- MetaMask through `injected()`
- OKX through `injected()`
- Coinbase Wallet through `coinbaseWallet()`

When the Base App embedded wallet is detected, it can connect automatically.

Users can still disconnect from the wallet button and choose another wallet from the wallet modal.

## Attribution

Offchain attribution is defined directly in `app/layout.tsx`.
