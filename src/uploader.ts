import { PluginSettings } from "./setting";
import {  App, TFile } from "obsidian";

//兰空上传器
export class LskyProUploader {
  settings: PluginSettings;
  lskyUrl: string;
  lskyToken: string;
  app: App;

  constructor(settings: PluginSettings,app: App) {
    this.settings = settings;
    this.lskyUrl = this.settings.uploadServer.endsWith("/")
      ? this.settings.uploadServer + "api/v1/upload"
      : this.settings.uploadServer + "/api/v1/upload";
    this.lskyToken = "Bearer " + this.settings.token;
    this.app = app;
  }

  //上传请求配置
  getRequestOptions(file: File) {
    let headers = new Headers();
    headers.append("Authorization", this.lskyToken);
    headers.append("Accept", "application/json");

    let formdata = new FormData();
    formdata.append("file", file);
    if (this.settings.strategy_id) {
      formdata.append("strategy_id", this.settings.strategy_id);
    }

    return {
      method: "POST",
      headers: headers,
      body: formdata,
    };
  }
  //上传文件，返回promise对象
  promiseRequest(file: any) {
    let requestOptions = this.getRequestOptions(file);
    return new Promise(resolve => {
      fetch(this.lskyUrl, requestOptions).then(response => {
        response.json().then(value => {
          if (!value.status) {
            return resolve({
              code: -1,
              msg: value.message,
              data: value.data,
            });
          } else {
            return resolve({
              code: 0,
              msg: "success",
              data: value.data?.links?.url,
              fullResult: {},
            });
          }
        });
      });
    }).catch(error => {
      console.log("error", error);
      return {
        code: -1,
        msg: error,
        data: "",
      };
    });
  }
  //通过路径创建文件
  async createFileObjectFromPath(path: string) {
    return new Promise(resolve => {
      if(path.startsWith('https://') || path.startsWith('http://')){
        return fetch(path).then(response => {
          return response.blob().then(blob => {
            resolve(new File([blob], path.split("/").pop()));
          });
        });
      }
      let obsfile = this.app.vault.getAbstractFileByPath(path);
      //@ts-ignore
      this.app.vault.readBinary(obsfile).then(data=>{
        const fileName = path.split("/").pop(); // 获取文件名
        const fileExtension = fileName.split(".").pop(); // 获取后缀名
        const blob = new Blob([data], { type: "image/" + fileExtension });
        const file = new File([blob], fileName);
        resolve(file);
      }).catch(err=>{
        console.error("Error reading file:", err);
        return;
      });
    });
  }

  // async uploadFilesByPath(fileList: Array<String>): Promise<any> {
  //   let promiseArr = fileList.map(async filepath => {
  //     let file = await this.createFileObjectFromPath(filepath.format());
  //     return this.promiseRequest(file);
  //   });
  //   try {
  //     let reurnObj = await Promise.all(promiseArr);
  //     const resultData = reurnObj.map((item: { data: string }) => item.data);
  //     console.info('uploadFilesByPath-Result:', resultData);
      
  //     return {
  //       result: reurnObj.map((item: { data: string }) => item.data),
  //       success: true,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //     };
  //   }
  // }


  // 上传实现
  // async uploadFilesByPath(fileList: Array<string>): Promise<any> {
  //   const concurrencyLimit = 5; // 设置并发限制
  //   const resultData: any[] = []; // 存储结果
  //   const promiseArr: Promise<any>[] = []; // 存储所有的 Promise
  
  //   const uploadFile = async (filepath: string) => {
  //     try {
  //       let file = await this.createFileObjectFromPath(filepath);
  //       const response = await this.promiseRequest(file);
  //       return response; // 返回成功的响应
  //     } catch (error) {
  //       console.error(`Error uploading file ${filepath}:`, error);
  //       throw error; // 抛出错误以便捕获
  //     }
  //   };
  
  //   // 遍历文件列表
  //   for (let i = 0; i < fileList.length; i += concurrencyLimit) {
  //     // 在每个批次中创建 Promise
  //     const batch = fileList.slice(i, i + concurrencyLimit).map(filepath => uploadFile(filepath));
  //     promiseArr.push(...batch);
  //     await Promise.all(batch); // 等待当前批次的 Promise 完成
  //   }
  
  //   // 处理所有结果并返回
  //   const reurnObj = await Promise.allSettled(promiseArr);
    
  //   return {
  //     result: reurnObj.map((item) => {
  //       if (item.status === 'fulfilled') {
  //         return item.value.data; // 成功时返回数据
  //       } else {
  //         console.error('Upload failed:', item.reason); // 打印失败的原因
  //         return null; // 失败时返回 null 或其他处理方式
  //       }
  //     }).filter(item => item !== null), // 过滤掉失败的项
  //     success: true,
  //   };
  // }
  
  // 上传实现2
  // async uploadFilesByPath(fileList: Array<string>): Promise<any> {
  //   const concurrencyLimit = 5; // 设置并发限制
  //   const promiseArr: Promise<any>[] = []; // 存储所有的 Promise
  
  //   const uploadFile = async (filepath: string) => {
  //     try {
  //       let file = await this.createFileObjectFromPath(filepath);
  //       const response = await this.promiseRequest(file);
  //       return response; // 返回成功的响应
  //     } catch (error) {
  //       console.error(`Error uploading file ${filepath}:`, error);
  //       throw error; // 抛出错误以便捕获
  //     }
  //   };
  
  //   // 遍历文件列表
  //   for (let i = 0; i < fileList.length; i += concurrencyLimit) {
  //     // 在每个批次中创建 Promise
  //     const batch = fileList.slice(i, i + concurrencyLimit).map(filepath => uploadFile(filepath));
  //     promiseArr.push(...batch);
  //     await Promise.all(batch); // 等待当前批次的 Promise 完成
  //   }
  
  //   // 处理所有结果
  //   const reurnObj = await Promise.allSettled(promiseArr);
    
  //   // 打印 reurnObj 返回结果
  //   console.info('Upload results:', reurnObj);
  
  //   return {
  //     result: reurnObj.map((item, index) => {
  //       if (item.status === 'fulfilled') {
  //         const value = item.value; // 获取返回的值
  //         const data = value.data; // 获取 data
  
  //         // 检查 msg 和 data
  //         if (value.code !== 0 || !data || Object.keys(data).length === 0) {
  //           const originalPath = fileList[index]; // 使用原始路径地址
  //           console.warn(`Invalid response for ${originalPath}: ${value.msg || 'No data'}, using original path.`);
  //           return originalPath; // 返回原始路径
  //         }
  
  //         return data; // 返回有效的数据
  //       } else {
  //         console.error('Upload failed:', item.reason); // 打印失败的原因
  //         return fileList[index]; // 上传失败时也返回原始路径
  //       }
  //     }),
  //     success: true,
  //   };
  // }

  async uploadFilesByPath(fileList: Array<string>,concurrencyLimit: number): Promise<any> {
    // const concurrencyLimit = 5; // 设置并发限制

    const promiseArr: Promise<any>[] = []; // 存储所有的 Promise
  
    const uploadFile = async (filepath: string) => {
      try {
        let file = await this.createFileObjectFromPath(filepath);
        const response = await this.promiseRequest(file);
        return { success: true, response }; // 返回成功的响应
      } catch (error) {
        console.error(`Error uploading file ${filepath}:`, error);
        return { success: false, filepath }; // 返回失败的信息
      }
    };
  
    // 遍历文件列表
    for (let i = 0; i < fileList.length; i += concurrencyLimit) {
      // 在每个批次中创建 Promise
      const batch = fileList.slice(i, i + concurrencyLimit).map(filepath => uploadFile(filepath));
      promiseArr.push(...batch);
      await Promise.all(batch); // 等待当前批次的 Promise 完成
    }
  
    // 处理所有结果
    const reurnObj = await Promise.allSettled(promiseArr);
    
    // 打印 reurnObj 返回结果
    console.info('Upload results:', reurnObj);
  
    // 生成 result 和 fullResult
    const fullResult = reurnObj.map((item, index) => {
      if (item.status === 'fulfilled' && item.value.success) {
        const value = item.value.response;
        const data = value.data;
    
        // 检查 msg 和 data
        if (value.code !== 0 || !data || Object.keys(data).length === 0) {
          const originalPath = fileList[index]; // 使用原始路径地址
          console.warn(`Invalid response for ${originalPath}: ${value.msg || 'No data'}, using original path.`);
          return { data: originalPath, success: false }; // 返回原始路径和失败状态
        }
    
        return { data, success: true }; // 返回成功的结果
      } else if (item.status === 'rejected') {
        console.error('Upload failed:', item.reason || 'Unknown reason'); // 访问 reason 属性
        return { data: fileList[index], success: false }; // 返回失败结果
      }
    });
    
  
    return {
      result: fullResult.filter(item => item.success).map(item => item.data), // 只返回成功的文件
      fullResult, // 返回完整的结果
      success: true,
    };
  }
  

  
  

  
  async uploadFiles(fileList: Array<File>): Promise<any> {
    let promiseArr = fileList.map(async file => {
      return this.promiseRequest(file);
    });
    try {
      let reurnObj = await Promise.all(promiseArr);
      let failItem:any = reurnObj.find((item: { code: number })=>item.code===-1);
      if (failItem) {
        throw {err:failItem.msg}
      }

      const resultData = reurnObj.map((item: { data: string }) => item.data);
      console.info('Result:', resultData);


      return {
        result: reurnObj.map((item: { data: string }) => item.data),
        success: true,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  async uploadFileByClipboard(evt: ClipboardEvent): Promise<any> {
    let files = evt.clipboardData.files;
    let file = files[0];
    return this.promiseRequest(file);
  }
}