import { CheerioCrawler } from "crawlee";
import dayjs from 'dayjs'
import { Project } from './type'

import { supabase } from './supabase'

const crawler = (urls: string[]): Promise<Project[]> => new Promise((resolve) => {
  async function requestHandler({ request, $, enqueueLinks, log }) {
    log.info(`=================github trending start====================`);

    const projects: Project[] = [];

    $(".Box-row").each((i, el) => {
      const title = $(el).find(".h3.lh-condensed a").text();
      const [owner, repo] = title.split("/").map((t) => t.trim());
      const desc = $(el).find(".col-9.color-fg-muted.my-1.pr-4").text().trim();
      const project = {
        repo,
        owner,
        url: `https://github.com/${owner}/${repo}`,
        desc,
        date: dayjs().valueOf()
      }
      projects.push(project);
    })
    resolve(projects)
  }
  const crawler = new CheerioCrawler({ requestHandler });
  crawler.run(urls)
});

export async function main() {
  let projects = await crawler(["https://github.com/trending"]);

  for (const project of projects) {
    const { data, error, status } = await supabase.from('github_project').select('*').eq('url', project.url).single()
    if (error && status !== 406) throw error
    if (status === 406) {
      console.log(project)
      await supabase.from('github_project').upsert(project)
    }
  }
  console.log('===========success===========')
}

main()
