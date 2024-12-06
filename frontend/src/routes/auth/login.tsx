import { $api } from "@/api";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirectTo?: string } => {
    return {
      redirectTo: (search.redirectTo as string | undefined) || undefined,
    };
  },
});

function RouteComponent() {
  const { redirectTo } = Route.useSearch();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(false);

  const queryClient = useQueryClient();
  const {
    mutate: performLogin,
    error: errorLogin,
    reset: resetLogin,
    isPending: isPendingLogin,
  } = $api.useMutation("post", "/users/login", {
    onSettled: () => queryClient.resetQueries(),
    onSuccess: () => window.location.assign(redirectTo || "/"),
  });
  const {
    mutate: performRegister,
    error: errorRegister,
    reset: resetRegister,
    isPending: isPendingRegister,
  } = $api.useMutation("post", "/users/register", {
    onSettled: () => queryClient.resetQueries(),
    onSuccess: () => window.location.assign(redirectTo || "/"),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (register) {
      performRegister({ params: { query: { login, password } } });
    } else {
      performLogin({ params: { query: { login, password } } });
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8">
      <form className="flex flex-col gap-2" onSubmit={onSubmit}>
        <h1 className="text-center text-2xl">Вход в систему</h1>
        <Input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Логин"
          type="text"
        />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          type="password"
        />
        {errorLogin && <div>{errorLogin.toString()}</div>}
        {errorRegister && <div>{errorRegister.toString()}</div>}
        <Button type="submit">
          {register ? "Зарегистрироваться" : "Войти"}
          {(isPendingLogin || isPendingRegister) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
        </Button>
        <Button
          type="button"
          variant="link"
          onClick={() => {
            setRegister((v) => !v);
            resetLogin();
            resetRegister();
          }}
        >
          {!register
            ? "Нет аккаунта? Зарегистрируйтесь"
            : "Уже есть аккаунт? Войдите"}
        </Button>
      </form>
    </div>
  );
}
