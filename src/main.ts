#!/usr/bin/env node
"use strict";

import { NestFactory } from '@nestjs/core';
import { AppModule } from './appModule';
import {Command} from 'commander'
import { ServiceModuleBuilderService } from './service-module-builder/service-module-builder.service';
async function bootstrap() {
  const program = new Command()
  program.command('complie',{isDefault:true})
  .description('服务模块自动建构脚手架')
  .version('v.1.0.0')
  .option('-js, --javascript','导出js模版')
  .option('-d, --document','导出注释')
  .action(async(str, options) =>{
    console.log(str.javascript,options.name());
    const app = await NestFactory.createApplicationContext(AppModule);
    const builder = app.get(ServiceModuleBuilderService)
    const step1= builder.createAndUpdatedConfig()
    if(step1){
      builder.buildFliesBaseOnConfig({useDoc:true,useType:true});
      builder.moveTemplateToProject()
    }
    app.close()
  }).parse();
}
bootstrap();
