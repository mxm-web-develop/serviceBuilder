import { Inject, Injectable } from '@nestjs/common';
import { red, yellow } from 'chalk';
import {
  readFileSync,
  existsSync,
  stat,
  mkdtempSync,
  statSync,
  mkdirSync,
  writeFileSync,
} from 'fs';
import { ToolsService } from '../tools/tools.service';
import { isArray } from 'lodash';
import basetemplate from './base.tempelete';
interface EnvType {
  url: string;
  timeout: number;
}
interface FindOrCreateModuleOptions {
  useDoc?: boolean;
  useType?: boolean;
}
interface ConfigType {
  version: string;
  folderName?: string;
  description?: string;
  dev: EnvType;
  test: EnvType;
  production: EnvType;
  modules: any[];
}
const configName = '/mxmservice.config.json';
@Injectable()
export class ServiceModuleBuilderService {
  /**
   * 新的config.json, 用户项目的根目录，名字需要是mxmservice.config.json'
   */
  _config_input;
  /**
   * /service/config.json, 从mxmservice.config.json 转换得到的，放置在用户目录的/src/service/config.json
   */
  _config;
  _version;
  _version_input;
  folderName;
  root;
  projectRoot: string;
  constructor(@Inject(ToolsService) private toolsService: ToolsService) {
    this.root = process.cwd()
    //this.toolsService.findRoot();
    try {
      this.init();
    } catch (err) {
      console.log(red(err));
    }
  }

  init() {
    const isExist = existsSync(this.root + configName);
    if (isExist) {
      this._config_input = JSON.parse(
        readFileSync(this.root + configName).toString(),
      );
      this._version_input = this._config_input.version;
      this.folderName = this._config_input.folderName
        ? this._config_input.folderName
        : 'service';
      this.projectRoot = this.root + '/src/' + this.folderName;
      return true;
    } else {
      `没有找到配置文件，请添加${configName}至根目录`;
      return false;
    }
  }

  readConfig(config: any): ConfigType {
    return;
  }

  createAndUpdatedConfig() {
    const data = existsSync(this.root + '/src/' + this.folderName);
    if (data) {
      if (existsSync(this.root + '/src/' + this.folderName + '/config.json')) {
        this._config = JSON.parse(
          readFileSync(
            this.root + '/src/' + this.folderName + '/config.json',
          ).toString(),
        );
        this._version = this._config.version;
        if (this._version !== this._version_input) {
          console.log(yellow('版本更新'));
          writeFileSync(
            this.root + '/src/' + this.folderName + '/config.json',
            JSON.stringify(this._config_input),
          );
          return true;
        } else {
          console.log(red('配置版本未修改,将不会更新service的配置文件'));
          return false;
        }
      } else {
        console.log(yellow('没有找到config.json,已经创建模块'));
        writeFileSync(
          this.root + '/src/' + this.folderName + '/config.json',
          JSON.stringify(this._config_input),
        );
        return true;
      }
    } else {
      mkdirSync(this.root + '/src/' + this.folderName);
      writeFileSync(
        this.root + '/src/' + this.folderName + '/config.json',
        JSON.stringify(this._config_input),
      );
      return true;
    }
  }

  moveTemplateToProject() {
    writeFileSync(
      this.root + '/src/' + this.folderName + '/base.ts',
      basetemplate,
    );
  }
  
  private insertType = (
    useType: boolean,
    name: string,
    res: any,
    response?: boolean,
  ) => {
    if (useType && this.toolsService.isObjAble(res ? res : {})) {
      return this.InterFaceNameConstructor(name, response);
    }
    return 'any';
  };
  private findOrCreateModule(
    moduleName: string,
    path: string,
    apis: any[],
    options?: { useDoc?: boolean; useType?: boolean },
  ) {
    this.toolsService.mkdirp(path + '/' + moduleName);
    const moduleIndex = this.moduleTemplate(moduleName, apis, options);
    try {
      writeFileSync(path + '/' + moduleName + '/index.ts', moduleIndex);
    } catch (err) {
      throw new Error(err);
    }
  }

  private buildDoc = (api: any, useType: boolean) => {
    return '';
  };

  private buildMethods = (apis: any[], options: FindOrCreateModuleOptions) => {
    const { useDoc, useType } = options;
    const arr = Object.entries(apis);
    let output = ``;
    arr.forEach((k) => {
      output += `
      ${useDoc ? this.buildDoc(k, useType) : ''}
      async ${k[0]}(paylaod?:{data?:${this.insertType(
        useType,
        k[0],
        k[1].request,
      )},params?:${
        k[1].useParams ? this.insertType(useType, k[0], k[1].request) : 'any'
      },mock?:${this.insertType(useType, k[0], k[1].request)}}) {
          return await this.apiTransport<${this.insertType(
            useType,
            k[0],
            k[1].response,
            true,
          )}>(config.${k[0]},  {  data:paylaod?.data?paylaod?.data:{},  params:paylaod?.params?paylaod?.params:{}, mock:paylaod?.mock})
      };
      `;
    });
    return output;
  };
  private buildConfig = (apis: any[]) => {
    const arr = Object.entries(apis);
    let output = {};
    arr.forEach((k) => {
      output[k[0]] = k[1];
    });
    return output;
  };
  private InterFaceNameConstructor = (apiName: string, response?: boolean) => {
    if (response) {
      return apiName.toUpperCase() + '_RESPONSE';
    } else {
      return apiName.toUpperCase() + '_REQUEST';
    }
  };
  private genType = (arr:any)=>{
    let ouput =``
    Object.entries(arr).forEach((item) => {
      ouput += `
      ${item[0]}${(item[1] as string).endsWith('!')?"":"?"}:${(item[1] as string).endsWith('!')?`${(item[1] as string).slice(0,-1)}`:`${item[1]}`};
      `
    })
    return ouput;
  }
  private buildTypesInterface = (apis: any) => {
    const arr = Object.entries(apis);
    let output = ``;
    arr.forEach((k) => {
      if(k[1]['request'] || k[1]['response']){
        if(k[1]['response']){
          output += `
interface ${(k[0] as string).toUpperCase()}_RESPONSE {
    ${this.genType(k[1]['response'])}
}
          `
        }
        if(k[1]['request']){
          output += `
interface ${(k[0] as string).toUpperCase()}_REQUEST {
  ${this.genType(k[1]['request'])}
}
          `
        }
      }
    })
    return output;
  };

  private moduleTemplate = (
    modlueName: string,
    apis: any[],
    options?: FindOrCreateModuleOptions,
  ) => {
    const { useDoc, useType } = options;
    return `
  import MxMService from '../base';
  const config = ${JSON.stringify(this.buildConfig(apis))}
  ${useType && this.buildTypesInterface(apis)}
  class ${this.toolsService.capitalize(modlueName)} extends MxMService {
    constructor() {
      super()
    }
    ${this.buildMethods(apis, options)}
  }
  
  export default ${this.toolsService.capitalize(modlueName)}
  `;
  };
  buildFliesBaseOnConfig(options: { useDoc?: boolean; useType?: boolean }) {
    const { useDoc = false, useType = false } = options;
    const settingFile = existsSync(
      this.root + '/src/' + this.folderName + '/config.json',
    );
    const projectRoot = this.root + '/src/' + this.folderName;
    if (settingFile) {
      isArray(this._config_input.modules)
        ? this._config_input.modules.forEach((element) => {
            this.findOrCreateModule(element.name, projectRoot, element.api, {
              useDoc,
              useType,
            });
          })
        : new Error('modules is not defined or not array');
    }
  }
}
