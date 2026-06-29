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
