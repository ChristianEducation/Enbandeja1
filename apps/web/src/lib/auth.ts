import NextAuth, { type NextAuthResult } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Adapter, AdapterSession, AdapterUser } from 'next-auth/adapters'
import Google from 'next-auth/providers/google'
import { prisma } from '@enbandeja/database'

const prismaAdapter = PrismaAdapter(prisma)

const adapter: Adapter = {
  ...prismaAdapter,

  async createUser(data) {
    // Upsert en lugar de create — evita duplicados si el email ya existe
    const user = await prisma.user.upsert({
      where: { email: data.email! },
      update: {
        name: data.name,
        image: data.image,
        emailVerified: data.emailVerified ?? new Date(),
      },
      create: {
        email: data.email!,
        name: data.name,
        image: data.image,
        emailVerified: data.emailVerified ?? new Date(),
        isActive: true,
        version: 1,
      },
    })
    return user as unknown as AdapterUser
  },

  async getUserByAccount({ providerAccountId, provider }) {
    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { User: true },
    })
    if (!account?.User?.id) return null
    return account.User as unknown as AdapterUser
  },

  async getSessionAndUser(sessionToken: string) {
    const result = await prisma.session.findUnique({
      where: { sessionToken },
      include: { User: true },
    })
    if (!result) return null
    const { User: user, ...session } = result
    return {
      session: {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      } satisfies AdapterSession,
      user: user as unknown as AdapterUser,
    }
  },
}

const nextAuth: NextAuthResult = NextAuth({
  adapter,
  debug: false,

  session: {
    strategy: 'database',
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async signIn({ user }) {
      // By returning true, we allow NextAuth to finish session creation.
      // Redirection logic to /onboarding is handled automatically by page.tsx.
      if (!user.id) return true

      return true
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }

      const dbSession = await prisma.session.findFirst({
        where: {
          userId: user.id,
          expires: { gt: new Date() },
        },
        select: { activeTenantId: true, sessionToken: true },
        orderBy: { expires: 'desc' },
      })

      if (dbSession?.activeTenantId) {
        session.activeTenantId = dbSession.activeTenantId
      } else if (dbSession?.sessionToken) {
        const userTenants = await prisma.userTenant.findMany({
          where: { userId: user.id, isActive: true, deletedAt: null },
          select: { tenantId: true },
        })

        const soloTenant = userTenants[0]
        if (userTenants.length === 1 && soloTenant) {
          await prisma.session.update({
            where: { sessionToken: dbSession.sessionToken },
            data: { activeTenantId: soloTenant.tenantId },
          })
          session.activeTenantId = soloTenant.tenantId
        }
      }

      return session
    },
  },
})

export const handlers: NextAuthResult['handlers'] = nextAuth.handlers
export const auth: NextAuthResult['auth'] = nextAuth.auth
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut
