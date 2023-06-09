import { supabase } from './supabase'

async function main() {
  const { data, error } = await supabase.from('github_project').select('*').range(0, 9)
  if (error) {
    console.error(error)
    return
  }
  
}

main()
