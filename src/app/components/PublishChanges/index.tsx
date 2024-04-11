import axios, { AxiosError } from "axios";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

type Props = {
  onClose: () => void;
  changeObject: any;
  tokens: Record<string, any> | null;
  setChangeObject: React.Dispatch<React.SetStateAction<Record<string, any>>>;
};

async function publishChanges(
  changes: Record<string, any>,
  githubToken: string,
  branchName: string
) {
  try {
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
          Authorization: `Bearer ${githubToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    console.log("data", res.data);
    return res.data;
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 401) {
      throw new Error("Invalid Github token");
    }
    throw e;
  }
}

const PublishChangesModal = ({ onClose, ...rest }: Props) => {
  return (
    <div
      className="w-screen h-screen bg-[#00000010] top-0 left-0 backdrop-blur-sm fixed flex items-center gap-1 justify-center z-[99]"
      onClick={() => {
        onClose();
      }}
    >
      <PublishChanges onClose={onClose} {...rest} />
    </div>
  );
};

export default PublishChangesModal;

const PublishChanges = ({ onClose, changeObject, tokens }: Props) => {
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const [branchPrefix, setBranchPrefix] = React.useState("");
  const [branchSuffix, setBranchSuffix] = React.useState("");
  const [githubToken, setGithubToken] = React.useState("");
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [publishError, setPublishError] = React.useState<string | null>(null);

  useEffect(() => {
    setBranchSuffix(uuidv4());
  }, []);

  const branchName = useMemo(() => {
    const _branchPrefix = branchPrefix || "new-branch";
    return `${_branchPrefix}-${branchSuffix}`;
  }, [branchPrefix, branchSuffix]);

  const isAccepted = useMemo(() => {
    return termsAccepted && githubToken;
  }, [githubToken, termsAccepted]);

  const oldObject = useMemo(() => {
    return Object.keys(changeObject).reduce((acc: Record<string, any>, key) => {
      acc[key] = tokens?.[key];
      return acc;
    }, {});
  }, [changeObject, tokens]);

  const onPrefixChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPublishError(null);
      setBranchPrefix(e.target.value);
    },
    []
  );

  const onTokenChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPublishError(null);
      setGithubToken(e.target.value);
    },
    []
  );

  const onPublish = useCallback(() => {
    setPublishError(null);
    if (!isAccepted) {
      return;
    }
    setIsPublishing(true);
    triggerPublish();

    async function triggerPublish() {
      try {
        await publishChanges(changeObject, githubToken, branchName);
      } catch (e) {
        console.error(e);
        setPublishError(
          e instanceof Error
            ? e?.message
            : "An error occurred while publishing changes."
        );
      } finally {
        setIsPublishing(false);
      }
    }
  }, [branchName, changeObject, githubToken, isAccepted]);

  return (
    <div
      className="p-7 bg-white shadow-lg rounded-2xl w-[80vw] max-h-[700px] scrollbar overflow-y-auto"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <div className="font-bold text-lg">Publish Changes</div>
          <button
            className="flex flex-row justify-center items-center"
            onClick={() => {
              onClose();
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-start w-full mt-4 items-start">
        <div className="flex flex-row justify-between items-center w-full gap-4">
          <div className="font-bold text-lg">Changes Summary</div>
          <button
            onClick={() => {
              setSummaryOpen((prevSummaryOpen) => !prevSummaryOpen);
            }}
            className="material-symbols-outlined"
          >
            {summaryOpen ? "expand_less" : "expand_more"}
          </button>
        </div>
        {summaryOpen && (
          <div className="flex flex-row justify-between items-stretch gap-4 w-full">
            <div className="flex-1 overflow-x-auto">
              <div className="text-lg mb-2">Old</div>

              <div className="bg-slate-100 max-h-[500px] scrollbar rounded-2xl overflow-x-auto p-4 w-full overflow-y-auto">
                <pre>{JSON.stringify(oldObject, null, 2)}</pre>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <div className="text-lg mb-2">New</div>

              <div className="bg-slate-100 max-h-[500px] scrollbar rounded-2xl p-4 overflow-y-auto overflow-x-auto w-full">
                <pre>{JSON.stringify(changeObject, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
      {!isPublishing && (
        <>
          <div className="flex flex-row justify-between items-center gap-4 mt-4">
            <label className="gap-2 flex flex-col">
              <span className="font-bold">Branch prefix</span>
              <input
                type="text"
                value={branchPrefix}
                onChange={onPrefixChange}
                className="block px-4 py-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="new-branch"
              />
            </label>

            <label className="gap-2 flex flex-col">
              <span className="font-bold">Github token</span>
              <input
                type="password"
                value={githubToken}
                onChange={onTokenChange}
                className="block px-4 py-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Github token"
              />
            </label>

            <label className="gap-2 flex flex-col">
              <span className="font-bold">Branch suffix</span>
              <input
                type="text"
                readOnly
                className="block px-4 py-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={branchSuffix}
              />
            </label>
          </div>

          <div className="flex mt-4 flex-col gap-2">
            <div className="font-bold text-lg">Branch name</div>
            <textarea
              className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              readOnly
              value={branchName}
            />
          </div>

          {publishError && (
            <div className="flex flex-row justify-start items-center gap-2 mt-4">
              <span className="text-red-500">{publishError}</span>
            </div>
          )}

          <div className="flex flex-row justify-between items-center gap-4 mt-4">
            <div className="flex flex-row justify-start items-center gap-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                }}
              />
              <span>I accept that I have copied branch name.</span>
            </div>
            <button
              className={classNames(
                "flex flex-row justify-center items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg",
                {
                  "opacity-40 cursor-not-allowed": !isAccepted,
                }
              )}
              onClick={onPublish}
            >
              Publish <span className="material-symbols-outlined">public</span>
            </button>
          </div>
        </>
      )}
      {isPublishing && (
        <div className="flex flex-row justify-center items-center gap-2 mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span>
            Publishing changes to <span className="italic">{branchName}</span>{" "}
            branch...
          </span>
        </div>
      )}
    </div>
  );
};
