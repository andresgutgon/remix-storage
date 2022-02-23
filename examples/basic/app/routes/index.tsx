import { LoaderFunction, useLoaderData  } from "remix"
import { hello } from "@remix-storage/core"

export const loader: LoaderFunction = async () => {
  const helloResult = hello()

  console.log("HELLO 3", helloResult)

  return { helloResult }
}

export default function Index() {
  const data = useLoaderData()
  return (
    <div>
      <h1>Welcome to Remix</h1>
      <p>{data.helloResult}</p>
    </div>
  )
}
