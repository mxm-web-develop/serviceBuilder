export default `
import c from './config.json'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import MockAdopter from 'axios-mock-adapter'
type Env = 'dev' | 'production' | 'test'
interface Payload {
  data?: any
  params?: any
  mock?: any
}
export type ConfigType = {
    url: string
    method: string
    headers?: {
      [key: string]: any
    }
    timeout?: number
    responseType?: 'arraybuffer' | 'document' | 'json' | 'text' | 'stream' // default
    responseEncoding?: string // default
}
class MxMService {
    service: AxiosInstance
    env: Env
    baseUrl: string
    mock: MockAdopter | undefined
    apiTransport: <R>(config: ConfigType, payload: Payload) => Promise<AxiosResponse<R>>
    config: any
    constructor() {
      this.config = JSON.parse(c as any)
      this.baseUrl = this.getConfigByEnv().url
      this.env = this.config['runEnvironment']
      this.service = this.initService()
      this.mock =
      this.env === 'dev' ? new MockAdopter(this.service, { delayResponse: 500 }) : undefined
  
      this.apiTransport = <D, P, M, R>(
        config: ConfigType,
        payload: Payload
      ): Promise<AxiosResponse<R, D>> => {
        if (this.mock) {
          const res = payload.mock
          switch (config.method) {
            case 'get':
              this.mock
                .onGet(config.url, { params: payload.params ? payload.params : {} })
                .reply(res ? 200 : 404, res ? res : null)
              break
            case 'post':
              this.mock
                .onPost(config.url, {
                  params: payload.params ? payload.params : {},
                  data: payload.data
                })
                .reply(res ? 200 : 404, res ? res : null)
                break;
            case 'delete':
                this.mock.onDelete(config.url, {
                  params: payload.params ? payload.params : {},
                  data: payload.data
                })  .reply(res ? 200 : 404, res ? res : null)
                break;
          }
        }     
        return this.service.request({
          url: config.url,
          method: config.method,
          timeout: config.timeout ? config.timeout : 1500,
          data: payload.data ? payload.data : {},
          responseType: config.responseType ? config.responseType : 'json',
          params: payload.params ? payload.params : {}
        })
      }
      this.service.interceptors.request.use(ic => {
        if (!ic.url) {
            return ic;
        }
        const currentUrl = new URL(ic.url, ic.baseURL);
        let replacedUrl = '';
        ic.params&&Object.entries(ic.params).forEach((key, value) => {
          const match = currentUrl.pathname.match(${String.raw`/\/:[^\/]+/`});
          if(match){
            replacedUrl = currentUrl.pathname.replace(':'+key[0],(key[1] as string));
            delete ic.params[key[0]]
          }
        })
        return {
            ...ic,
            url: replacedUrl?replacedUrl:currentUrl.pathname,
        };
    });
    }
  
    private getConfigByEnv = () => this.config['env'].find(env => env===this.env)
    private initService() {
      return axios.create({
        baseURL: this.getConfigByEnv().url,
        timeout: this.getConfigByEnv().timeout
      })
    }
  }

  export default MxMService
`
