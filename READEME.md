# NgineAlpha HTTP Server in Typescript


NgineAlpha is a project with Eductional purpose to undertstand what really happened under the hood 
and keep diving in network layers and see how the request that been sent to one of my application i built look like how how web servers handle it 

i'm getting inspired from Nginex as you see from the tile but it's only for troll :" 

NgineAlplha to NgineX is like car to Cat :" 

i wrote 6 files with tons of line of code it was like a draft to me but now this is my strong foundation 

at the end  i will share my refrences and all the books articales or repos that hepled me throw this journey 


this decumentation will change definitly while going far in this project i just hate to keep something empty (maybe i stil have my college exam mentallity) but btw this is what i did untill now 


    Request Line Parsing
    Extracts method, URL, and HTTP version from the first line of the HTTP request.

    Header Parsing
    Parses raw HTTP headers into a Record<string, string> format, case-insensitive as per HTTP/1.1 spec.

    Body Extraction
    Handles optional request bodies using the Content-Length header.

    Streaming Buffer Support
    Processes data buffers (DynData) with incremental pop behavior (buffPop) for efficient TCP stream simulation.


    Testing 

         Basic GET requests

             POST requests with body

             Error handling for incomplete and malformed messages

             Header case-insensitivity

             Buffer management for partial streams