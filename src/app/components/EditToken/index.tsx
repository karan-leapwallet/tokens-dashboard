import { formatCurrencyValue } from "@/app/utils/string";
import classNames from "classnames";
import React, { useCallback, useMemo } from "react";
import { isEqual } from "lodash-es";

type Props = {
  onClose: () => void;
  selectedToken: any;
  changeObject: any;
  selectedTokenKey: string;
  setChangeObject: React.Dispatch<React.SetStateAction<Record<string, any>>>;
};

export function EditTokenModal({ onClose, ...rest }: Props) {
  return (
    <div
      className="w-screen h-screen bg-[#00000010] top-0 left-0 backdrop-blur-sm fixed flex items-center gap-1 justify-center z-[99]"
      onClick={() => {
        onClose();
      }}
    >
      <EditToken onClose={onClose} {...rest} />
    </div>
  );
}

function validateToken(token: any) {
  if (!token.coinDenom) {
    return "coinDenom is required";
  }
  if (!token.name) {
    return "name is required";
  }
  if (token.coinDecimals === undefined) {
    return "coinDecimals is required";
  }
  if (isNaN(parseInt(token.coinDecimals))) {
    return "coinDecimals should be a number";
  }
  if (!token.chain) {
    return "chain is required";
  }
  return null;
}

function EditToken({
  onClose,
  selectedToken,
  selectedTokenKey,
  changeObject,
  setChangeObject,
}: Props) {
  const token = useMemo(() => {
    return changeObject?.[selectedTokenKey] ?? selectedToken;
  }, [selectedToken, changeObject, selectedTokenKey]);

  const [modifiedToken, setModifiedToken] = React.useState(token);
  const [error, setError] = React.useState<string>();
  const isModified = useMemo(() => {
    return !isEqual(token, modifiedToken);
  }, [modifiedToken, token]);

  const onFieldChange = useCallback(
    (key: string) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(undefined);
        let newValue: string | number | boolean = e.target.value;
        if (key === "coinDecimals") {
          newValue = parseInt(newValue);
        } else if (key === "isWhiteListed") {
          newValue = e.target.checked;
        }

        setModifiedToken((prev: any) => ({
          ...prev,
          [key]: newValue,
        }));
      };
    },
    [setModifiedToken]
  );

  const onSaveClick = useCallback(() => {
    const error = validateToken(modifiedToken);
    if (error) {
      setError(error);
      return;
    }
    console.log(modifiedToken);
    if (isEqual(selectedToken, modifiedToken)) {
      setChangeObject((prevChangeObject) => {
        const newChangeObject = { ...prevChangeObject };
        delete newChangeObject[selectedTokenKey];
        return newChangeObject;
      });
    } else {
      setChangeObject((prevChangeObject) => {
        return {
          ...prevChangeObject,
          [selectedTokenKey]: {
            ...modifiedToken,
          },
        };
      });
    }
    onClose();
  }, [
    modifiedToken,
    selectedToken,
    selectedTokenKey,
    setChangeObject,
    onClose,
  ]);

  return (
    <div
      className="p-7 bg-white shadow-lg rounded-2xl"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <div className="font-bold text-lg">Token Info</div>
          <button
            className="flex flex-row justify-center items-center"
            onClick={() => {
              onClose();
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-row justify-start items-start gap-4">
          <div className="flex flex-col justify-start items-start gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-bold">coinDenom</label>
              <input
                type="text"
                value={modifiedToken.coinDenom}
                onChange={onFieldChange("coinDenom")}
                className="p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold">name</label>
              <input
                type="text"
                value={modifiedToken.name}
                onChange={onFieldChange("name")}
                className="p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex flex-col justify-start items-start gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-bold">Icon URL</label>
                <input
                  type="text"
                  value={modifiedToken.icon}
                  onChange={onFieldChange("icon")}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-start items-start gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-bold">coinDecimals</label>
              <input
                type="number"
                onChange={onFieldChange("coinDecimals")}
                value={modifiedToken.coinDecimals}
                className="p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold">coinGeckoId</label>
              <input
                type="text"
                onChange={onFieldChange("coinGeckoId")}
                value={modifiedToken.coinGeckoId}
                className="p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex flex-row justify-between w-full gap-4 items-start">
              <label className="font-bold">Preview</label>

              {
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={modifiedToken.icon ?? "generic-token.svg"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "generic-token.svg";
                  }}
                  alt="icon"
                  className="w-[74px] h-[74px]"
                />
              }
            </div>
          </div>

          <div className="flex flex-col justify-start items-start gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-bold">coinMinimalDenom</label>
              <input
                type="text"
                readOnly={true}
                value={modifiedToken.coinMinimalDenom}
                className="p-2 border border-gray-300 rounded-lg cursor-not-allowed bg-slate-200 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold">key</label>
              <input
                type="text"
                readOnly={true}
                value={selectedTokenKey}
                className="p-2 border border-gray-300 rounded-lg cursor-not-allowed bg-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col justify-start items-start gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-bold">chain</label>
              <input
                type="text"
                readOnly={true}
                value={modifiedToken.chain}
                className="p-2 border border-gray-300 rounded-lg cursor-not-allowed bg-slate-200 outline-none"
              />
            </div>
            {modifiedToken?.isWhiteListed !== undefined && (
              <div className="flex flex-col gap-2 items-start">
                <label className="font-bold">isWhiteListed?</label>
                <input
                  type="checkbox"
                  onChange={onFieldChange("isWhiteListed")}
                  checked={modifiedToken.isWhiteListed}
                  className="h-6 w-6"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full justify-between items-center gap-4">
          <div className="text-red-600">{error}</div>
          <div className="flex flex-row items-center justify-end gap-4">
            <button
              className={classNames(
                "px-6 py-2 bg-blue-500 text-white rounded-lg",
                {
                  "cursor-not-allowed opacity-40": !isModified,
                }
              )}
              disabled={!isModified}
              onClick={() => {
                setModifiedToken(token);
              }}
            >
              Reset
            </button>
            <button
              className={classNames(
                "px-6 py-2 bg-green-500 text-white rounded-lg",
                {
                  "cursor-not-allowed opacity-40": !isModified,
                }
              )}
              disabled={!isModified}
              onClick={onSaveClick}
            >
              Save
            </button>
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-6">
          <div className="font-bold text-lg">Upload Icon Settings</div>
        </div>

        <div className="flex flex-row w-full justify-start items-start gap-4">
          <div className="flex flex-col justify-start items-start gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-bold">Icon File</label>
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  className="p-2 w-[238px] border border-gray-300 rounded-lg"
                />
                <button className="rounded-full h-10 w-10 bg-blue-600 material-symbols-outlined text-white">
                  upload
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between w-full gap-4 items-start">
            <label className="font-bold">Preview</label>

            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={modifiedToken.icon ?? "generic-token.svg"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "generic-token.svg";
                }}
                alt="icon"
                className="w-[74px] h-[74px]"
              />
            }
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-6">
          <div className="font-bold text-lg">Additional Info</div>
        </div>

        <div className="flex flex-col justify-start w-full items-start gap-4">
          <div className="flex flex-row w-full justify-between items-center">
            <div className="font-bold">Type</div>
            <div className="">{modifiedToken.type}</div>
          </div>

          <div className="flex flex-row w-full justify-between items-center">
            <div className="font-bold">Price (coinGecko)</div>
            <div className="">
              {modifiedToken.cgPrice
                ? formatCurrencyValue(modifiedToken.cgPrice)
                : "-"}
            </div>
          </div>
          <div className="flex flex-row w-full justify-between items-center">
            <div className="font-bold">Price (non-coinGecko)</div>
            <div className="">
              {modifiedToken.astroPortPrice
                ? formatCurrencyValue(modifiedToken.astroPortPrice)
                : "-"}
            </div>
          </div>
          <div className="flex flex-row w-full justify-between items-center">
            <div className="font-bold">Price (astroport APIs)</div>
            <div className="">
              {modifiedToken.astroPortAPIPrice !== undefined
                ? formatCurrencyValue(modifiedToken.astroPortAPIPrice)
                : "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
