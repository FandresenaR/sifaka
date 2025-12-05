import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./auth/decorators/public.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getRoot(): { message: string; version: string } {
    return this.appService.getApiInfo();
  }

  @Public()
  @Get("health")
  async healthCheck() {
    return this.appService.healthCheck();
  }
}
