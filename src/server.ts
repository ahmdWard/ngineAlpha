import * as net from 'net';
import { tcpConnection } from './utils/types';
import { buffData } from './utils/types';
import { HTTPMessage, HTTPParser } from './parser/httpParser';
import { IncompleteMessageError } from './utils/errors';



function soInit(socket: net.Socket) : tcpConnection {
    const conn: tcpConnection = {
        socket:socket,
        reader:null,
        ended:false,
        err:null
    }

    socket.on('data', (data:Buffer)=>{
        socket.pause();
        conn.reader?.resolve(data);
        conn.reader = null
    })

    socket.on('end',()=>{
        conn.ended= true
        conn.reader?.resolve(Buffer.from('')) 
        conn.reader = null
    })

    socket.on('error',(err:Error)=>{

        conn.err=err
        if(conn.reader){
            conn.reader?.reject(err)
            conn.reader = null
        }
    })

    return conn;
}

async function serveClient(socket: net.Socket): Promise<void> {
  const conn: tcpConnection = soInit(socket);
  const buff: buffData = { data: Buffer.from(""), length: 0 };
  const parser = new HTTPParser();

  while (true) {
    try {
      let message: HTTPMessage | null = null;

      if (buff.length > 0) {
        try {
          message = parser.parseMessage(buff);
        } catch (error) {
          if (error instanceof IncompleteMessageError) {
            message = null;
          } else {
            await sendErrorResponse(socket, 400, "Bad Request");
            break;
          }
        }
      }

      if (message) {
        console.log("Parsed HTTP request:", message.toString());
        await handlehttpRequest(socket, message);
        break;
      } else {
        const data = await readFromConnection(conn);

        if (data.length === 0) {
          break;
        }

        buffPush(buff, data);

        socket.resume();
      }
    } catch (err) {
      console.error("Error in serveClient:", err);
      await sendErrorResponse(socket, 500, "Internal Server Error");
      break;
    }
  }
}

async function readFromConnection(conn: tcpConnection): Promise<Buffer> {
    if (conn.ended || conn.err) {
        return Buffer.from('');
    }

    return new Promise<Buffer>((resolve, reject) => {
        conn.reader = { resolve, reject };
    });
}

function buffPush(buff: buffData, data: Buffer): void {
    const newBuffer = Buffer.alloc(buff.length + data.length);
    buff.data.copy(newBuffer, 0, 0, buff.length);
    data.copy(newBuffer, buff.length);
    
    buff.data = newBuffer;
    buff.length += data.length;
}

async function handlehttpRequest(socket:net.Socket, message:HTTPMessage) : Promise<void>{
    
    const responseBody = `Hello! You requested: ${message.method} ${message.url}\n`;

    const response = [
        `HTTP/1.1 200 OK`,
        'Content-Type: text/plain',
        `Content-Length: ${responseBody.length}`,
        'Connection: close',
        '',
        responseBody
    ].join('\r\n');

    return new Promise<void> ((resolve,reject)=>{
        socket.write(response,err=>{
            if(err) reject(err)
                else
            resolve();
        })
    })
}

async function sendErrorResponse(socket:net.Socket, statusCode:number , statusText:string) : Promise<void> {
    const responseBody = `Error ${statusCode} : ${statusText}`
    
      const response = [
        `HTTP/1.1 ${statusCode} ${statusText}`,
        'Content-Type: text/plain',
        `Content-Length: ${responseBody.length}`,
        'Connection: close',
        '',
        responseBody
    ].join('\r\n');

    return new Promise<void>((resolve, reject)=>{
        socket.write(response,err=>{
            if(err) reject(err);
            else
                resolve();
        })
    })
}


async function newConnection(socket:net.Socket):Promise<void> {
    console.log("new Conncection", socket.remoteAddress, socket.remoteFamily);

    try {
        await serveClient(socket)
    } catch (error) {
        console.error(error)
    }finally {
        socket.destroy()
    }
    
} 

const server = net.createServer(async(socket)=>{
    newConnection(socket);
})

server.listen(8000,()=>{
    console.log("listen at 8000");
})