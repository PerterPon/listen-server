
declare module "cos-nodejs-sdk-v5" {

  class Cos {
    constructor(params: any);
    putObject(params: any, cb: any): void;
  }

  export default Cos;
}