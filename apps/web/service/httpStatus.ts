export enum HTTP_STATUS {
  OK = 200,
  // Response to a successful REST API action. The HTTP method can be GET, POST, PUT, PATCH or DELETE.
  CREATED = 201,
  // The request has been fulfilled and resource created. A URI for the created resource is returned in the Location
  // header.
  ACCEPTED = 202,
  // The request has been accepted for processing, but processing is not yet complete.
  MOVED_PERMANENTLY = 301,
  // Permanent redirection.
  NOT_MODIFIED = 304,
  // Caching related response that returned when the client has the same copy of the resource as the server.
  TEMPORARY_REDIRECT = 307,
  // Temporary redirection of resource.
  BAD_REQUEST = 400,
  // The request is malformed, such as message body format error.
  UNAUTHORIZED = 401,
  // Wrong or no authentication ID/password provided.
  FORBIDDEN = 403,
  // It's used when the authentication succeeded but authenticated user doesn't have permission to the request resource.
  NOT_FOUND = 404,
  // When a non-existent resource is requested.
  METHOD_NOT_ACCEPTABLE = 405,
  // The error for an unexpected HTTP method. For example, the REST API is expecting HTTP GET, but HTTP PUT is used.
  UNACCEPTABLE = 406,
  // The client presented a content type in the Accept header which is not supported by the server API.
  PAYLOAD_TOO_LARGE = 413,
  // Use it to signal that the request size exceeded the given limit e.g. regarding file uploads.
  UNSUPPORTED_MEDIA_TYPE = 415,
  // The requested content type is not supported by the REST service.
  TOO_MANY_REQUESTS = 429,
  // The error is used when there may be DOS attack detected or the request is rejected due to rate limiting.
  INTERNAL_SERVER_ERROR = 500,
  // An unexpected condition prevented the server from fulfilling the request. Be aware that the response should not
  // reveal internal information that helps an attacker, e.g. detailed error messages or stack traces.
  NOT_IMPLEMENTED = 501,
  // The REST service does not implement the requested operation yet.
  SERVICE_UNAVAILABLE = 503,
  // The REST service is temporarily unable to process the request. Used to inform the client it should retry at a
  // later time.
}
