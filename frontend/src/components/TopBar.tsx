import { $api } from "@/api";
import { useMe } from "@/api/me.ts";
import { Button } from "@/components/ui/button.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

export function TopBar() {
  const { data: me } = useMe();

  const queryClient = useQueryClient();
  const { mutate: performLogout } = $api.useMutation("post", "/users/logout", {
    onSettled: () => queryClient.resetQueries(),
  });

  return (
    <header className="flex h-[--header-height] w-full justify-between border-b-[1px] bg-white bg-opacity-90 backdrop-blur fixed top-0 z-10">
      <div className="flex items-center gap-2 px-2">
        <img src="/favicon.png" className="h-8 w-8" />
        <Button asChild variant="link">
          <Link to="/" activeProps={{ className: 'underline'}}>
            Главная
          </Link>
        </Button>
        <Button asChild variant="link">
          <Link
            to="/sports"
            activeProps={{ className: 'underline'}}
          >
            Виды спорта
          </Link>
        </Button>
        <Button asChild variant="link">
          <Link
            to="/calendar"
            activeProps={{ className: 'underline'}}
          >
            Календарь
          </Link>
        </Button>
        <Button asChild variant="link">
          <Link
            to="/search"
            activeProps={{ className: 'underline'}}
          >
            Поиск
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 px-2">
        {!me ? (
          <Button asChild variant="link">
            <Link
              to="/auth/login"
              activeProps={{ className: 'underline'}}
            >
              Войти
            </Link>
          </Button>
        ) : (
          <>
            <div className="text-lg">{me.login}</div>
            <Button asChild variant="link">
              <Link
                to="/profile"
                activeProps={{ className: 'underline'}}
              >
                Профиль
              </Link>
            </Button>
            <Button variant="link" onClick={() => performLogout({})}>
              Выйти
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
