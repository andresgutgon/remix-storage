import type { LoaderFunction } from "remix"
import { useLoaderData, json } from "remix"
import { bodyparser } from "~remix-storage/bodyparser"

export const loader: LoaderFunction = () => {
  const hey = bodyparser("hola")
  return json({ hey })
}

// https://remix.run/guides/routing#index-routes
export default function Index() {
  const data = useLoaderData()
  return (
    <main>
      <h2>Remix storage</h2>
      <p>{data.hey}</p>
    </main>
  )
}
