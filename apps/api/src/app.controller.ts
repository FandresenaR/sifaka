import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): { message: string; version: string } {
    return this.appService.getApiInfo();
  }

  @Get("health")
  async healthCheck() {
    return this.appService.healthCheck();
  }
}
