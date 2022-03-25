  declare module "tgz-modify" {
    function placeholder(tgz_file_in: string, tgz_file_out: string, callback: (header: any, data: string) => string, onFinish: (err?: any) => void): Promise<void>;
    module placeholder {}
    export = placeholder
  }
  
