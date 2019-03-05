import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';

import {Todo} from './todo';
import {TodoListService} from './todo-list.service';

describe('Todo list service: ', () => {
  // A small collection of test todos
  const testTodos: Todo[] = [
    {
      _id: "snake_id",
      owner: "Snake",
      status: false,
      body: "In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.",
      category: "Warrior"
    },
    {
      _id: "ryu_id",
      owner: "Ryu",
      status: true,
      body: "Cupidatat ex Lorem aute laboris mollit minim minim velit laborum ad culpa consectetur enim ut. Pariatur ad elit in est aliqua.",
      category: "Street Fighter"
    },
    {
      _id: "pacman_id",
      owner: "PacMan",
      status: true,
      body: "Ex culpa proident esse cupidatat sunt est sit. Reprehenderit Lorem quis nostrud amet commodo eiusmod id.",
      category: "Maze Runner"
    }
  ];
  const mTodos: Todo[] = testTodos.filter(todo =>
    todo.body.toLowerCase().indexOf('m') !== -1
  );

  // We will need some url information from the todoListService to meaningfully test body filtering;
  // https://stackoverflow.com/questions/35987055/how-to-write-unit-testing-for-angular-2-typescript-for-private-methods-with-ja
  let todoListService: TodoListService;
  let currentlyImpossibleToGenerateSearchTodoUrl: string;

  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    todoListService = new TodoListService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getTodos()(getTodos) calls api/todos', () => {
    // Assert that the todos we get from this call to getTodos()
    // should be our set of test todos. Because we're subscribing
    // to the result of getTodos(), this won't actually get
    // checked until the mocked HTTP request "returns" a response.
    // This happens when we call req.flush(testTodos) a few lines
    // down.
    todoListService.getTodos().subscribe( //While .getTodos() is labelled the way it is, it still gets Todos.
      todos => expect(todos).toBe(testTodos)
    );

    // Specify that (exactly) one request will be made to the specified URL.
    const req = httpTestingController.expectOne(todoListService.baseUrl);
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');
    // Specify the content of the response to that request. This
    // triggers the subscribe above, which leads to that check
    // actually being performed.
    req.flush(testTodos);
  });

  it('getTodoById()(getTodoByID()) calls api/todo/id', () => {
    const targetTodo: Todo = testTodos[1];
    const targetId: string = targetTodo._id;
    todoListService.getTodoById(targetId).subscribe(
      todo => expect(todo).toBe(targetTodo)
    );

    const expectedUrl: string = todoListService.baseUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetTodo);
  });


  it('getTodos(todoBody) adds appropriate param string to called URL', () => {
    todoListService.getTodos('m').subscribe(
      todos => expect(todos).toEqual(mTodos)
    );

    const req = httpTestingController.expectOne(todoListService.baseUrl + '?body=m&');
    expect(req.request.method).toEqual('GET');
    req.flush(mTodos);
  });

  it('filterByBody(todoBody) deals appropriately with a URL that already had a body', () => {
    currentlyImpossibleToGenerateSearchTodoUrl = todoListService.baseUrl + '?body=f&something=k&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchTodoUrl;
    todoListService.filterByBody('m');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '?something=k&body=m&');
  });

  it('filterByBody(todoBody) deals appropriately with a URL that already had some filtering, but no body', () => {
    currentlyImpossibleToGenerateSearchTodoUrl = todoListService.baseUrl + '?something=k&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchTodoUrl;
    todoListService.filterByBody('m');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '?something=k&body=m&');
  });

  it('filterByBody(todoBody) deals appropriately with a URL has the keyword body, but nothing after the =', () => {
    currentlyImpossibleToGenerateSearchTodoUrl = todoListService.baseUrl + '?body=&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchTodoUrl;
    todoListService.filterByBody('');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '');
  });
});
