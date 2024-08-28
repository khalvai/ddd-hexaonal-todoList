import { NotFoundException } from '@nestjs/common';
import { TodoResponseMessages } from 'ResponseMessages/todo.response.messages';
import Result from 'src/Common/Application/Result';
import AggregateRoot from 'src/Common/Domain/AggregateRoot';
import ValueObject from 'src/Common/Domain/ValueObject';
import { Description } from 'src/TodoList/Domain/Item/Description';
import { Item } from 'src/TodoList/Domain/Item/Item';
import { ItemId } from 'src/TodoList/Domain/Item/ItemId';
import { Priority } from 'src/TodoList/Domain/Item/Priority';
import { ItemRemoved } from 'src/TodoList/Domain/TodoList/Events/ItemRemoved';
import { ItemUpdated } from 'src/TodoList/Domain/TodoList/Events/ItemUpdated';
import { NewItemAdded } from 'src/TodoList/Domain/TodoList/Events/NewItemAdded';
import { TodoListCreated } from 'src/TodoList/Domain/TodoList/Events/TodoListCreated';
import { TodoListDeleted } from 'src/TodoList/Domain/TodoList/Events/TodoListDeleted';
import { Title } from 'src/TodoList/Domain/TodoList/ValueObjects/Title';
import { TodoListId } from 'src/TodoList/Domain/TodoList/ValueObjects/TodoListId';
import { UserId } from 'src/TodoList/Domain/TodoList/ValueObjects/UseId';
interface UpdateItemPayload {
  itemId: ItemId;
  title?: Title;
  description?: Description;
  priority?: Priority;
}
export class TodoList extends AggregateRoot {
  public id: TodoListId;
  public title: Title;
  public userId: UserId;
  public items: Item[];
  public createdAt: Date;
  public updatedAt: Date;
  static create(title: Title, userId: UserId): Result<TodoList> {
    // creating business logic goes here
    const todoList = new TodoList();
    todoList.id = TodoListId.create();
    todoList.title = title;
    todoList.userId = userId;
    const event = TodoListCreated.of(todoList);
    todoList.addEvent(event);
    return { ok: true, value: todoList };
  }

  delete(todoListId: TodoListId): void {
    const event = TodoListDeleted.of(this);
    this.addEvent(event);
  }
  addItem(title: Title, description: Description, priority: Priority): void {
    // aggregate entry point for manipulating the entire aggregate
    const item = Item.create(title, description, priority);

    this.items.push(item);

    const event = NewItemAdded.of(item);

    this.addEvent(event);
  }

  removeItem(itemId: ItemId): Result<void> {
    const item = this.items.find(i => i.id === itemId);
    if (!item) {
      return {
        ok: false,
        error: new NotFoundException(TodoResponseMessages.TODO_ITEM_NOT_FOUND),
      };
    }

    const event = ItemRemoved.of(item.id);

    this.addEvent(event);

    return {
      ok: true,
      value: undefined,
    };
  }

  updateItem(payload: UpdateItemPayload): Result<void> {
    const item = this.items.find(i => i.id === payload.itemId);

    if (!item) {
      return {
        ok: false,
        error: new NotFoundException(TodoResponseMessages.TODO_ITEM_NOT_FOUND),
      };
    }

    item.update(payload);

    const event = ItemUpdated.of(item);

    this.addEvent(event);

    return {
      ok: true,
      value: undefined,
    };
  }
}