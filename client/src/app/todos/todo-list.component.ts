import {Component, OnInit} from '@angular/core';

import {TodoListService} from './todo-list.service';
import {Todo} from './todo';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-todo-list-component',
  templateUrl: 'todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  providers: []
})

export class TodoListComponent implements OnInit {
  // These are public so that tests can reference them (.spec.ts)
  public todos: Todo[];
  public filteredUsers: Todo[];

  public todoOwner: string;
  public todoBody: string;
  public todoStatus: string;
  public todoID: string;
  public todoCategory: string;



  // Inject the UserListService into this component.
  // That's what happens in the following constructor.
  //
  // We can call upon the service for interacting
  // with the server.

  constructor(private todoListService: TodoListService) {

  }

  public filterUsers(searchOwner: string,
                     searchBody: string,
                     searchStatus: string,
                     searchID: string,
                     searchCategory: string
  )
  : Todo[] {

    this.filteredUsers = this.todos;

    // Filter by owner
    if (searchOwner != null) {
      searchOwner = searchOwner.toLocaleLowerCase();

      this.filteredUsers = this.filteredUsers.filter(todo => {
        return !searchOwner || todo.owner.toLowerCase().indexOf(searchOwner) !== -1;
      });
    }

    // Filter by body
    if (searchBody != null) {
      searchBody = searchBody.toLocaleLowerCase();

      this.filteredUsers = this.filteredUsers.filter(todo => {
        return !searchBody || todo.body.toLowerCase().indexOf(searchBody) !== -1;
      });


    }
    if (searchCategory != null) {
      searchCategory = searchCategory.toLocaleLowerCase();

      this.filteredUsers = this.filteredUsers.filter(todo => {
        return !searchCategory || todo.category.toLowerCase().indexOf(searchCategory) !== -1;
      });


    }
    // Filter by status
    if (searchStatus != null) {
      if(searchStatus.toLocaleLowerCase() == "true" || "false") {
        var searchStatusStatus = searchStatus == "true";
        this.filteredUsers = this.filteredUsers.filter((todo: Todo) => {
          return !searchStatus || todo.status == searchStatusStatus;
        });
      }

    }
    // Filter by ID
    if (searchID != null) {
      this.filteredUsers = this.filteredUsers.filter((todo: Todo) => {
        return !searchID || todo.id.toLowerCase().indexOf(searchID) !== -1;
      });
    }

    return this.filteredUsers;
  }

  /**
   * Starts an asynchronous operation to update the users list
   *
   */
  refreshUsers(): Observable<Todo[]> {
    // Get Users returns an Observable, basically a "promise" that
    // we will get the data from the server.
    //
    // Subscribe waits until the data is fully downloaded, then
    // performs an action on it (the first lambda)

    const todos: Observable<Todo[]> = this.todoListService.getUsers();
    todos.subscribe(
      returnedTodos => {
        this.todos = returnedTodos;
        this.filterUsers(this.todoOwner, this.todoBody, this.todoStatus, this.todoID, this.todoCategory);
      },
      err => {
        console.log(err);
      });
    return todos;
  }



  ngOnInit(): void {
    this.refreshUsers();
  }


}
