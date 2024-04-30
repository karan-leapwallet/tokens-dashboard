import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

export function PostPublishView({
  pr,
  onClose,
}: {
  pr: any;
  onClose: () => void;
}) {
  const [prUrlCopied, setPrUrlCopied] = useState<boolean>(false);
  const prUrl = useMemo(() => {
    return pr?.html_url;
  }, [pr]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center gap-2">
        <div className="font-bold text-lg">PR Published</div>
        <button
          className="material-symbols-outlined"
          onClick={() => {
            onClose();
          }}
        >
          close
        </button>
      </div>
      <div className="flex flex-row justify-between items-center gap-2">
        <span>PR URL</span>
        <div className="flex flex-row justify-end items-center gap-1">
          <a href={prUrl} target="_blank" className="text-blue-500 underline">
            {prUrl}
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(prUrl);
              toast.success("Branch name copied to clipboard");
              setPrUrlCopied(true);
              setTimeout(() => {
                setPrUrlCopied(false);
              }, 1000);
            }}
            className="material-symbols-outlined ml-1 !text-[18px] !leading-[20px]"
          >
            {prUrlCopied ? "done" : "content_copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
