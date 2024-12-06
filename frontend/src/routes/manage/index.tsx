import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/')({
  component: () => null,

  // Redirect to Regional dashboard
  beforeLoad: () => {
    throw redirect({ to: '/manage/region/home' })
  },
})
