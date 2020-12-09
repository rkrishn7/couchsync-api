## Ryan Jacobs

I created the controller and service class unit tests in this repo. They can be found under /src/lib/services/test, /src/lib/controllers/test, and /src/lib/utils/users/test.

There are service class tests for parties, users, and messages. The party service tests cover when a user creates a party, gets a party's details, and updates a party's details. I made sure to cover cases where a specified party does not exist. It was important that our backend failed gracefully and didn't crash. I was able to use any invalid party id to illicit an error. The user service tests cover when a user is created, deactivated, joins a party, and when a user's data is changed. I made sure to cover cases where a user did not exist in our database or a party did not exist in our database. I was able to use any invalid party id or user id to illicit an error. The message service tests cover when a message is created. Just as in the user test cases, made sure to cover cases where a user did not exist in our database or a party did not exist in our database. Again, I was able to use any invalid party id or user id to illicit an error.

There are controller class tests for parties and users. The party controller tests cover when a party is created and when a user requests party information. I used SuperTest to mock API calls to our server. I also covered cases when a party could not be found. When an party does not exist a 422 error response is returned. I simply did not create a party for these tests. When a response has an invalid party id a 500 error response is returned. I input an arbitrary party hash to get this error to happen as the party hash needs to exactly match the one in our database. The user controller tests cover when a user uploads new information, like a new name or avatar. I created a lot of test cases to cover error events. I have a test for when the user enters an invalid name. In this case, anything other than a string will result in an error. I have a test for when the user enters and invalid avatar URL. The URL needs to be a string so any other datatype will return an error. I have tests for when the user id or party hash are invalid. I simply did not create a new user or party and any value entered would illicit an error.

There are two small tests inside of the /src/lib/utils/users/test/index.spec.ts file. I created these tests to verify that new usernames and avatars were being created correctly. There aren't exactly any errors I need to test for as these functions do not throw errors. Consequently, there was only a single equivalence class for each function I was testing.

## Rohan Krishnaswamy

I implemented AVA (our unit testing framework) and created global fixtures used to run all test suites. Additionally, I implemented the continuous integration/continuous delivery pipelines across both projects.

One **very important** thing to note with AVA:

- AVA runs each test in a separate process, which is amazing for performance. Additionally each test is run concurrently within its process.

Thus, creating a global fixture for our testing framework wasn't so trivial. Given that we want each test to be independent of each other, we can't rely on an environment that might be read or written to in parallel. To enforce that each test gets a clean environment to operate on, each test receives a unique database instance to work with.

The first thing to do when running tests is to initialize a connection pool. Each test acquires a connection from the pool, creates a new database identified by a UUID, and runs the migrations found in `src/database/migrations`. AVA uses `context` to share state between tests, so in our `beforeEach` hooks, we grant the test access to our services and application, both of which require a database connection.

As clean up after each test, we release the connection back to the pool, and after all tests, we free up the resources held by the connection pool.

Here's a comprehensive analysis of our tests' code coverage:

yarn run v1.22.4
\$ /Users/rohank/Documents/Rohan/Projects/couchsync-api/node_modules/.bin/nyc report --reporter=text

---------------------------------------|---------|----------|---------|---------|-------------------
File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------------------------|---------|----------|---------|---------|-------------------
All files | 83.43 | 36.62 | 77.6 | 84.36 |  
 src | 73.33 | 100 | 60 | 75 |  
 app.ts | 73.33 | 100 | 60 | 75 | 22-34  
 src/database/migrations | 89.19 | 100 | 69.23 | 89.19 |  
 ...025055413-create-parties-table.js | 88.89 | 100 | 66.67 | 88.89 | 32  
 ...27060205-create-messages-table.js | 88.89 | 100 | 66.67 | 88.89 | 32  
 20201027203707-create-users-table.js | 90 | 100 | 75 | 90 | 43  
 ...5636-remove-parties-attributes.js | 88.89 | 100 | 66.67 | 88.89 | 30  
 src/database/pool | 84.62 | 40 | 100 | 84.62 |  
 index.ts | 84.62 | 40 | 100 | 84.62 | 23,29  
 src/lib/constants | 100 | 100 | 100 | 100 |  
 regex.ts | 100 | 100 | 100 | 100 |  
 src/lib/controllers | 100 | 100 | 100 | 100 |  
 index.ts | 100 | 100 | 100 | 100 |  
 party.ts | 100 | 100 | 100 | 100 |  
 user.ts | 100 | 100 | 100 | 100 |  
 src/lib/controllers/test | 100 | 100 | 100 | 100 |  
 party.spec.ts | 100 | 100 | 100 | 100 |  
 user.spec.ts | 100 | 100 | 100 | 100 |  
 src/lib/errors | 100 | 100 | 100 | 100 |  
 service-error.ts | 100 | 100 | 100 | 100 |  
 src/lib/services | 90.41 | 41.67 | 100 | 90 |  
 index.ts | 100 | 100 | 100 | 100 |  
 messages.ts | 100 | 100 | 100 | 100 |  
 party.ts | 100 | 100 | 100 | 100 |  
 service.ts | 100 | 100 | 100 | 100 |  
 users.ts | 82.05 | 30 | 100 | 81.58 | 113-148,190  
 src/lib/services/test | 90.99 | 0 | 96.3 | 90.99 |  
 messages.spec.ts | 100 | 100 | 100 | 100 |  
 party.spec.ts | 100 | 100 | 100 | 100 |  
 user.spec.ts | 79.59 | 0 | 92.86 | 79.59 | 57-82  
 src/lib/settings | 100 | 100 | 100 | 100 |  
 index.ts | 100 | 100 | 100 | 100 |  
 src/lib/socket | 35.85 | 16.67 | 13.33 | 36.54 |  
 events.ts | 100 | 100 | 100 | 100 |  
 server.ts | 17.07 | 0 | 7.14 | 17.5 | 35-153  
 src/lib/test/fixtures | 94.29 | 50 | 100 | 97.06 |  
 global.ts | 94.29 | 50 | 100 | 97.06 | 53  
 src/lib/utils/database | 100 | 100 | 100 | 100 |  
 query.ts | 100 | 100 | 100 | 100 |  
 transaction.ts | 100 | 100 | 100 | 100 |  
 src/lib/utils/middleware | 43.24 | 36.84 | 27.27 | 48.48 |  
 database.ts | 15 | 0 | 0 | 17.65 | 6-40  
 error.ts | 100 | 100 | 100 | 100 |  
 socket-server.ts | 20 | 0 | 0 | 25 | 4-6  
 validate.ts | 100 | 100 | 100 | 100 |  
 src/lib/utils/users | 100 | 100 | 100 | 100 |  
 index.ts | 100 | 100 | 100 | 100 |  
 src/lib/utils/users/test | 100 | 100 | 100 | 100 |  
 index.spec.ts | 100 | 100 | 100 | 100 |  
---------------------------------------|---------|----------|---------|---------|-------------------
Done in 0.31s.
