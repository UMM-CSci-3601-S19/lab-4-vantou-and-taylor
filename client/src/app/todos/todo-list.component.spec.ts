import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Observable} from 'rxjs/Observable';
import {FormsModule} from '@angular/forms';
import {MATERIAL_COMPATIBILITY_MODE} from '@angular/material';
import {MatDialog} from '@angular/material';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';

import {CustomModule} from '../custom.module';

import {Todo} from './todo';
import {TodoListComponent} from './todo-list.component';
import {TodoListService} from './todo-list.service';

describe('Todo list', () => {

  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  let todoListServiceStub: {
    getTodos: () => Observable<Todo[]>
  };

  beforeEach(() => {
    // stub TodoService for test purposes
    todoListServiceStub = {
      getTodos: () => Observable.of([
        {
          _id: 'blanche_id',
          owner: 'Blanche',
          status: false,
          body: 'In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.',
          category: 'software design'
        },
        {
          _id: 'fry_id',
          owner: 'Fry',
          status: false,
          body: 'Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.',
          category: 'video games'
        },
        {
          _id: 'dawn_id',
          owner: 'Dawn',
          status: true,
          body: 'Magna exercitation pariatur in labore. Voluptate adipisicing reprehenderit dolor veniam dolore amet duis anim nisi.',
          category: 'homework'
        }])
    };

    TestBed.configureTestingModule({
      imports: [CustomModule],
      declarations: [TodoListComponent],
      // providers:    [ TodoListService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{provide: TodoListService, useValue: todoListServiceStub},
        {provide: MATERIAL_COMPATIBILITY_MODE, useValue: true}]

    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('contains all the todos', () => {
    expect(todoList.todos.length).toBe(3);
  });

  it('contains a todo owned by \'Dawn\'', () => {
    expect(todoList.todos.some((todo: Todo) => todo.owner === 'Dawn')).toBe(true);
  });

  it('contain a todo owned by \'Fry\'', () => {
    expect(todoList.todos.some((todo: Todo) => todo.owner === 'Fry')).toBe(true);
  });

  it('doesn\'t contain a todo owned by \'Santa\'', () => {
    expect(todoList.todos.some((todo: Todo) => todo.owner === 'Santa')).toBe(false);
  });

  it('has one todos in the homework category', () => {
    expect(todoList.todos.filter((todo: Todo) => todo.category === 'homework').length).toBe(1);
  });
  it('todo list filters by owner', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoOwner = 'n';
    const a: Observable<Todo[]> = todoList.refreshTodos();
    a.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredTodos.length).toBe(2));
  });

  it('todo list filters by status', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoStatus = 'complete';
    const a: Observable<Todo[]> = todoList.refreshTodos();
    a.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredTodos.length).toBe(1));
    todoList.todoStatus = 'incomplete';
    const b: Observable<Todo[]> = todoList.refreshTodos();
    b.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredTodos.length).toBe(2));
  });


  it('todo list filters by category', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoCategory = 'software design';
    const a: Observable<Todo[]> = todoList.refreshTodos();
    a.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredTodos.length).toBe(1));
  });

  it('todo list filters by category and owner', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoCategory = 'video games';
    todoList.todoOwner = 'Fry';
    const a: Observable<Todo[]> = todoList.refreshTodos();
    a.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredTodos.length).toBe(1));
  });

});

describe('Misbehaving Todo List', () => {
  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  let todoListServiceStub: {
    getTodos: () => Observable<Todo[]>
  };

  beforeEach(() => {
    // stub TodoService for test purposes
    todoListServiceStub = {
      getTodos: () => Observable.create(observer => {
        observer.error('Error-prone observable');
      })
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, CustomModule],
      declarations: [TodoListComponent],
      providers: [{provide: TodoListService, useValue: todoListServiceStub},
        {provide: MATERIAL_COMPATIBILITY_MODE, useValue: true}]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('generates an error if we don\'t set up a TodoListService', () => {
    // Since the observer throws an error, we don't expect todos to be defined.
    expect(todoList.todos).toBeUndefined();
  });
});

describe('Adding a todo', () => {
  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  const newTodo: Todo = {
    _id: '',
    owner: 'Van',
    status: true,
    body: "In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.",
    category: 'Tech Guy'
  };
  const newId = 'van_id';

  let calledTodo: Todo;

  let todoListServiceStub: {
    getTodos: () => Observable<Todo[]>,
    addNewTodo: (newTodo: Todo) => Observable<{ '$oid': string }>
  };
  let mockMatDialog: {
    open: (AddTodoComponent, any) => {
      afterClosed: () => Observable<Todo>
    };
  };

  beforeEach(() => {
    calledTodo = null;
    // stub TodoService for test purposes
    todoListServiceStub = {
      getTodos: () => Observable.of([]),
      addNewTodo: (newTodo: Todo) => {
        calledTodo = newTodo;
        return Observable.of({
          '$oid': newId
        });
      }
    };
    mockMatDialog = {
      open: () => {
        return {
          afterClosed: () => {
            return Observable.of(newTodo);
          }
        };
      }
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, CustomModule],
      declarations: [TodoListComponent],
      providers: [
        {provide: TodoListService, useValue: todoListServiceStub},
        {provide: MatDialog, useValue: mockMatDialog},
        {provide: MATERIAL_COMPATIBILITY_MODE, useValue: true}]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('calls TodoListService.addTodo', () => {
    expect(calledTodo).toBeNull();
    todoList.openDialog();
    expect(calledTodo).toEqual(newTodo);
  });
});
