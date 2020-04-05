# RS School NodeJS course

You can generate a new repository with the same directory structure and files as an existing repository using GitHub article: [ Creating a repository from a template](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template).

**N.B**. This structure is recommended for the implementation tasks starting from the **second**. The first task is not related to subsequent ones.

## Task 1. Caesar cipher CLI tool

**Implement CLI tool that will encode and decode a text by [Caesar cipher](https://en.wikipedia.org/wiki/Caesar_cipher)**.

CLI tool should accept 4 options (short alias and full name):

1.  **-s, --shift**: a shift
2.  **-i, --input**: an input file
3.  **-o, --output**: an output file
4.  **-a, --action**: an action encode/decode

**Details:**

1. For command-line arguments could be used one of

- [https://www.npmjs.com/package/commander](https://www.npmjs.com/package/commander)
- [https://www.npmjs.com/package/minimist](https://www.npmjs.com/package/minimist)
  or any other module.

2. Action (encode/decode) and the shift are required, if one of them missed - an error should be shown, the process should exit with non-zero status code.
3. If the input file is missed - use stdin as an input source.
4. If the output file is missed - use stdout as an output destination.
5. If the input and/or output file is given but doesn't exist or you can't read it (e.g. because of permissions or it is a directory) - human-friendly error should be printed in stderr.
6. If passed params are fine the output (file or stdout) should contain encoded/decoded content of input (file or stdin).
7. For encoding/decoding use only the English alphabet, all other characters should be kept untouched.

**Hints:**
As suggested solution to make streams code more robust, and memory effective, consider to use [pipeline method](https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback).
Structure can be the following:

```javascript
pipeline(
  input_stream, // input file stream or stdin stream
  transform_stream, // standard Transform stream or https://github.com/rvagg/through2
  output_stream // output file stream or stdout stream
)
.then(success and error callbacks)
```

**Usage example:**

```bash
$ node my_caesar_cli -a encode -s 7 -i "./input.txt" -o "./output.txt"
```

```bash
$ node my_caesar_cli --action encode --shift 7 --input plain.txt --output encoded.txt
```

```bash
$ node my_caesar_cli --action decode --shift 7 --input decoded.txt --output plain.txt
```

> input.txt
> `This is secret. Message about "_" symbol!`

> output.txt
> `Aopz pz zljyla. Tlzzhnl hivba "_" zftivs!`

## Task 2. Express REST service

Let's try to create a competitor for Trello!

**Create an [Express](https://expressjs.com/ru/) application, the application should operate with the following resources:**

- User (with attributes):
  ```javascript
  { id, name, login, password }
  ```
- Board (set of columns):
  ```javascript
  { id, title, columns }
  ```
- Column (set of tasks):
  ```javascript
   { id, title, order }
  ```
- Task:
  ```javascript
  {
    id,
    title,
    order,
    description,
    userId, //assignee
    boardId,
    columnId
  }
  ```

**Details:**

1. For User, Board and Task REST endpoints with separate router paths should be created
    * `/users`
      * `GET /users` - get all users (remove password from response)
      * `GET /users/:id` - get the user by id (ex. “/users/123”) (remove password from response)
      * `POST /users` - create user
      * `PUT /users/:id` - update user
      * `DELETE /users/:id` - delete user
    * `/boards`
      * GET all
      * GET by id
      * POST
      * PUT
      * DELETE
    * `/tasks`
      * GET all by boardId
      * GET by id
      * POST
      * PUT
      * DELETE

2. When somebody DELETE Board, all its Tasks should be deleted as well.

3. When somebody DELETE User, all Tasks where User is assignee should be updated to put userId=null.

4. For now, these endpoints should operate only with in-memory (hardcoded) data, in the next tasks we will use a DB for it. You may organize your modules with the consideration that the data source will be changed soon.

5. An application/json format should be used for request and response body.

6. Do not put everything in one file - use a separate file for application creation (bootstrapping), for controllers (routers) and code related to business logic. Also split files to different modules depends on a domain (user-related, board-related, etc...).

7. To run the service “npm start” command should be used.

8. Service should listen on PORT 4000.

**Hints**

* To test the service CRUD methods you can use Swagger html (see [README.md](https://github.com/rolling-scopes-school/nodejs-course-template/blob/master/README.md#running-application)).
* To generate all entities “id”s use [uuid](https://www.npmjs.com/package/uuid) package.
