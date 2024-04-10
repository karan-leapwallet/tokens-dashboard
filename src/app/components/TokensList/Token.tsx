import classNames from "classnames";
import React from "react";
import "material-symbols";
import { formatCurrencyValue } from "@/app/utils/string";
type Props = {
  token: any;
  tokenKey: string;
  isScolling: boolean;
  index: number;
  onEdit: (tokenKey: string) => void;
};

function Token({ token, tokenKey, index, isScolling, onEdit }: Props) {
  return (
    <div
      className={classNames(
        "grid grid-cols-[4fr_6fr_3fr_3fr_3fr_3fr_1fr] items-center p-3 gap-4",
        {
          "bg-white": index % 2 === 0,
          "bg-slate-200": index % 2 === 1,
        }
      )}
    >
      <div className="flex overflow-hidden items-center gap-3">
        {
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={
              !isScolling
                ? token.icon ?? "generic-token.svg"
                : "generic-token.svg"
            }
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) =>
              ((e.target as HTMLImageElement).src = "generic-token.svg")
            }
            alt={token.name}
            className="w-10 h-10"
          />
        }
        <div className="overflow-hidden text-left">
          <div className="overflow-hidden whitespace-nowrap text-ellipsis font-bold">
            {token.coinDenom}
          </div>
          <div className="overflow-hidden whitespace-nowrap text-ellipsis">
            {token.name}
          </div>
        </div>
      </div>
      <div className="overflow-hidden text-left">
        {tokenKey !== token.coinMinimalDenom ? (
          <>
            <div className="overflow-hidden whitespace-nowrap text-ellipsis font-bold">
              {tokenKey}
            </div>
            <div className="overflow-hidden whitespace-nowrap text-ellipsis">
              {token.coinMinimalDenom}
            </div>
          </>
        ) : (
          <div className="overflow-hidden whitespace-nowrap text-ellipsis font-bold">
            {tokenKey}
          </div>
        )}
      </div>
      <div className="overflow-hidden text-left">
        {token.cgPrice && (
          <div className="font-bold">{formatCurrencyValue(token.cgPrice)}</div>
        )}
        <div>{token.coinGeckoId}</div>
      </div>
      <div className="overflow-hidden text-left">
        {token.astroPortPrice && (
          <div className="font-bold">
            {formatCurrencyValue(token.astroPortPrice)}
          </div>
        )}
        {token.astroPortAPIPrice !== undefined && (
          <div>{formatCurrencyValue(token.astroPortAPIPrice)}</div>
        )}
      </div>
      <div className="overflow-hidden text-left">{token.chain}</div>
      <div className="overflow-hidden text-left">{token.type}</div>
      <div className="overflow-hidden flex justify-end items-center gap-2">
        <button
          className="p-2 flex flex-row justify-center items-center"
          onClick={() => {
            onEdit(tokenKey);
          }}
        >
          <div className="material-symbols-outlined text-blue-300">edit</div>
        </button>
      </div>
    </div>
  );
}

export default Token;
