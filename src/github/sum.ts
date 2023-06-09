import { sum } from '../sum'
import { supabase } from './supabase'
import dayjs from 'dayjs'

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// sum today content
async function list(num: number, delay?: number) {
  // today trending repo
  const { data, error } = await supabase.from('github_project').select('*').gt('date', dayjs().startOf('day').valueOf()).is('sum_text', null).order('id', { ascending: true })
  if (error) {
    console.error('trending get error:', error)
    return
  }

  async function runChain(projects) {
    const project = projects.shift()
    const sum_text = await sum(project.readme)
    const { error } = await supabase.from('github_project')
      .update({ sum_text })
      .eq('id', project.id)
  
    if (error) {
      console.error('sum error:', project.id, sum_text)
    } else {
      console.log('finish sum:', project.id)
    }
    delay && await sleep(delay) // workaround openai api limit

    if (projects.length) {
      await runChain(projects)
    }
  }

  const projects = data.splice(0, num - 1)
  runChain(projects)
}

async function single(id: number) {
  // today trending repo
  const { data, error } = await supabase.from('github_project').select('*').eq('id', id)
  if (error) {
    console.error('trending get error:', error)
    return
  }

  const project = data[0]
  const sum_text = await sum(project.readme)
  
  console.log(sum_text)
  await supabase.from('github_project')
    .update({ sum_text })
    .eq('id', project.id)

}

single(45)
// list(4, 15)

