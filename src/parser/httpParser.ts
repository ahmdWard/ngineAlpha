import { DynData } from "./types";
import { InvalidMessageError } from "./errors";
import { IncompleteMessageError } from "./errors";



export class HTTPMessage {
  url: string;
  method: string;
  version: string;
  headers: Record<string, string>;
  body: Buffer;

  constructor(
    method: string,
    url: string,
    version: string,
    headers: Record<string, string>,
    body: Buffer
  ) {
    this.method = method;
    this.url = url;
    this.version = version;
    this.headers = headers;
    this.body = body;
  }
  toString(): string {
    const previewLength = 100;
    const snippet = this.body.toString(
      "utf-8",
      0,
      Math.min(previewLength, this.body.length)
    );

    return (
      `HTTPMessage(method=${JSON.stringify(this.method)}, url=${JSON.stringify(this.url)}, ` +
      `version=${JSON.stringify(this.version)}, headers=${JSON.stringify(this.headers)}, ` +
      `body=${JSON.stringify(snippet)}...)`
    );
  }
}

export class HTTPParser {
  parseMessage(buff: DynData): HTTPMessage | null {

    if (!buff || buff.length <= 0) return null;


    const indx = buff.data.subarray(0, buff.length).indexOf("\r\n\r\n"); // crlf    |||  Lf \n

    if (indx < 0) {
      throw new IncompleteMessageError(
        "Incomplete headers: missing CRLF CRLF separator."
      );
    }

    // split header block from body.

    //http headers are always text
    const headerText = buff.data.subarray(0, indx).toString("utf-8");

    this.buffPop(buff, indx + 4);

    const lines = this.splitLines(headerText);

    if (lines.length === 0) {
      throw new InvalidMessageError("Empty request");
    }

    const startLine = lines[0];
    const headerLines = lines.slice(1);

    const { method, url, version } = this.parseRequestLine(startLine);
    const headers = this.parseHeaders(headerLines);

    const body = this.extractBody(buff, headers);

   return new HTTPMessage(method,url,version,headers,body);
  }

  splitLines(data: string): string[] {
    return data.split("\r\n").filter((line) => line.length > 0);
  }

  parseRequestLine(startLine: string): {
    method: string;
    url: string;
    version: string;
  } {
    const parts = startLine.trim().split(" ");

    if (parts.length !== 3)
      throw new InvalidMessageError(`Invalid Request Line: ${startLine} `);

    const [method, url, version] = parts;

    // validation parts  are missing ... will get back for it

    return { method, url, version };
  }

  parseHeaders(headerLines: string[]): Record<string, string> {
    const headers: Record<string, string> = {};

    for (const line of headerLines) {
      const colomnIndx = line.indexOf(":");
      if (colomnIndx === -1) {
        throw new InvalidMessageError(`Invalid header line: ${line}`);
      }

      const name = line.substring(0, colomnIndx).trim().toLowerCase();
      const value = line.substring(colomnIndx + 1).trim();

      headers[name] = value;
    }
    return headers;
  }

  extractBody(buff: DynData, headers: Record<string, string>): Buffer {
    const contentLength = parseInt(headers["content-length"] || "0", 10);

    if (contentLength === 0) {
      return Buffer.alloc(0);
    }

    if (buff.length < contentLength) {
      throw new IncompleteMessageError(
        `Incomplete body: expected ${contentLength} bytes, got ${buff.length}`
      );
    }

    const body = Buffer.from(buff.data.subarray(0, contentLength));

    this.buffPop(buff, contentLength);
    return body;
  }

  buffPop(buff: DynData, start: number): void {
    buff.data = Buffer.from(buff.data.subarray(start, buff.length)); //  safer than copywithin
    buff.length -= start;
  }
}


