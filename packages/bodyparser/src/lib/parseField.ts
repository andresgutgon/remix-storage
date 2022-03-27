import z from "zod"

export type FieldResult = {
  name: string
  success: boolean
  data: unknown
  errors: string[]
}
type Props = {
  shape: z.input<z.ZodTypeAny>
  name: string
  value: unknown
}
export async function parseField({
  shape,
  name,
  value
}: Props): Promise<FieldResult | undefined> {
  if (!shape) return undefined

  const { success, data, error } = await shape.safeParseAsync(value)
  return {
    name,
    success,
    data: success ? data : null,
    errors: error?.flatten?.()?.formErrors || []
  }
}
