import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Dynamic import for CommonJS modules
async function getDbFunctions() {
  return await import('@/lib/db/users');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true, // Allow localhost and other hosts in development
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.error('[Auth] Missing credentials');
                    return null;
                }

                try {
                    const { findUserByEmail, verifyPassword, updateUserLastLogin } = await getDbFunctions();
                    const user = await findUserByEmail(credentials.email);

                    if (!user) {
                        console.error(`[Auth] User not found: ${credentials.email}`);
                        return null;
                    }

                    if (!user.password_hash) {
                        console.error(`[Auth] User has no password hash: ${credentials.email}`);
                        return null;
                    }

                    const isPasswordValid = await verifyPassword(user, credentials.password);

                    if (!isPasswordValid) {
                        console.error(`[Auth] Invalid password for: ${credentials.email}`);
                        return null;
                    }

                    // Update last login
                    await updateUserLastLogin(user.id);

                    console.log(`[Auth] Successfully authenticated: ${credentials.email}`);

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                } catch (error) {
                    console.error('[Auth] Error during authorization:', error);
                    console.error('[Auth] Error stack:', error.stack);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.role = token.role;
            }
            return session;
        }
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
});
