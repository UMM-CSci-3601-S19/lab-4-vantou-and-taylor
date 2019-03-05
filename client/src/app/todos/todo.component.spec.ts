import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {Todo} from './todo';
import {TodoComponent} from './todo.component';
import {TodoListService} from './todo-list.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {CustomModule} from "../custom.module";

describe('Todo component', () => {

  let todoComponent: TodoComponent;
  let fixture: ComponentFixture<TodoComponent>;

  let todoListServiceStub: {
    getTodoById: (todoId: string) => Observable<Todo>
  };

  beforeEach(() => {
    // stub TodoService for test purposes
    todoListServiceStub = {
      getTodoById: (todoId: string) => Observable.of([
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
      ].find(todo => todo._id === todoId))
    };

    TestBed.configureTestingModule({
      imports: [CustomModule],
      declarations: [TodoComponent],
      providers: [{provide: TodoListService, useValue: todoListServiceStub}]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoComponent);
      todoComponent = fixture.componentInstance;
    });
  }));

  it('can retrieve snake by ID', () => {
    todoComponent.setId('snake_id');
    expect(todoComponent.todo).toBeDefined();
    expect(todoComponent.todo.owner).toBe('Snake');
    expect(todoComponent.todo.category).toBe('Warrior');
  });

  it('returns undefined for Santa', () => {
    todoComponent.setId('Santa');
    expect(todoComponent.todo).not.toBeDefined();
  });

});
