import { Injectable } from '@nestjs/common';
import {  existsSync,readdirSync,statSync,mkdirSync, writeFileSync } from 'fs';
import {join,resolve,dirname} from 'path';
@Injectable()
export class ToolsService {
    findRoot = (target?:string)=>{
        let dir = __dirname;
        while (!existsSync(join(dir, target?target:'package.json'))) {
          dir = resolve(dir, '..');
        }
        return dir;
    }

    findFiles(dir:string) {
      writeFileSync(join(dir, 'config.json'), 'new content');
    }

    arrayToObject(array) {
      const [key, value] = array;
      return { [key]: value };
    }
    isObjAble(obj){
      if (Object.keys(obj).length === 0 && obj.constructor === Object) {
          return false;
        } else {
          return true;
        }
    }
    capitalize(str) {
      return str.replace(/^\w/, c => c.toUpperCase());
    }
    mkdirp(dir:string) {
        const parent = dirname(dir);
        if (parent === dir) return; // reached root
        if (!existsSync(parent)) this.mkdirp(parent);
        if (!existsSync(dir)) mkdirSync(dir);
        return dir
      }
}
