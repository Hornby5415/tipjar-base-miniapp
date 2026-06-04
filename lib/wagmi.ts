import { createClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { createConfig, injected } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";

export const targetChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || base.id);
export const targetChain = targetChainId === baseSepolia.id ? baseSepolia : base;
export const supportedChains = [targetChain] as const;
export const builderCodeDataSuffix = (process.env.NEXT_PUBLIC_BUILDER_CODE_DATA_SUFFIX ||
  "0x62635f33393564687471320b0080218021802180218021802180218021") as `0x${string}`;

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: "TipJar",
      preference: "all",
      version: "4",
    }),
  ],
  multiInjectedProviderDiscovery: true,
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
      dataSuffix: builderCodeDataSuffix,
    });
  },
});
