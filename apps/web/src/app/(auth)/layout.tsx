// Layout de auth — fondo Deep Navy, centrado vertical
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      {children}
    </div>
  )
}
