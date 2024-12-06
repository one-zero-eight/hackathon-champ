import { $api } from "@/api";
import { useMe } from "@/api/me.ts";
import { SchemaSort } from "@/api/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { Filters } from "@/lib/types.ts";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FaRegStar, FaStar } from "react-icons/fa";

export function SaveFilters({
  filters,
  sort,
}: {
  filters: Filters | undefined;
  sort: SchemaSort | undefined;
}) {
  const { data: me, refetch } = useMe();
  const navigate = useNavigate();
  const { mutateAsync: createShare } = $api.useMutation(
    "post",
    "/events/search/share",
  );
  const { mutateAsync: setFavorites } = $api.useMutation(
    "put",
    "/users/favorites",
  );
  const selections = useQueries({
    queries:
      me?.favorites?.map((v) =>
        $api.queryOptions("get", "/events/search/share/{selection_id}", {
          params: { path: { selection_id: v } },
        }),
      ) ?? [],
  });

  const currentSelection = selections?.find(
    (v) => deepEqual(v.data?.filters, filters) && deepEqual(v.data?.sort, sort),
  );

  const save = async () => {
    if (!me) {
      navigate({
        to: "/auth/login",
        search: { redirectTo: window.location.href },
      });
      return;
    }

    if (!currentSelection) {
      const selection = await createShare({
        body: { filters: filters || {}, sort: sort || {} },
      });
      if (selection) {
        await setFavorites({
          body: { favorite_ids: [...me.favorites, selection.id] },
        });
      }
    } else {
      await setFavorites({
        body: {
          favorite_ids: me.favorites.filter(
            (v) => v !== (currentSelection.data?.id ?? ""),
          ),
        },
      });
    }
    refetch();
  };

  return (
    <>
      <Button className="w-full" onClick={() => save()}>
        {!currentSelection ? (
          <>
            <FaRegStar />
            Сохранить подборку
          </>
        ) : (
          <>
            <FaStar />
            Сохранено. Посмотрите в профиле
          </>
        )}
      </Button>
    </>
  );
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (
    typeof obj1 === "string" &&
    typeof obj2 === "string" &&
    (obj1 + "Z" === obj2 || obj1 === obj2 + "Z")
  ) {
    return true;
  }

  if (obj1 == obj2) {
    // Covers primitive values and reference equality
    return true;
  }

  if (obj1 == null && obj2 == null) {
    // Treat null and undefined as equal
    return true;
  }

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    // If one is not an object or if either is null, they're not equal
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  for (const key of keys1) {
    if (!keys2.includes(key) && obj1[key] != null && obj2[key] != null) {
      // Check if both objects have the same keys
      return false;
    }

    // Recursively compare values
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
