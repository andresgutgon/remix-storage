## TODO

- [x] Copy body parser implementation from remix-storage-backup and do TDD
- [x] How to create a Node server post Request with body?
- [x] Try to use Zod schemas for body fields validations. Start with fields
- [x] Try file fields
- [x] Pass in the right way the file in the fixture. Is being read a binary application/optept-stream and it should be read as image/jpeg
- [x] Try to create a custom z.ZodType // ZodFile.or(z.string()).optiona() it would be nice to be able to chain with the rest of Zod types. PR open for it: https://github.com/colinhacks/zod/pull/1017
- [x] FIX the mess with file extension
- [x] To TODO test in line 152: Validate filenames are auto generated with random
      number if the filename already exist in the destination folder
- [x] Validate mimetypes and return errors defined by user or default
- [x] Clean up files if any file has errors or any field has errors.
- [x] Finish passing existing fields to new way with supertest
- [x] Validate file MAX size and return errors defined by user or default
- [x] When having error on first file. Complete result with null data for the
      other fields
- [x] Move schemas to each own file and use it on query
- [x] Ensure required fields are present
- [x] Throw FileShape on `validateFile`
- [x] Validate file MIN size and return errors defined by user or default
- [x] Handle file input with `multiple=true`
- [ ] Handle array of fields `my_field[]` return Array of strings or Enum
- [] Make a wrapper around z.file to initialize with `FileShape`
- [] Handle `busboy` limits errors
- [] Publish in npm.io :tada:

## Next TODO

- [ ] Handle Error that is not a FileShape in Abort. Throw it again. Will be
      done when implementing `@remix-storage/drive`

## Test the lib with a remix application example

To see in action `remix-storage` in a Remix app:

```
// nx dev [example remix app]
// Ex.:
nx dev basic

```

To create a new Remix app example:

```
npx nx g @nrwl/remix:app [NAME_OF_YOUR_EXAMPLE]

// Once the app is created edit remix config:
cd [NAME_OF_YOUR_EXAMPLE]
vim .remix.config.js
// Add this:
module.exports = {
  // Rest of existing options
  watchGlobs: ["../../packages/**/src/**/*.ts"]
}
```

## Run tests

Run test one of the packages

```
nx test:watch bodyparser
```

## References

[Author of zod explain his motivation for building zod](https://colinhacks.com/essays/zod)
[An article linked on the previous link, "parse don't validate"](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
[Efficient Busboy stop processing data with p-queue](https://bytearcher.com/articles/terminate-busboy/)
[Type of request with AJAX](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#submitting_forms_and_uploading_files)

### Streams

Interesting read on Node streams and pull-streams

- [The history of streams](https://dominictarr.com/post/145135293917/history-of-streams)
- [Pull streams](https://dominictarr.com/post/149248845122/pull-streams-pull-streams-are-a-very-simple)
