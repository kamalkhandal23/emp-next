import fetch from 'node-fetch'

async function run() {
  try {
    const res = await fetch('https://emp-new-iksg-git-main-teamoflifeboxs-projects.vercel.app/api/nextgen/courses')
    console.log('Status:', res.status)
    const text = await res.text()
    console.log('Body:', text)
  } catch (err) {
    console.error('Request failed:', err)
  }
}

run()
