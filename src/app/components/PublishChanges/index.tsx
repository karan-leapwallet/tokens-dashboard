import axios from "axios";
import React, { useMemo } from "react";
import { PostPublishView } from "./PostPublishView";
import { PrePublishView } from "./PrePublishView";
import { AWS_API_URL } from "@/app/utils/constant";

export type Props = {
  onClose: () => void;
  apiKey: string;
  changeObject: any;
  tokens: Record<string, any> | null;
  setImagesToUpload: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  imagesToUpload: Record<string, any>;
  setChangeObject: React.Dispatch<React.SetStateAction<Record<string, any>>>;
};

export async function publishChanges(
  apiKey: string,
  changes: Record<string, any>,
  images: Record<string, any>,
  branchName: string
) {
  console.log({ changes, images, branchName });
  const res = await axios.post(
    AWS_API_URL,
    {
      changes,
      images,
      branchName,
    },
    {
      headers: {
        "x-api-key": apiKey,
      },
    }
  );

  const pr = JSON.parse(res?.data?.body ?? {});

  return pr;
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
  setImagesToUpload,
  imagesToUpload,
  tokens,
  apiKey,
}: Props) => {
  const [pr, setPR] = React.useState<any>();
  const [branchSuffix, setBranchSuffix] = React.useState("");
  const [branchPrefix, setBranchPrefix] = React.useState("");
  const [hasPublished, setHasPublished] = React.useState<boolean>(false);

  const branchName = useMemo(() => {
    const _branchPrefix = branchPrefix || "new-branch";
    return `${_branchPrefix}-${branchSuffix}`;
  }, [branchPrefix, branchSuffix]);

  return (
    <div
      className="p-7 bg-white shadow-lg rounded-2xl w-[80vw] max-h-[700px] scrollbar overflow-y-auto"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {hasPublished ? (
        <PostPublishView
          pr={pr}
          onClose={() => {
            setHasPublished(false);
            onClose();
          }}
        />
      ) : (
        <PrePublishView
          apiKey={apiKey}
          onPublishSuccess={(pr: any) => {
            setHasPublished(true);
            setPR(pr);
          }}
          onClose={onClose}
          changeObject={changeObject}
          setImagesToUpload={setImagesToUpload}
          tokens={tokens}
          setChangeObject={setChangeObject}
          branchName={branchName}
          setBranchPrefix={setBranchPrefix}
          setBranchSuffix={setBranchSuffix}
          branchPrefix={branchPrefix}
          branchSuffix={branchSuffix}
          imagesToUpload={imagesToUpload}
        />
      )}
    </div>
  );
};
