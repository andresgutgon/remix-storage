import { LoaderFunction, useLoaderData  } from "remix"
import { Driver, hello } from "@remix-storage/core"

class LOL implements Driver {
  public hello(): string {
    return "HOLs"
  }
}

console.log(LOL)

export const loader: LoaderFunction = async () => {
  const helloResult = hello()

  console.log("RESULT LOL", helloResult)

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
