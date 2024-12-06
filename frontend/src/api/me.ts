import { $api } from "@/api/index";

export function useMe() {
  return $api.useQuery(
    "get",
    "/users/me",
    {},
    {
      refetchInterval: 1000 * 60 * 5, // 5 minutes
    },
  );
}
