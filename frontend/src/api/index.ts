import createFetchClient from "openapi-fetch";
import createQueryClient from "openapi-react-query";
import * as apiTypes from "./types";

export type { apiTypes };

export const apiFetch = createFetchClient<apiTypes.paths>({
  baseUrl: "/api",
  credentials: "include",
});
export const $api = createQueryClient(apiFetch);
