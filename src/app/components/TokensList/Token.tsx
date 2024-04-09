import classNames from "classnames";
import React from "react";

type Props = {
  token: any;
  tokenKey: string;
  isScolling: boolean;
  index: number;
};

function Token({ token, tokenKey, index, isScolling }: Props) {
  return (
    <div
      className={classNames(
        "grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center p-3 gap-4",
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
            <div className="overflow-hidden whitespace-nowrap text-ellipsis">
              {tokenKey}
            </div>
            <div className="overflow-hidden whitespace-nowrap text-ellipsis">
              {token.coinMinimalDenom}
            </div>
          </>
        ) : (
          <div className="overflow-hidden whitespace-nowrap text-ellipsis">
            {tokenKey}
          </div>
        )}
      </div>
      <div className="w-full text-center">
        <div className="font-bold">{token.cgPrice}</div>
        <div>{token.coinGeckoId}</div>
      </div>
      <div className="w-full text-center">
        <div className="font-bold">{token.astroPortPrice}</div>
        <div>{token.astroPortAPIPrice}</div>
      </div>
      <div className="w-full flex justify-end items-center gap-2">
        <div>{token.chain}</div>
        <button>edit</button>
      </div>
    </div>
  );
}

export default Token;
