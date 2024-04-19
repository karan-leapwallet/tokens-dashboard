"use client";
import axios from "axios";
import React, { useCallback } from "react";
import { AWS_API_URL } from "../utils/constant";
import AuthedView from "./AuthedView";
import UnauthedView from "./UnauthedView";

type Props = {};

function Page({}: Props) {
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [inputAPIKey, setInputAPIKey] = React.useState("");

  return isAuthed ? (
    <AuthedView apiKey={inputAPIKey} />
  ) : (
    <UnauthedView
      input={inputAPIKey}
      setInput={setInputAPIKey}
      setIsAuthed={setIsAuthed}
    />
  );
}

export default Page;
