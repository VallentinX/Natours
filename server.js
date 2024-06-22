/** Modules */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import app from './app.js';

/** Developer's Modules */

/** Others */
config({path: './config.env'});

const PORT = process.env.PORT || 3000;

process.on('uncaughtException', error => {
  console.log(`${error.name} - ${error.message}! UNHANDLED EXCEPTION! Server's shutting down...`);
  process.exit(1);
});

/** Others */
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB Connection successful');
  })
  .catch(err => {
    console.log('DB Connection error:', err);
    process.exit(1);
  });

/** Start Server */
const server = app.listen(PORT, () => {
  console.log(`Servers starts app on port ${PORT}...`);
});

process.on('unhandledRejection', error => {
  console.log(`${error.name} - ${error.message}! UNHANDLED REJECTION! Server's shutting down...`);

  server.close(() => process.exit(1));
});

/** status code 200 (OK): indicates that the server has successfully processed the request and is returning the requested resource. */
/** status code 201 (Created): indicates that the request has been fulfilled, and a new resource has been created. */
/** status code 202 (Accepted): indicates that the request has been accepted for processing, but the processing has not been completed yet. */
/** status code 204 (No Content): indicates that the server successfully processed the request, but there is no content to return in the response body. */
/** status code 301 (Moved Permanently - Permanent Redirect): indicates that the requested resource has been permanently moved to a different URL. */
/** status code 302 (Found - Temporary Redirect): indicates that the requested resource has been temporarily moved to a different URL. */
/** status code 303 (See Other): indicates that the client should redirect to a different URL to obtain the requested resource. */
/** status code 304 (Not Modified): indicates that the resource has not been modified since the last request. */
/** status code 307 (Temporary Redirect): indicates that the redirection should be temporary and the client should continue to use the original URL for future requests. */
/** status code 308 (Permanent Redirect): indicates that the redirection should be permanent and the client should update its bookmarks or links accordingly. */
/** status code 400 (Bad Request): indicates a bad request, that the server cannot process the request due to client error. */
/** status code 401 (Unauthorized): indicates that the client must authenticate itself to access the requested resource, but has failed to do so. */
/** status code 403 (Forbidden): indicates This status code indicates that the server understood the request, but refuses to authorize it. */
/** status code 404 (Not Found): indicates that the server cannot find the requested resource. */
/** status code 405 (Method Not Allowed): indicates that the method used in the request (e.g., GET, POST) is not allowed for the requested resource. */
/** status code 409 (Conflict): indicates that the request could not be completed due to a conflict with the current state of the resource.. */
/** status code 410 (Gone): indicates that the requested resource is no longer available and has been permanently removed. */
/** status code 413 (Payload Too Large): indicates that the request payload (e.g., request body or file upload) is too large for the server to process.. */
/** status code 429 (Too Many Requests): indicates that the client has sent too many requests in a given amount of time, and the server is rate-limiting the client. */
/** status code 451 (Unavailable For Legal Reasons): indicates that the server is refusing to process the request due to legal reasons, such as censorship or legal obligations. */
/** status code 500 (Internal Server Error): indicates an internal server error, that something went wrong on the server side while processing the request. */
/** status code 501 (Not Implemented): indicates that the server does not support the functionality required to fulfill the request. */
/** status code 502(Bad Gateway): indicates that the server received an invalid response from an upstream server while attempting to fulfill the request. */
/** status code 503 (Service Unavailable): indicates that the server is temporarily unable to handle the request due to maintenance, overloading, or other reasons. */
/** status code 504 (Gateway Timeout): indicates that the server acting as a gateway or proxy did not receive a timely response from an upstream server while attempting to fulfill the request. */
/** status code 507 (Insufficient Storage): indicates that the server does not have enough storage space to fulfill the request. */

/** status code (): indicates . */
