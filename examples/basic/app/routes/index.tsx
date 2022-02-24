import {
  Form,
  unstable_parseMultipartFormData,
  ActionFunction
} from "remix"
import { Driver, fileParser } from "@remix-storage/core"

class Foo implements Driver {
  hello(): string {
    return "HOLA"
  }
}

console.log("HOLA", Foo)

export const action: ActionFunction = async ({ request }) => {
  console.log("REQUEST", request)

  const form = await unstable_parseMultipartFormData(
    request,
    fileParser
  )
  const file = form.get("myFile")
  console.log("MyFile SIZE", (file as File)?.size)
  console.log("MyFile TYPE", (file as File)?.type)
  return {}
}

export default function Index() {
  return (
    <div>
      <h1>Simple Upload file</h1>
      <Form method="post" encType="multipart/form-data">
        <input
          name="myFile"
          multiple
          type="file"
          accept="image/*"
        />
        <br />
        <button type="submit">
          Upload
        </button>
      </Form>
    </div>
  )
}
