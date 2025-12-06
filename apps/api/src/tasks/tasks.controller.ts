import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import {
  CreateTaskDto,
  UpdateTaskDto,
  ReorderTasksDto,
  CreateCommentDto,
  UpdateCommentDto,
} from "./dto/task.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser("id") userId: string) {
    return this.tasksService.create(dto, userId);
  }

  @Get("my")
  findMyTasks(@CurrentUser("id") userId: string) {
    return this.tasksService.findMyTasks(userId);
  }

  @Get("project/:projectId")
  findByProject(
    @Param("projectId") projectId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.tasksService.findByProject(projectId, userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.tasksService.findOne(id, userId);
  }

  @Patch("reorder")
  reorder(@Body() dto: ReorderTasksDto, @CurrentUser("id") userId: string) {
    return this.tasksService.reorder(dto, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.tasksService.update(id, dto, userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.tasksService.remove(id, userId);
  }

  // Commentaires
  @Post(":id/comments")
  addComment(
    @Param("id") taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.tasksService.addComment(taskId, dto, userId);
  }

  @Patch("comments/:commentId")
  updateComment(
    @Param("commentId") commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.tasksService.updateComment(commentId, dto, userId);
  }

  @Delete("comments/:commentId")
  removeComment(
    @Param("commentId") commentId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.tasksService.removeComment(commentId, userId);
  }
}
