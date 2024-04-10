"use client";
import React, { useCallback, useMemo } from "react";
import TokensList from "../components/TokensList";
import { useTokens } from "../hooks/useTokens";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { EditTokenModal } from "../components/EditToken";
import classNames from "classnames";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

type Props = {};

async function publishChanges(changes: Record<string, any>) {
  try {
    const branchName = `new-branch-${uuidv4()}`;
    console.log(
      "Publishing changes to branch",
      changes,
      JSON.stringify(changes)
    );
    const body = {
      event_type: "create-branch",
      client_payload: {
        branch: branchName,
        data: JSON.stringify(JSON.stringify(changes)),
      },
    };
    const res = await axios.post(
      "https://api.github.com/repos/karan-leapwallet/cosmos-chain-registry/dispatches",
      body,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    console.log(res.data);
    return res.data;
  } catch (e) {
    console.error(e);
    return e;
  }
}

function Page({}: Props) {
  const [searchedQuery, setSearchedQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("native");
  const [hasCgIdFilter, setHasCgIdFilter] = React.useState(false);
  const [filterByChain, setFilterByChain] = React.useState("all");
  const [selectTokenToEdit, setSelectTokenToEdit] = React.useState<string>();
  const [isEditTokenModalOpen, setIsEditTokenModalOpen] = React.useState(false);
  const [changeObject, setChangeObject] = React.useState(
    {} as Record<string, any>
  );

  const hasSomeChanges = useMemo(
    () => changeObject && Object.keys(changeObject).length > 0,
    [changeObject]
  );

  const debouncedSearchQuery = useDebouncedValue(searchedQuery, 300);

  const tokens = useTokens();

  const filterChainsList = useMemo(() => {
    if (!tokens) return null;

    const _chains: Set<string> = new Set();
    Object.values(tokens).forEach((token) => _chains.add(token.chain));

    return ["all", ...Array.from(_chains).sort()] as string[];
  }, [tokens]);

  const filteredTokens = useMemo(() => {
    if (!tokens) return null;
    const sanitizedQuery = debouncedSearchQuery.toLowerCase().trim();

    if (
      !sanitizedQuery &&
      typeFilter === "all" &&
      !hasCgIdFilter &&
      filterByChain === "all"
    ) {
      return tokens;
    }

    return Object.keys(tokens).reduce((acc: Record<string, any>, key) => {
      let filterIn = true;

      if (hasCgIdFilter && !tokens[key].coinGeckoId) return acc;

      if (filterByChain !== "all" && tokens[key].chain !== filterByChain) {
        return acc;
      }

      if (
        typeFilter !== "all" &&
        (tokens[key].type !== typeFilter ||
          (typeFilter === "others" &&
            ["native", "ibc", "cw20", "factory", "cw20_all"].includes(
              tokens[key].type
            )))
      ) {
        return acc;
      }

      if (sanitizedQuery) {
        filterIn = [
          tokens[key].coinDenom?.toLowerCase(),
          tokens[key].name?.toLowerCase(),
          key?.toLowerCase(),
          tokens[key].coinMinimalDenom?.toLowerCase(),
          tokens[key].chain?.toLowerCase(),
        ]?.some((_d) => _d?.includes(sanitizedQuery) || false);
      }

      if (!filterIn) return acc;
      return {
        ...acc,
        [key]: tokens[key],
      };
    }, {});
  }, [tokens, debouncedSearchQuery, typeFilter, hasCgIdFilter, filterByChain]);

  const selectedToken = useMemo(() => {
    if (!selectTokenToEdit || !tokens) return undefined;
    return tokens[selectTokenToEdit];
  }, [selectTokenToEdit, tokens]);

  const onPublishChanges = useCallback(() => {
    const res = publishChanges(changeObject);
    console.log(res);
  }, [changeObject]);

  return (
    <div className="h-[100vh] flex flex-col overflow-hidden p-6">
      <div className="flex w-full justify-start items-start flex-col gap-4">
        <div className="flex w-full flex-row justify-start gap-4 items-stretch">
          <input
            type="text"
            placeholder="Search"
            value={searchedQuery}
            onChange={(e) => setSearchedQuery(e.target.value)}
            className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <button
            className={classNames(
              "flex shrink-0 bg-blue-500 rounded-lg text-white px-6 py-2 flex-row justify-center items-center gap-2",
              {
                "opacity-40 cursor-not-allowed": !hasSomeChanges,
              }
            )}
            disabled={!hasSomeChanges}
            onClick={onPublishChanges}
          >
            Publish <span className="material-symbols-outlined">public</span>
          </button>
        </div>
        <div className="flex w-full flex-row justify-between items-end">
          <label className="gap-2 flex">
            <span className="font-bold">Filter by type</span>
            <select
              onChange={(e) => setTypeFilter(e.target.value)}
              value={typeFilter}
            >
              <option value="all">All</option>
              <option value="native">Native</option>
              <option value="ibc">IBC</option>
              <option value="cw20">CW20</option>
              <option value="factory">Factory</option>
              <option value="cw20_all">CW20 Auto fetched</option>
              <option value="others">Others</option>
            </select>
          </label>

          <label className="gap-2 flex">
            <span className="font-bold">Filter by chain</span>
            <select
              onChange={(e) => setFilterByChain(e.target.value)}
              value={filterByChain}
            >
              {filterChainsList?.map((chain) => (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              ))}
            </select>
          </label>

          <label className="gap-1 flex">
            <input
              type="checkbox"
              checked={hasCgIdFilter}
              onChange={(e) => setHasCgIdFilter(e.target.checked)}
            />
            <span className="font-bold">Has CoinGecko ID</span>
          </label>
        </div>
      </div>

      <TokensList
        tokens={filteredTokens ?? {}}
        onEdit={(tokenKey) => {
          setIsEditTokenModalOpen(true);
          setSelectTokenToEdit(tokenKey);
        }}
      />
      {isEditTokenModalOpen && (
        <EditTokenModal
          onClose={() => {
            setIsEditTokenModalOpen(false);
            setSelectTokenToEdit(undefined);
          }}
          changeObject={changeObject}
          setChangeObject={setChangeObject}
          selectedToken={selectedToken}
          selectedTokenKey={selectTokenToEdit ?? ""}
        />
      )}
    </div>
  );
}

export default Page;
