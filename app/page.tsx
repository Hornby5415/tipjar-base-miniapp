"use client";

import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatEther, zeroAddress } from "viem";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { contractAddress, tipJarAbi } from "@/lib/tipJar";
import { builderCodeDataSuffix, targetChain, targetChainId } from "@/lib/wagmi";

type RewardState = {
  points: number;
  streak: number;
  lastClaimed: string;
};

type Profile = {
  registered: boolean;
  totalReceived: bigint;
  tipCount: bigint;
};

const emptyReward: RewardState = {
  points: 0,
  streak: 0,
  lastClaimed: "",
};

const isConfigured = contractAddress !== zeroAddress;

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const { data: txHash, writeContract, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [reward, setReward] = useState<RewardState>(emptyReward);
  const [profile, setProfile] = useState<Profile>({ registered: false, totalReceived: 0n, tipCount: 0n });
  const [walletOpen, setWalletOpen] = useState(false);
  const [status, setStatus] = useState("Ready for today's reward.");
  const [hasAutoTried, setHasAutoTried] = useState(false);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const isWrongNetwork = isConnected && chainId !== targetChainId;
  const hasClaimedToday = reward.lastClaimed === todayKey;

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
    const saved = window.localStorage.getItem("base-reward-tap");
    if (!saved) return;

    try {
      setReward({ ...emptyReward, ...JSON.parse(saved) });
    } catch {
      window.localStorage.removeItem("base-reward-tap");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("base-reward-tap", JSON.stringify(reward));
  }, [reward]);

  const refreshProfile = useCallback(async () => {
    if (!address || !publicClient || !isConfigured) return;

    try {
      const profileData = await publicClient.readContract({
        address: contractAddress,
        abi: tipJarAbi,
        functionName: "getCreator",
        args: [address],
      });

      setProfile({
        registered: profileData.registered,
        totalReceived: profileData.totalReceived,
        tipCount: profileData.tipCount,
      });
    } catch {
      setProfile({ registered: false, totalReceived: 0n, tipCount: 0n });
    }
  }, [address, publicClient]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (writeError) setStatus(getFriendlyError(writeError));
  }, [writeError]);

  useEffect(() => {
    if (!isConfirmed) return;
    setStatus("Reward proof saved on Base.");
    void refreshProfile();
  }, [isConfirmed, refreshProfile]);

  useEffect(() => {
    if (hasAutoTried || isConnected || typeof window === "undefined") return;

    const isBaseApp =
      window.navigator.userAgent.toLowerCase().includes("base") ||
      Boolean((window.ethereum as { isCoinbaseWallet?: boolean } | undefined)?.isCoinbaseWallet);
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

  const handleReward = () => {
    if (!isConnected) {
      setWalletOpen(true);
      return;
    }

    if (isWrongNetwork) {
      switchChain({ chainId: targetChainId });
      return;
    }

    if (!address) {
      setWalletOpen(true);
      return;
    }

    if (hasClaimedToday) {
      setStatus("Today's reward is already active.");
      return;
    }

    const nextReward = {
      points: reward.points + 25,
      streak: reward.streak + 1,
      lastClaimed: todayKey,
    };
    setReward(nextReward);
    setStatus("+25 points added instantly.");

    if (!isConfigured) return;

    writeContract({
      address: contractAddress,
      abi: tipJarAbi,
      functionName: "registerCreator",
      args: [
        "Base Reward Tap",
        `Daily reward claimed by ${shorten(address)}`,
        "Rewards",
      ],
      dataSuffix: builderCodeDataSuffix,
    });
  };

  const mainButtonText = !isConnected
    ? "Connect Wallet"
    : isWrongNetwork
      ? `Switch to ${targetChain.name}`
      : hasClaimedToday
        ? "Reward Claimed"
        : isWritePending || isConfirming
          ? "Saving Proof"
          : "Claim Reward";

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dff0ff_0,#eef6ff_34%,#f8fbff_70%)] text-base-ink">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl content-center gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="flex flex-col justify-between gap-8 rounded-lg border border-white/80 bg-white/72 p-5 shadow-soft backdrop-blur md:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-base-blue">Base MiniApp</p>
              <h1 className="mt-1 text-3xl font-black leading-tight sm:text-5xl">Base Reward Tap</h1>
            </div>
            <WalletButton
              address={address}
              isConnected={isConnected}
              onDisconnect={() => disconnect()}
              onOpen={() => setWalletOpen(true)}
            />
          </div>

          <div className="grid gap-3">
            <RewardTile label="Total Points" value={reward.points.toLocaleString()} tone="blue" />
            <div className="grid grid-cols-2 gap-3">
              <RewardTile label="Daily Streak" value={`${reward.streak} days`} />
              <RewardTile label="Network" value={targetChain.name} />
            </div>
            <div className="rounded-lg border border-base-line bg-white p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Instant Reward</p>
              <p className="mt-2 text-4xl font-black text-base-blue">+25</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Available once per day.</p>
            </div>
          </div>
        </div>

        <div className="grid content-center gap-4 rounded-lg border border-base-line bg-base-soft p-5 shadow-soft md:p-7">
          <div className="grid gap-2">
            <p className="text-sm font-bold text-slate-500">No token purchase required</p>
            <h2 className="text-4xl font-black leading-tight sm:text-6xl">Tap once. See rewards now.</h2>
            <p className="max-w-2xl text-base font-medium leading-7 text-slate-600">
              Claim daily points in the Base App browser or any injected wallet. Optional onchain proof keeps builder attribution attached to the transaction.
            </p>
          </div>

          <button className="primary-button w-full text-base" disabled={isWritePending || isConfirming || isSwitchPending} onClick={handleReward}>
            {mainButtonText}
          </button>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatusCard label="Wallet" value={address ? shorten(address) : "Not connected"} />
            <StatusCard label="Proof" value={isConfigured ? (profile.registered ? "Saved" : "Ready") : "Local only"} />
            <StatusCard label="Volume" value={`${formatCompactEth(profile.totalReceived)} ETH`} />
          </div>

          <div
            className={clsx(
              "rounded-lg border px-4 py-3 text-sm font-bold",
              status.includes("+25") || status.includes("saved")
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-base-line bg-white text-slate-600",
            )}
          >
            {status}
          </div>
        </div>
      </section>

      {walletOpen && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/40 p-3 sm:place-items-center">
          <div className="w-full max-w-md rounded-lg border border-base-line bg-white p-4 shadow-soft">
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
                  <span className="text-xs text-slate-500">{connector.type === "coinbaseWallet" ? "Coinbase" : "Injected"}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
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

function RewardTile({ label, value, tone = "white" }: { label: string; value: string; tone?: "white" | "blue" }) {
  return (
    <div className={clsx("rounded-lg border p-4", tone === "blue" ? "border-base-blue bg-base-blue text-white" : "border-base-line bg-white")}>
      <p className={clsx("text-xs font-bold uppercase", tone === "blue" ? "text-blue-100" : "text-slate-500")}>{label}</p>
      <p className="mt-2 truncate text-2xl font-black">{value}</p>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-base-line bg-white p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-900">{value}</p>
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

function formatCompactEth(value: bigint) {
  const formatted = formatEther(value);
  const [whole, decimals = ""] = formatted.split(".");
  const trimmedDecimals = decimals.slice(0, 4).replace(/0+$/, "");
  return trimmedDecimals ? `${whole}.${trimmedDecimals}` : whole;
}

function getFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.toLowerCase().includes("user rejected")) return "User rejected the request.";
  if (message.toLowerCase().includes("insufficient funds")) return "Not enough ETH for network gas.";
  return message.split("\n")[0] || "Something went wrong.";
}
