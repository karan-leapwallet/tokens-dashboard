import React, { useMemo } from "react";
import Token from "./Token";
import { Virtuoso } from "react-virtuoso";

type Props = {
  tokens: any;
  onEdit: (tokenKey: string) => void;
};

function TokensList({ tokens, onEdit }: Props) {
  const data = useMemo(() => Object.keys(tokens), [tokens]);
  const [isScrolling, setIsScrolling] = React.useState(false);

  return (
    <>
      <div className="grid grid-cols-[4fr_6fr_3fr_3fr_3fr_3fr_1fr] items-center mt-4 p-3 gap-4 border-b-2 bg-slate-300 border-black mr-[5px]">
        <div className="overflow-hidden pl-[52px]">
          <div className="font-bold">coinDenom</div>
          <div>name</div>
        </div>
        <div className="overflow-hidden">
          <div className="font-bold">key</div>
          <div>coinMinimalDenom</div>
        </div>
        <div className="overflow-hidden">
          <div className="font-bold">CoinGecko Price</div>
          <div>coinGeckoId</div>
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-left text-wrap">
            Price (backend Non-cg)
          </div>
          <div>Price (Astroport APIs)</div>
        </div>
        <div className="overflow-hidden font-bold">chain</div>
        <div className="overflow-hidden font-bold">Type</div>
      </div>
      <Virtuoso
        data={data}
        className="w-full scrollbar"
        isScrolling={(isScrolling) => {
          setIsScrolling(isScrolling);
        }}
        itemContent={(index, key) => {
          return (
            <Token
              index={index}
              token={tokens[key]}
              key={key}
              tokenKey={key}
              isScolling={isScrolling}
              onEdit={onEdit}
            />
          );
        }}
      />
    </>
  );
}

export default TokensList;
