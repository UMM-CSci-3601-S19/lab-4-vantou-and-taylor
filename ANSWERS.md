## Questions

1. :question: What do we do in the `Server` and `UserController` constructors
to set up our connection to the development database?
2. :question: How do we retrieve a user by ID in the `UserController.getUser(String)` method?
3. :question: How do we retrieve all the users with a given age 
in `UserController.getUsers(Map...)`? What's the role of `filterDoc` in that
method?
4. :question: What are these `Document` objects that we use in the `UserController`? 
Why and how are we using them?
5. :question: What does `UserControllerSpec.clearAndPopulateDb` do?
6. :question: What's being tested in `UserControllerSpec.getUsersWhoAre37()`?
How is that being tested?
7. :question: Follow the process for adding a new user. What role do `UserController` and 
`UserRequestHandler` play in the process?

## Your Team's Answers

1. UserController's constructor looks at the information in the mongoDatabase for users. Server's constructors setups 
the port and gives the userDatabase a name.
2. By the field name and the iterator. 
3. It uses userCollection and filterDoc to filter by age. FilterDoc is the document that's filtered with the targetAge, 
and it looks for it inside the userCollection. Then it turns it into an array with serializeIterable which is the array of 
users with targetAge returned.
4. Document is a java representation of json. We use it because mongo returns type document. We use it by setting variables
as type document when we expect a document.
5. Set ups the documents that will be used in the tests.
6. It test that when filtering by age 37 if two people are returned and that there names are Jamie and Pat.
7.UserRequestHandler says what type each key is (string, int), and UserController adds it to the newUser document.