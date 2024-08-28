import { ICommandHandler } from '@nestjs/cqrs';
import Result from 'src/Common/Application/Result';
import { CreateTodoListCommand } from 'src/TodoList/Application/UseCases/Commands/CreateTodoList/CrateTodoListCommand';

export interface CreateTodoList extends ICommandHandler<CreateTodoListCommand, Result<void>> {}