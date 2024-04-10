"use client";
import axios from "axios";
import { useMemo } from "react";
import useSWR from "swr";
import { getCw20Tokens, getCw20TokensSupportingChains } from "../utils/tokens";

export function useTokens() {
  const { data: baseTokens, isLoading } = useSWR("tokens", async () => {
    const res = await axios.get(
      "https://assets.leapwallet.io/cosmos-registry/v1/denoms/base.json"
    );
    const tokens = res.data;
    return tokens;
  });

  const { data: cw20Tokens, isLoading: isLoadingCw20Tokens } = useSWR(
    "cw20-tokens",
    async () => {
      try {
        const chains = await getCw20TokensSupportingChains();
        const tokens = await getCw20Tokens(chains);
        return tokens;
      } catch (e) {
        console.error(e);
        return {};
      }
    }
  );

  const { data: cw20AllTokens, isLoading: isLoadingCw20AllTokens } = useSWR(
    "cw20_all-tokens",
    async () => {
      try {
        const chains = await getCw20TokensSupportingChains();
        const tokens = await getCw20Tokens(chains, true);
        return tokens;
      } catch (e) {
        console.error(e);
        return {};
      }
    }
  );

  const tokens = useMemo(() => {
    let tokens: Record<string, any> = {};

    Object.keys(baseTokens ?? {}).forEach((key: string) => {
      if (!baseTokens?.[key]) return;

      tokens[key] = {
        ...baseTokens[key],
        type: key.startsWith("ibc/")
          ? "ibc"
          : key.startsWith("factory/")
          ? "factory"
          : "native",
      };
    });

    Object.keys(cw20Tokens ?? {}).forEach((key: string) => {
      if (!cw20Tokens?.[key]) return;

      tokens[key] = {
        ...cw20Tokens?.[key],
        isWhiteListed: true,
        type: "cw20",
      };
    });

    Object.keys(cw20AllTokens ?? {}).forEach((key: string) => {
      if (!cw20AllTokens?.[key]) return;

      tokens[key] = {
        ...cw20AllTokens?.[key],
        type: "cw20_all",
        isWhiteListed: false,
      };
    });

    return tokens;
  }, [baseTokens, cw20AllTokens, cw20Tokens]);

  const { data: chainInfo, isLoading: isLoadingChainInfo } = useSWR(
    "chainInfo",
    async () => {
      const res = await axios.get(
        "https://assets.leapwallet.io/cosmos-registry/v1/elements-data/chains.json"
      );
      return res.data;
    }
  );

  const chainKeyToIdMapping = useMemo(() => {
    if (!chainInfo) return null;
    return chainInfo.reduce((acc: any, chain: { key: any; chainId: any }) => {
      return {
        ...acc,
        [chain.key]: chain.chainId,
      };
    }, {});
  }, [chainInfo]);

  const { data: prices, isLoading: isLoadingPrices } = useSWR(
    "prices",
    async () => {
      const res = await axios.get(
        "https://api.leapwallet.io/market/prices/ecosystem?currency=USD&ecosystem=cosmos-ecosystem"
      );
      return res.data;
    }
  );

  const { data: astroPortAPI, isLoading: isLoadingAstroportAPI } = useSWR(
    "pricesAPI-ASTROPORT",
    async () => {
      const res = await axios.get("https://api.astroport.fi/api/tokens");
      return res.data?.reduce(
        (
          acc: Record<string, string>,
          token: { denom: any; priceUSD: any }
        ) => ({
          ...acc,
          [token.denom]: token.priceUSD,
        }),
        {}
      );
    }
  );

  const tokensWithPrices = useMemo(() => {
    if (!tokens || !prices) return null;
    return Object.keys(tokens).reduce((acc: Record<string, any>, key) => {
      const token = tokens[key];
      const cgPrice = prices?.[token?.coinGeckoId];
      const chainId = chainKeyToIdMapping?.[token?.chain];
      const astroPortPrice = prices?.[`${chainId}-${token.coinMinimalDenom}`];
      const astroPortAPIPrice = astroPortAPI?.[token.coinMinimalDenom];

      return {
        ...acc,
        [key]: {
          ...token,
          astroPortPrice,
          astroPortAPIPrice,
          cgPrice,
        },
      };
    }, {});
  }, [tokens, prices, chainKeyToIdMapping, astroPortAPI]);
  return tokensWithPrices;
}
