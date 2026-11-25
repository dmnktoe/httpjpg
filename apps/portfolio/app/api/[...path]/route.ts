import { API_ERROR, jsonError } from "@/lib/api-error";

/**
 * Every `/api` path without a route of its own. Without this the page catch-all
 * took them and answered with the HTML not-found page and a 200, which a client
 * checking only the status reads as success.
 */
function notFound() {
  return jsonError(API_ERROR.notFound, 404);
}

export {
  notFound as DELETE,
  notFound as GET,
  notFound as HEAD,
  notFound as OPTIONS,
  notFound as PATCH,
  notFound as POST,
  notFound as PUT,
};
