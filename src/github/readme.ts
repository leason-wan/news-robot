import { supabase } from './supabase'
import { Octokit } from "octokit";

import * as dotenv from 'dotenv'
dotenv.config()

async function readmeGet(owner, repo): Promise<string> {
  const octokit = new Octokit({
    auth: process.env.GITHUB_KEY,
  });

  const res = await octokit.request(`GET /repos/${owner}/${repo}/readme`, {
    owner: "OWNER",
    repo: "REPO",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const readme = Buffer.from(res.data.content, 'base64').toString('utf-8')
  
  return readme
}

async function main() {
  const { data: github_project, error } = await supabase.from('github_project').select('id, repo, owner, readme').is('readme', null)
  if (error || !github_project) {
    console.error('trending get error', error)
    return
  }

  for (const project of github_project) {
    const readme = await readmeGet(project.owner, project.repo)
    const { error, data } = await supabase.from('github_project')
      .update({ readme })
      .eq('id', project.id)
    if (error) {
      console.log('save readme error:', error)
      console.log(error)
    }
    console.log('save readme success:', project.id)
  }
}

main()