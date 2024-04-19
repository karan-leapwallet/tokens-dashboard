import React, { useMemo } from "react";

export function PostPublishView({
  pr,
  onClose,
}: {
  pr: any;
  onClose: () => void;
}) {
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
        <a href={prUrl} target="_blank" className="text-blue-500 underline">
          {prUrl}
        </a>
      </div>
    </div>
  );
}
