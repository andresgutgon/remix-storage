import { ActionFunction, useActionData } from "remix"
import { Form, json } from "remix"
import { parser, schema } from "../lib/parser.server"

export const action: ActionFunction = async ({ request }) => {
  // A body parser that works with Zod
  // 1. Validates request fields
  // 2. Upload files
  // 3. Remove files if validation fails
  // 4. Return value is typed
  const result = await parser.parse({ request, schema })

  if (result.success) {
    console.log("DATA", result.data.avatar)
  } else {
    console.log("ERROR", result.data)
  }

  // FIXME: ShapeFile attributes are not recognized
  return json({ result })
}

export default function Index() {
  const data = useActionData()
  return (
    <main>
      <h2>Remix storage</h2>
      <pre style={{ maxWidth: 400, display: "block" }}>
        {JSON.stringify(data)}
      </pre>
      <Form method="post" encType="multipart/form-data">
        <input type="text" id="name" name="name" />
        <br />
        <br />
        <input id="avatar-input" type="file" name="avatar" />
        <br />
        <br />
        <button type="submit">Upload</button>
      </Form>
    </main>
  )
}
