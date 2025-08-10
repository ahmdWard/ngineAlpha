import * as net from 'net';

export type DynData = {
  data: Buffer;
  length: number;
};

export type tcpConnection = {
    socket : net.Socket,
    reader : null |
    {
        resolve:(value: Buffer)=>void,
        reject:(reason:Error)=> void
    },
    err: null|Error,
    ended:boolean
}


export type buffData = {
  data:Buffer
  length:number
}