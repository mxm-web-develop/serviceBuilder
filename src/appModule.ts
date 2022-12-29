import { Module } from '@nestjs/common';
import { ServiceModuleBuilderService } from './service-module-builder/service-module-builder.service';
import { ToolsService } from './tools/tools.service';

@Module({
  // imports: [ConfigModule.forRoot(
  //   {
  //     isGlobal:true,
  //     envFilePath: ['.development.env','.production.env'],
  //   }
  // )],
  providers: [ServiceModuleBuilderService,ToolsService]
})
export class AppModule {}
