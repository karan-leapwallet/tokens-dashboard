import axios, { AxiosError } from "axios";
import React, { useMemo } from "react";
import useSWR from "swr";
import {
  getGithubApiHeader,
  getPullRequest,
  getWorkflowRunsWithEvent,
  sleep,
} from "./utils";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";
import { GITHUB_CONFIG } from "@/app/utils/contants";
import toast from "react-hot-toast";
import { PrePublishView } from "./PrePublishView";
import { PostPublishView } from "./PostPublishView";

export type Props = {
  onClose: () => void;
  changeObject: any;
  tokens: Record<string, any> | null;
  setChangeObject: React.Dispatch<React.SetStateAction<Record<string, any>>>;
};

export async function publishChanges(
  changes: Record<string, any>,
  githubToken: string,
  branchName: string
) {
  const timestamp = new Date().getTime();
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
        timestamp: timestamp,
      },
    };
    const res = await axios.post(
      `https://api.github.com/repos/${GITHUB_CONFIG.OWNER_NAME}/${GITHUB_CONFIG.REPO_NAME}/dispatches`,
      body,
      {
        headers: getGithubApiHeader(githubToken),
      }
    );
    console.log("data", res.data);
    while (true) {
      const allWorkflowRunsWithRepositoryDispatchEvents =
        await getWorkflowRunsWithEvent(
          GITHUB_CONFIG.OWNER_NAME,
          GITHUB_CONFIG.REPO_NAME,
          githubToken,
          "repository_dispatch"
        );
      const workflowRunsWithRepositoryDispatchEvent =
        await allWorkflowRunsWithRepositoryDispatchEvents.find((run: any) => {
          return (
            new Date(run.created_at).getTime() >= timestamp ||
            new Date(run.updated_at).getTime() >= timestamp
          );
        });

      if (workflowRunsWithRepositoryDispatchEvent) {
        console.log(
          "workflowRunsWithRepositoryDispatchEvent",
          workflowRunsWithRepositoryDispatchEvent
        );
        const workflowRunStatus =
          workflowRunsWithRepositoryDispatchEvent.status;
        if (workflowRunStatus === "completed") {
          console.log("Workflow run completed");
          const conclusion = workflowRunsWithRepositoryDispatchEvent.conclusion;
          if (conclusion === "success") {
            console.log("Workflow run success");
            const pr = await getPullRequest(
              GITHUB_CONFIG.OWNER_NAME,
              GITHUB_CONFIG.REPO_NAME,
              GITHUB_CONFIG.BASE_BRANCH_NAME,
              branchName,
              githubToken
            );
            console.log("PR", pr);
            if (pr?.body?.split("----")?.[1]?.includes(timestamp)) {
              toast.success("PR created/updated successfully");
              break;
            } else {
              throw new Error(
                "Workflow completed with success, PR not created/updated"
              );
            }
          } else {
            throw new Error("Workflow run failed");
          }
        }
      }
      sleep(5000);
    }
    return;
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

const PublishChanges = ({
  onClose,
  changeObject,
  setChangeObject,
  tokens,
}: Props) => {
  const [branchSuffix, setBranchSuffix] = React.useState("");
  const [branchPrefix, setBranchPrefix] = React.useState("");
  const [githubToken, setGithubToken] = React.useState("");
  const [hasPublished, setHasPublished] = React.useState<boolean>(false);

  const branchName = useMemo(() => {
    const _branchPrefix = branchPrefix || "new-branch";
    return `${_branchPrefix}-${branchSuffix}`;
  }, [branchPrefix, branchSuffix]);

  const debouncedBranchName = useDebouncedValue(branchName, 500);
  const debouncedGithubToken = useDebouncedValue(githubToken, 500);

  const {
    data: existingPR,
    isLoading: existingPRIsLoading,
    mutate,
  } = useSWR(
    [`existing-pr-${debouncedBranchName}-${debouncedGithubToken}`],
    async () => {
      if (!debouncedBranchName || !debouncedGithubToken) return null;
      return await getPullRequest(
        GITHUB_CONFIG.OWNER_NAME,
        GITHUB_CONFIG.REPO_NAME,
        GITHUB_CONFIG.BASE_BRANCH_NAME,
        debouncedBranchName,
        debouncedGithubToken
      );
    }
  );

  return (
    <div
      className="p-7 bg-white shadow-lg rounded-2xl w-[80vw] max-h-[700px] scrollbar overflow-y-auto"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {hasPublished ? (
        <PostPublishView
          prUrl={existingPR?.html_url || ""}
          onClose={() => {
            setHasPublished(false);
            onClose();
          }}
        />
      ) : (
        <PrePublishView
          onPublishSuccess={() => {
            mutate();
            setHasPublished(true);
          }}
          onClose={onClose}
          changeObject={changeObject}
          tokens={tokens}
          setChangeObject={setChangeObject}
          branchName={branchName}
          githubToken={githubToken}
          existingPR={existingPR}
          setBranchPrefix={setBranchPrefix}
          setBranchSuffix={setBranchSuffix}
          setGithubToken={setGithubToken}
          branchPrefix={branchPrefix}
          branchSuffix={branchSuffix}
        />
      )}
    </div>
  );
};
