import React, { useMemo } from "react";
import Token from "./Token";
import { Virtuoso } from "react-virtuoso";

type Props = {
  tokens: any;
};

function TokensList({ tokens }: Props) {
  const data = useMemo(() => Object.keys(tokens), [tokens]);
  const [isScrolling, setIsScrolling] = React.useState(false);

  return (
    <Virtuoso
      data={data}
      className="w-full"
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
          />
        );
      }}
    />
  );
}

export default TokensList;
