"use client";

import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { zeroAddress } from "viem";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { contractAddress, tipJarAbi } from "@/lib/tipJar";
import { builderCodeDataSuffix, targetChain, targetChainId } from "@/lib/wagmi";

type RewardState = {
  points: number;
  votes: number;
  lastAction: string;
};

type PollState = {
  question: string;
  optionA: string;
  optionB: string;
  selected: 1 | 2;
  votesA: number;
  votesB: number;
  localPollId: number;
};

const emptyReward: RewardState = {
  points: 0,
  votes: 0,
  lastAction: "",
};

const defaultPoll: PollState = {
  question: "Which creator support idea should TipJar prioritize this week?",
  optionA: "Community funding",
  optionB: "Social payment tools",
  selected: 1,
  votesA: 12,
  votesB: 9,
  localPollId: 0,
};

const isConfigured = contractAddress !== zeroAddress;

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const { data: txHash, writeContract, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [reward, setReward] = useState<RewardState>(emptyReward);
  const [poll, setPoll] = useState<PollState>(defaultPoll);
  const [walletOpen, setWalletOpen] = useState(false);
  const [status, setStatus] = useState("Create or choose a poll, then cast one transparent vote.");
  const [hasAutoTried, setHasAutoTried] = useState(false);

  const isWrongNetwork = isConnected && chainId !== targetChainId;
  const totalVotes = poll.votesA + poll.votesB;
  const isBusy = isWritePending || isConfirming || isSwitchPending;

  const walletOptions = useMemo(() => {
    const seen = new Set<string>();
    return connectors.filter((connector) => {
      const key = `${connector.id}-${connector.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return connector.type === "injected" || connector.type === "coinbaseWallet";
    });
  }, [connectors]);

  useEffect(() => {
    const savedReward = window.localStorage.getItem("tipjar-reward");
    const savedPoll = window.localStorage.getItem("tipjar-poll");

    try {
      if (savedReward) setReward({ ...emptyReward, ...JSON.parse(savedReward) });
      if (savedPoll) setPoll({ ...defaultPoll, ...JSON.parse(savedPoll) });
    } catch {
      window.localStorage.removeItem("tipjar-reward");
      window.localStorage.removeItem("tipjar-poll");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tipjar-reward", JSON.stringify(reward));
  }, [reward]);

  useEffect(() => {
    window.localStorage.setItem("tipjar-poll", JSON.stringify(poll));
  }, [poll]);

  useEffect(() => {
    if (writeError) setStatus(getFriendlyError(writeError));
  }, [writeError]);

  useEffect(() => {
    if (!isConfirmed) return;
    setStatus("Onchain vote proof saved with Base attribution.");
  }, [isConfirmed]);

  useEffect(() => {
    if (hasAutoTried || isConnected || typeof window === "undefined") return;

    const ethereum = window.ethereum as { isCoinbaseWallet?: boolean } | undefined;
    const isBaseApp = window.navigator.userAgent.toLowerCase().includes("base") || Boolean(ethereum?.isCoinbaseWallet);
    const injectedConnector = connectors.find((connector) => connector.type === "injected");

    if (isBaseApp && injectedConnector) {
      setHasAutoTried(true);
      connect({ connector: injectedConnector, chainId: targetChainId });
    }
  }, [connect, connectors, hasAutoTried, isConnected]);

  const handleWalletSelect = (connectorUid: string) => {
    const connector = connectors.find((option) => option.uid === connectorUid);
    if (!connector) return;
    connect({ connector, chainId: targetChainId });
    setWalletOpen(false);
  };

  const handleCreatePoll = useCallback(() => {
    setPoll((current) => ({
      ...current,
      votesA: 0,
      votesB: 0,
      localPollId: current.localPollId + 1,
    }));
    setStatus("Poll is ready. First vote earns an instant reward.");

    if (!isConnected || isWrongNetwork || !isConfigured) return;

    writeContract({
      address: contractAddress,
      abi: tipJarAbi,
      functionName: "createPoll",
      args: [poll.question, poll.optionA, poll.optionB],
      dataSuffix: builderCodeDataSuffix,
    });
  }, [isConnected, isWrongNetwork, poll.optionA, poll.optionB, poll.question, writeContract]);

  const handlePrimaryAction = () => {
    if (!isConnected) {
      setWalletOpen(true);
      return;
    }

    if (isWrongNetwork) {
      switchChain({ chainId: targetChainId });
      return;
    }

    setPoll((current) => ({
      ...current,
      votesA: current.selected === 1 ? current.votesA + 1 : current.votesA,
      votesB: current.selected === 2 ? current.votesB + 1 : current.votesB,
    }));
    setReward((current) => ({
      points: current.points + 25,
      votes: current.votes + 1,
      lastAction: new Date().toISOString(),
    }));
    setStatus("+25 points added instantly. Your vote is visible in the poll.");

    if (!isConfigured) return;

    writeContract({
      address: contractAddress,
      abi: tipJarAbi,
      functionName: "castVote",
      args: [BigInt(poll.localPollId), poll.selected],
      dataSuffix: builderCodeDataSuffix,
    });
  };

  const mainButtonText = !isConnected
    ? "Connect Wallet"
    : isWrongNetwork
      ? `Switch to ${targetChain.name}`
      : isBusy
        ? "Saving Vote"
        : "Cast Vote";

  return (
    <main className="min-h-screen bg-[#fff8ef] text-stone-950">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl content-center gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-5 lg:px-8">
        <div className="rounded-lg border border-amber-200 bg-white p-5 shadow-soft md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-orange-600">TipJar</p>
              <h1 className="mt-1 text-3xl font-black leading-tight sm:text-5xl">Onchain support polls</h1>
            </div>
            <WalletButton
              address={address}
              isConnected={isConnected}
              onDisconnect={() => disconnect()}
              onOpen={() => setWalletOpen(true)}
            />
          </div>

          <p className="mt-4 text-base font-semibold leading-7 text-stone-600">
            Create a lightweight community poll, let supporters vote with a wallet, and keep a public record on Base.
          </p>

          <div className="mt-5 grid gap-3">
            <RewardTile label="Instant Reward" value="+25 points" tone="orange" />
            <div className="grid grid-cols-2 gap-3">
              <RewardTile label="Your Points" value={reward.points.toLocaleString()} />
              <RewardTile label="Votes Cast" value={reward.votes.toLocaleString()} />
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-black uppercase text-orange-700">Zero purchase flow</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">
                Supporters can participate with their existing wallet. The first interaction updates rewards immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-lg border border-amber-200 bg-[#fffdf8] p-5 shadow-soft md:p-6">
          <div className="grid gap-3">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase text-stone-500">Poll question</span>
              <input
                className="h-12 rounded-lg border border-amber-200 bg-white px-3 text-sm font-bold text-stone-900 outline-none transition focus:border-orange-500"
                maxLength={140}
                value={poll.question}
                onChange={(event) => setPoll((current) => ({ ...current, question: event.target.value }))}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase text-stone-500">Option A</span>
                <input
                  className="h-12 rounded-lg border border-amber-200 bg-white px-3 text-sm font-bold outline-none transition focus:border-orange-500"
                  maxLength={48}
                  value={poll.optionA}
                  onChange={(event) => setPoll((current) => ({ ...current, optionA: event.target.value }))}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase text-stone-500">Option B</span>
                <input
                  className="h-12 rounded-lg border border-amber-200 bg-white px-3 text-sm font-bold outline-none transition focus:border-orange-500"
                  maxLength={48}
                  value={poll.optionB}
                  onChange={(event) => setPoll((current) => ({ ...current, optionB: event.target.value }))}
                />
              </label>
            </div>
            <button className="secondary-button w-full" disabled={isBusy} onClick={handleCreatePoll} type="button">
              Create Poll
            </button>
          </div>

          <div className="rounded-lg border border-amber-200 bg-white p-4">
            <p className="text-xs font-black uppercase text-orange-600">Live poll</p>
            <h2 className="mt-2 text-2xl font-black leading-tight">{poll.question}</h2>
            <div className="mt-4 grid gap-3">
              <VoteOption
                label={poll.optionA}
                percent={getPercent(poll.votesA, totalVotes)}
                selected={poll.selected === 1}
                votes={poll.votesA}
                onSelect={() => setPoll((current) => ({ ...current, selected: 1 }))}
              />
              <VoteOption
                label={poll.optionB}
                percent={getPercent(poll.votesB, totalVotes)}
                selected={poll.selected === 2}
                votes={poll.votesB}
                onSelect={() => setPoll((current) => ({ ...current, selected: 2 }))}
              />
            </div>
          </div>

          <button className="primary-button w-full text-base" disabled={isBusy} onClick={handlePrimaryAction} type="button">
            {mainButtonText}
          </button>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatusCard label="Wallet" value={address ? shorten(address) : "Not connected"} />
            <StatusCard label="Network" value={targetChain.name} />
            <StatusCard label="Proof" value={isConfigured ? "Onchain ready" : "Local preview"} />
          </div>

          <div
            className={clsx(
              "rounded-lg border px-4 py-3 text-sm font-bold",
              status.includes("+25") || status.includes("saved")
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-white text-stone-600",
            )}
          >
            {status}
          </div>
        </div>
      </section>

      {walletOpen && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-stone-950/40 p-3 sm:place-items-center">
          <div className="w-full max-w-md rounded-lg border border-amber-200 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">Choose Wallet</h3>
              <button className="icon-button" type="button" aria-label="Close wallet options" onClick={() => setWalletOpen(false)}>
                x
              </button>
            </div>
            <div className="mt-4 grid gap-2">
              {walletOptions.map((connector) => (
                <button
                  className="secondary-button flex h-14 items-center justify-between text-left"
                  disabled={isConnectPending}
                  key={connector.uid}
                  onClick={() => handleWalletSelect(connector.uid)}
                  type="button"
                >
                  <span>{walletLabel(connector.name)}</span>
                  <span className="text-xs text-stone-500">{connector.type === "coinbaseWallet" ? "Coinbase" : "Injected"}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-stone-500">
              Coinbase Wallet, MetaMask, OKX, and the Base App injected wallet are supported without WalletConnect.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function WalletButton({
  address,
  isConnected,
  onDisconnect,
  onOpen,
}: {
  address?: `0x${string}`;
  isConnected: boolean;
  onDisconnect: () => void;
  onOpen: () => void;
}) {
  if (!isConnected) {
    return (
      <button className="secondary-button shrink-0" onClick={onOpen} type="button">
        Wallet
      </button>
    );
  }

  return (
    <button className="secondary-button shrink-0" onClick={onDisconnect} type="button">
      {address ? shorten(address) : "Disconnect"}
    </button>
  );
}

function RewardTile({ label, value, tone = "white" }: { label: string; value: string; tone?: "white" | "orange" }) {
  return (
    <div className={clsx("rounded-lg border p-4", tone === "orange" ? "border-orange-500 bg-orange-500 text-white" : "border-amber-200 bg-white")}>
      <p className={clsx("text-xs font-black uppercase", tone === "orange" ? "text-orange-50" : "text-stone-500")}>{label}</p>
      <p className="mt-2 truncate text-2xl font-black">{value}</p>
    </div>
  );
}

function VoteOption({
  label,
  percent,
  selected,
  votes,
  onSelect,
}: {
  label: string;
  percent: number;
  selected: boolean;
  votes: number;
  onSelect: () => void;
}) {
  return (
    <button
      className={clsx(
        "grid gap-2 rounded-lg border p-3 text-left transition",
        selected ? "border-orange-500 bg-orange-50" : "border-amber-200 bg-white hover:border-orange-300",
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-black">{label}</span>
        <span className="shrink-0 text-xs font-black text-stone-500">{votes} votes</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-amber-100">
        <div className="h-full rounded-full bg-orange-500" style={{ width: `${percent}%` }} />
      </div>
    </button>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-white p-3">
      <p className="text-xs font-black uppercase text-stone-500">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-stone-900">{value}</p>
    </div>
  );
}

function walletLabel(name: string) {
  if (name.toLowerCase().includes("coinbase")) return "Coinbase Wallet";
  if (name.toLowerCase().includes("meta")) return "MetaMask";
  if (name.toLowerCase().includes("okx")) return "OKX Wallet";
  if (name.toLowerCase().includes("injected")) return "Base App / Browser Wallet";
  return name;
}

function shorten(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function getPercent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function getFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.toLowerCase().includes("user rejected")) return "User rejected the request.";
  if (message.toLowerCase().includes("insufficient funds")) return "Not enough ETH for network gas.";
  return message.split("\n")[0] || "Something went wrong.";
}
