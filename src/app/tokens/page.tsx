"use client";
import React, { useMemo } from "react";
import TokensList from "../components/TokensList";
import axios from "axios";
import useSWR from "swr";

type Props = {};

function Page({}: Props) {
  const { data: tokens, isLoading } = useSWR("tokens", async () => {
    const res = await axios.get(
      "https://assets.leapwallet.io/cosmos-registry/v1/denoms/base.json"
    );
    const tokens = res.data;
    return tokens;
  });

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

  const tokensWithPrices = React.useMemo(() => {
    if (!tokens || !prices) return null;
    return Object.keys(tokens).reduce((acc: Record<string, any>, key) => {
      const token = tokens[key];
      const cgPrice = prices?.[token?.coinGeckoId];
      const chainId = chainKeyToIdMapping?.[token?.chain];
      const astroPortPrice = prices?.[`${chainId}-${token.coinMinimalDenom}`];
      const astroPortAPIPrice =
        astroPortAPI?.[token.coinMinimalDenom] || undefined;
      if (
        astroPortAPIPrice &&
        astroPortPrice &&
        astroPortAPIPrice !== astroPortPrice
      ) {
        console.log(
          "astroPortAPIPrice",
          token,
          astroPortPrice,
          astroPortAPIPrice
        );
      }
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

  const [searchedQuery, setSearchedQuery] = React.useState("");

  const filteredTokens = React.useMemo(() => {
    if (!tokensWithPrices) return null;
    return Object.keys(tokensWithPrices)
      .filter((key) => {
        const sanitizedQuery = searchedQuery.toLowerCase().trim();

        if (!sanitizedQuery) return true;

        return [
          tokensWithPrices[key].coinDenom?.toLowerCase(),
          tokensWithPrices[key].name?.toLowerCase(),
          key?.toLowerCase(),
          tokensWithPrices[key].coinMinimalDenom?.toLowerCase(),
          tokensWithPrices[key].chain?.toLowerCase(),
        ]?.some((_d) => _d?.includes(sanitizedQuery) || false);
      })
      .reduce((acc, key) => {
        return {
          ...acc,
          [key]: tokensWithPrices[key],
        };
      }, {});
  }, [tokensWithPrices, searchedQuery]);

  return (
    <div className="h-[100vh] flex flex-col overflow-hidden p-6 gap-4">
      <input
        type="text"
        placeholder="Search"
        value={searchedQuery}
        onChange={(e) => setSearchedQuery(e.target.value)}
        className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <TokensList tokens={filteredTokens ?? {}} />
    </div>
  );
}

export default Page;
