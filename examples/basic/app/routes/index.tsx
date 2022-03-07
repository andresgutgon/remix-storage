import { ActionFunction, useActionData } from "remix"
import { Form, json } from "remix"
import parser from "../lib/parser.server"

// ZOd in dev not working
// const schema = z.object({ name: z.string().max(10) })
export const action: ActionFunction = async ({ request }) => {
  const result = await parser.parse({ request })
  return json({ result })
}

// https://remix.run/guides/routing#index-routes
export default function Index() {
  const data = useActionData()
  return (
    <main>
      <h2>Remix storage</h2>
      <pre>{JSON.stringify(data)}</pre>
      <Form method="post" encType="multipart/form-data">
        {/* <Form method="post"> */}
        <input id="avatar-input" type="file" name="avatar" />
        {/* <input type="text" id="name" name="name" /> */}
        <button type="submit">Upload</button>
      </Form>
    </main>
  )
}
