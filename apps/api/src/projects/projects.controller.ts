import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from "./dto/project.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser("id") userId: string) {
    return this.projectsService.create(dto, userId);
  }

  @Get()
  findAll(@CurrentUser("id") userId: string) {
    return this.projectsService.findAll(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.projectsService.findOne(id, userId);
  }

  @Get("slug/:slug")
  findBySlug(@Param("slug") slug: string, @CurrentUser("id") userId: string) {
    return this.projectsService.findBySlug(slug, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.projectsService.update(id, dto, userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.projectsService.remove(id, userId);
  }

  // Membres du projet
  @Post(":id/members")
  addMember(
    @Param("id") projectId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.projectsService.addMember(projectId, dto, userId);
  }

  @Patch(":id/members/:memberId")
  updateMemberRole(
    @Param("id") projectId: string,
    @Param("memberId") memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.projectsService.updateMemberRole(
      projectId,
      memberId,
      dto,
      userId,
    );
  }

  @Delete(":id/members/:memberId")
  removeMember(
    @Param("id") projectId: string,
    @Param("memberId") memberId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.projectsService.removeMember(projectId, memberId, userId);
  }
}
