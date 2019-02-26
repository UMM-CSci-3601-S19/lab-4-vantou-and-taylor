import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Observable} from 'rxjs/Observable';
import {FormsModule} from '@angular/forms';
import {MATERIAL_COMPATIBILITY_MODE} from '@angular/material';

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
    getUsers: () => Observable<Todo[]>
  };

  beforeEach(() => {
    // stub UserService for test purposes
    todoListServiceStub = {
      getUsers: () => Observable.of([
        {
          id: 'chris_id',
          owner: 'Chris',
          status: true,
          body: 'UMM',
          category: 'chris@this.that'
        },
        {
          id: 'pat_id',
          owner: 'Jamie',
          status: true,
          body: 'IBM',
          category: 'pat@something.com'
        },
        {
          id: 'jamie_id',
          owner: 'Jamie',
          status: false,
          body: 'Frogs, Inc.',
          category: 'jamie@frogs.com'
        }
      ])
    };

    TestBed.configureTestingModule({
      imports: [CustomModule],
      declarations: [TodoListComponent],
      // providers:    [ UserListService ]  // NO! Don't provide the real service!
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

  it('contains all the users', () => {
    expect(todoList.todos.length).toBe(3);
  });

  it('contains a todo with an owner named \'Chris\'', () => {
    expect(todoList.todos.some((todo: Todo) => todo.owner === 'Chris')).toBe(true);
  });

  it('contain a todo with an owner named \'Jamie\'', () => {
    expect(todoList.todos.some((todo: Todo) => todo.owner === 'Jamie')).toBe(true);
  });

  it('doesn\'t contain a todo with an owner named \'Santa\'', () => {
    expect(todoList.todos.some((todo: Todo) => todo.owner === 'Santa')).toBe(false);
  });

  it('user list filters by owner', () => {
    expect(todoList.filteredUsers.length).toBe(3);
    todoList.todoOwner = 'Chris';
    const a: Observable<Todo[]> = todoList.refreshUsers();
    a.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredUsers.length).toBe(1));
  });

  it('todo list filters by status', () => {
    expect(todoList.filteredUsers.length).toBe(3);
    todoList.todoStatus = "false";
    const a: Observable<Todo[]> = todoList.refreshUsers();
    a.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredUsers.length).toBe(1));
  });

  it('todo list filters by owner and id', () => {
    expect(todoList.filteredUsers.length).toBe(3);
   // todoList.todoBody  = 'Frogs, Inc.';
    todoList.todoOwner = 'Jamie';
    todoList.todoID = 'jamie_id';

    const a: Observable<Todo[]> = todoList.refreshUsers();
    a.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredUsers.length).toBe(1));
  });

  it('todo list filters by name and id and status', () => {
    expect(todoList.filteredUsers.length).toBe(3);
    todoList.todoOwner = 'Jamie';
    todoList.todoID = 'jamie_id';
    todoList.todoStatus = 'false';

    const a: Observable<Todo[]> = todoList.refreshUsers();
    a.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredUsers.length).toBe(1));
  });

  it('todo list filters by name and id and status', () => {
    expect(todoList.filteredUsers.length).toBe(3);
    todoList.todoOwner = 'Jamie';
    todoList.todoBody = 'IBM';

    const a: Observable<Todo[]> = todoList.refreshUsers();
    a.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredUsers.length).toBe(1));
  });

  it('todo list filters by name and category', () => {
    expect(todoList.filteredUsers.length).toBe(3);
    todoList.todoOwner = 'Jamie';
    todoList.todoCategory = 'jamie@frogs.com';

    const a: Observable<Todo[]> = todoList.refreshUsers();
    a.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredUsers.length).toBe(1));
  });

});

describe('Misbehaving Todo List', () => {
  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  let todoListServiceStub: {
    getUsers: () => Observable<Todo[]>
  };

  beforeEach(() => {
    // stub UserService for test purposes
    todoListServiceStub = {
      getUsers: () => Observable.create(observer => {
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
    // Since the observer throws an error, we don't expect users to be defined.
    expect(todoList.todos).toBeUndefined();
  });
});
