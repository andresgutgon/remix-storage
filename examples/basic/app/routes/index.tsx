import { ActionFunction, useActionData } from "remix"
import { Form, json } from "remix"
import parser from "../lib/parser.server"
import { z, file, FileShape } from "~remix-storage/bodyparser"

const schema = z.object({
  field_one: z.string().max(20),
  field_two: file()
})

export const action: ActionFunction = async ({ request }) => {
  // A body parser that works with Zod
  // 1. Validates request fields
  // 2. Upload files
  // 3. Remove files if validation fails
  // 4. Return value is typed
  const result = await parser.parse({ request, schema })

  if (result.success) {
    console.log("DATA", result.data.field_two)
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
        {/* <Form method="post"> */}
        <input id="avatar-input" type="file" name="avatar" />
        {/* <input type="text" id="name" name="name" /> */}
        <button type="submit">Upload</button>
      </Form>
    </main>
  )
}
