import { Bot } from "grammy";
import { run } from "grammy-runner";

async function main() {
  const token = Deno.env.get("BOT_TOKEN");
  if (!token) {
    console.error("BOT_TOKEN is not set, I will not start.");
    Deno.exit(0);
  }

  const bot = new Bot(token);

  bot.on("message", async (ctx) => {
    await ctx.reply(
      "Привет! Я бот для платформы ФСП Линк 👋\n\nЧтобы начать работу, откройте приложение, нажав на кнопку ниже 👇",
      {
        reply_markup: {
          inline_keyboard: [
            [{
              text: "Открыть приложение",
              web_app: { url: "https://fsp-link-portal.ru" },
            }],
          ],
        },
      },
    );
  });

  const runner = run(bot);

  const shutdown = () => {
    runner.stop().then(() => Deno.exit(0));
  };
  Deno.addSignalListener("SIGINT", shutdown);
  Deno.addSignalListener("SIGTERM", shutdown);

  await runner.task();
}

main();
