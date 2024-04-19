import axios from "axios";

export async function getBaseTokens() {
  const res = await axios.get(
    "https://assets.leapwallet.io/cosmos-registry/v1/denoms/base.json"
  );
  return res.data;
}

export async function getCw20Tokens(chains: any, cw20All?: boolean) {
  const tokensPromises = chains.map(async (chain: string) => {
    const res = await axios.get(
      `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${chain}/${
        !cw20All ? "cw20" : "cw20_all"
      }.json`
    );
    return res.data;
  });
  const resolvedPromises = await Promise.allSettled(tokensPromises);
  const tokens = resolvedPromises.reduce(
    (acc: Record<string, any>, chainTokens) => {
      if (chainTokens.status === "rejected") return acc;
      return {
        ...acc,
        ...chainTokens.value,
      };
    },
    {}
  );
  return tokens;
}

export async function getCw20TokensSupportingChains() {
  const res = await axios.get(
    "https://assets.leapwallet.io/cosmos-registry/v1/denoms/cw20-chains.json"
  );
  const chains = res.data?.chains;
  return chains as string[];
}

export async function getWhiteListedFactoryTokens() {
  const res = await axios.get(
    "https://assets.leapwallet.io/cosmos-registry/v1/denoms/whitelist-factory.json"
  );
  return res.data;
}
