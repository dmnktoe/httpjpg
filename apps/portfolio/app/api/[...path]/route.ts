import { API_ERROR, jsonError } from "@/lib/api-error";

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
