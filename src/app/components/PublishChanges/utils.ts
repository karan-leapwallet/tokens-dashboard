import axios from "axios";

export async function getPullRequest(
  owner: string,
  repo: string,
  base: string,
  head: string,
  githubToken: string
) {
  const res = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/pulls?head=${owner}:${head}&base=${base}`,
    {
      headers: getGithubApiHeader(githubToken),
    }
  );
  const prs = res?.data?.filter(
    (pr: any) => pr.head.ref === head && pr.title.includes(head)
  );
  return prs?.[0];
}

export async function getWorkflowRunsWithEvent(
  owner: string,
  repo: string,
  githubToken: string,
  event: string
) {
  const res = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/actions/runs?event=${event}`,
    {
      headers: getGithubApiHeader(githubToken),
    }
  );

  return res?.data?.workflow_runs;
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getGithubApiHeader(githubToken: string) {
  return {
    Authorization: `Bearer ${githubToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}
