import { HTTPParser, HTTPMessage } from '../src/parser/httpParser';
import { InvalidMessageError, IncompleteMessageError } from '../src/parser/errors';

describe('HTTPParser', () => {
  it('should parse a basic GET request', () => {

    const raw = 
      "GET /index.html HTTP/1.1\r\n" +
      "Host: example.com\r\n" +
      "User-Agent: TestClient\r\n" +
      "\r\n";

    const buffer = Buffer.from(raw, 'utf-8');
    const parser = new HTTPParser();
    
    const message = parser.parseMessage({
      data: buffer,
      length: buffer.length,
    });

    expect(message).not.toBeNull();
    expect(message?.method).toBe('GET');
    expect(message?.url).toBe('/index.html'); 
    expect(message?.headers['host']).toBe('example.com'); 
    expect(message?.body.toString()).toBe(''); 
  });

  it('should parse a POST request with body', () => {
    const raw = 
      "POST /api/users HTTP/1.1\r\n" +
      "Host: localhost:3000\r\n" +
      "Content-Type: application/json\r\n" +
      "Content-Length: 24\r\n" +
      "\r\n" +
      '{"name":"John","age":30}';

    const buffer = Buffer.from(raw, 'utf-8');
    const parser = new HTTPParser();
    
    const message = parser.parseMessage({
      data: buffer,
      length: buffer.length,
    });

    

    expect(message).not.toBeNull();
    expect(message?.method).toBe('POST');
    expect(message?.url).toBe('/api/users');
    expect(message?.headers['host']).toBe('localhost:3000');
    expect(message?.headers['content-type']).toBe('application/json');
    expect(message?.body.toString()).toBe('{"name":"John","age":30}');
  });

  it('should throw IncompleteMessageError for incomplete headers', () => {

    const raw = 
      "GET /index.html HTTP/1.1\r\n" +
      "Host: example.com\r\n" +
      "User-Agent: TestClient\r\n";

    const buffer = Buffer.from(raw, 'utf-8');
    const parser = new HTTPParser();
    
    expect(() => {
      parser.parseMessage({
        data: buffer,
        length: buffer.length,
      });
    }).toThrow(IncompleteMessageError);
  });

  it('should handle empty request', () => {
    const parser = new HTTPParser();
    
    const result = parser.parseMessage({
      data: Buffer.from(""),
      length: 0,
    });

    expect(result).toBeNull();
  });

  it('should parse headers case-insensitively', () => {
    const raw = 
      "GET /test HTTP/1.1\r\n" +
      "HOST: example.com\r\n" +
      "content-type: text/html\r\n" +
      "User-Agent: TestClient\r\n" +
      "\r\n";

    const buffer = Buffer.from(raw, 'utf-8');
    const parser = new HTTPParser();
    
    const message = parser.parseMessage({
      data: buffer,
      length: buffer.length,
    });

    expect(message).not.toBeNull();
    expect(message?.headers['host']).toBe('example.com');
    expect(message?.headers['content-type']).toBe('text/html');
    expect(message?.headers['user-agent']).toBe('TestClient');
  });

  it('should throw InvalidMessageError for incomplete headers',()=>{

     const raw = 
      "GET /test HTTP/1.1\r\n" +
      "HOST example.com\r\n" +
      "content-type: text/html\r\n" +
      "User-Agent: TestClient\r\n" +
      "\r\n";

      const buffer = Buffer.from(raw, 'utf-8');
      const parser = new HTTPParser();
    

    expect(()=>{
      parser.parseMessage({
        data:buffer,
        length:buffer.length
      })
    }).toThrow(InvalidMessageError)
  })
});