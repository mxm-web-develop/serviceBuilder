# 服务接口自动化工具
- ## 更新内容
  支持Types, document 生成暂不支持。
  更新使用文档
- ## 安装
```
    npm install -g mxm-service-cli
```

  如果mac系统需要最高权限，需要加上sudo   

```
   sudo npm install -g mxm-service-cli
```

-----------  
- ## 执行

```dotnetcli
    mxmservice complie -d
```

<table>
    <tr>
        <th>命令</th>
        <th>描述</th>
        <th>options</th>
    </tr>
    <tr>
        <td>complie</td>
        <td>开始编译</td>
        <td>-d 编译时到处文档</td>
    </tr>
</table>

 -----------  
- ## 配置文件

在根目录（执行命令的位置）添加mxmservice.config.json
<table>
    <tr>
        <th>配置</th>
        <th>描述</th>
        <th>必填</th>
    </tr>
    <tr>
        <td>version</td>
        <td>接口版本，每次进行升级编译必须改变版本，否则不会进行完整编译</td>
        <td style='color: green'>✓</td>
    </tr>
    <tr>
        <td>folderName</td>
        <td>定义服务模块文件夹名字，也是模块名字</td>
        <td><i style='color: red'>✕</i>
         default:service
        </td>
    </tr>
    <tr>
        <td>description</td>
        <td>用于描述服务模块</td>
        <td><i style='color: red'>✕</i> </td>
    </tr>
        <tr>
        <td>runEnvironment</td>
        <td>运行环境</td>
         <td>
         <i style='color: green'>✓</i>
            <div>dev | test | prod</div> 
         </td>
    </tr>
</table>

```json
//用例
{
  "version": "3.3.8",
  "folderName": "mxm_service_321",
  "description": "鲸图2.0的后端API",
  "runEnvironment":"dev",
  "outputPath": "src",
  "env": {
    "dev": {
      "url": "/mock",
      "timeout": "12000"
    },
    "test": {
      "url": "http://10.114.10.79:5000/api",
      "timeout": "12000"
    },
    "production": {
      "url": "/proxy",
      "timeout": "12000"
    }
  },
  "modules": [
     {
      "name": "DataSet",
      "prefix": "",
      "api": {
        "addDataSet": {
          "url": "/dataset/addDataSet",
          "method": "get",
          "useParams":true,
          "doc": {
            "method": "添加节点"
          },
          "request":{
            "name":"string!",
            "age":"number!",
            "nickname":"string"
          }
        },
        "dataSet": {
          "url": "/dataset/dataSet/:id",
          "method": "post"
        },
        "doshit": {
          "url": "/dataset/dataSet/:id",
          "method": "post"
        },
        "pigname": {
          "url": "/dataset/dataSet/:id",
          "method": "post"
        },
        "undksldataSet": {
          "url": "/dataset/dataSet/:id",
          "method": "post"
        },
        "dataGet": {
          "url": "/dataset/dataSet/:id",
          "method": "get"
        },
        "getDataSetList": {
          "url": "/dataset/dataset/getDataSetList",
          "method": "post"
        }
      }
    },
    {
      "name": "DataSource",
      "prefix": "",
      "api": {
        "dataSource": {
          "url": "/dataset/dataSource/:id",
          "method": "get"
        }
      }
    }
  ]
}

```







<head> 
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/all.js"></script> 
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/v4-shims.js"></script> 
</head> 
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css">