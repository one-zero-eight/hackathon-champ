import { useEffect, useRef } from 'react'

export function TelegramPostWidget({
  className,
  telegramPost,
}: {
  className?: string
  telegramPost: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current === null)
      return

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-post', telegramPost)
    script.setAttribute('data-width', '100%')
    script.async = true

    ref.current.innerHTML = ''
    ref.current.appendChild(script)
  }, [telegramPost])

  return <div ref={ref} className={className} />
}
