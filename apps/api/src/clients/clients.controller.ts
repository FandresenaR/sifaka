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
import { ClientsService } from "./clients.service";
import { CreateClientDto, UpdateClientDto } from "./dto/client.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() dto: CreateClientDto, @CurrentUser("id") userId: string) {
    return this.clientsService.create(dto, userId);
  }

  @Get()
  findAll(@CurrentUser("id") userId: string) {
    return this.clientsService.findAll(userId);
  }

  @Get("search")
  search(@Query("q") query: string, @CurrentUser("id") userId: string) {
    return this.clientsService.search(query || "", userId);
  }

  @Get("project/:projectId")
  findByProject(
    @Param("projectId") projectId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.clientsService.findByProject(projectId, userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.clientsService.findOne(id, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.clientsService.update(id, dto, userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.clientsService.remove(id, userId);
  }
}
