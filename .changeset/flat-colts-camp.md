---
"@remix-storage/bodyparser": patch
---

Initial relealese. This project try to simplify how upload files and validate a request on a Remix project. It's heavily inspired in Rails Active Storage and AdonisJS Drive. Both are awesome pieces of software that makes developers lifes way easier.

In this first release we ship an incomplete and probably buggy version of our
vision for one of the pieces. The parsing of a request. With
`@remix-storage/bodyparser` we want:

1. Parse a Remix request. Get the user the fields on a form with the intended
   values formatted and validated
2. Upload any files present on a multipart request.
3. Remove those files if a validation error appears. This free developers from
   dealing with unlinking files.
