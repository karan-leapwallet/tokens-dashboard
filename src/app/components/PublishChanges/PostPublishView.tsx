import React from "react";

export function PostPublishView({
  prUrl,
  onClose,
}: {
  prUrl: string;
  onClose: () => void;
}) {
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
