import { redirect } from 'next/navigation'

export default function Home() {
  // The Mining Intelligence Atlas is a static HTML documentation site
  // served from /public. Redirect the root route to the atlas home page.
  redirect('/index.html')
}
