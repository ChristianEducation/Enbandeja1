import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@enbandeja/database'

export default async function RootPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Verificar si el usuario tiene al menos un UserTenant
  const userTenantCount = await prisma.userTenant.count({
    where: {
      userId: session.user.id,
      isActive: true,
      deletedAt: null,
    },
  })

  if (userTenantCount === 0) {
    // Sin tenant → onboarding
    redirect('/onboarding/codigo')
  }

  redirect('/home')
}
