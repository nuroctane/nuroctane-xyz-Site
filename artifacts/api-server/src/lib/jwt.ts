/* Session tokens, signed with jose instead of jsonwebtoken.
 *
 * jsonwebtoken depends on Node's crypto module; jose uses WebCrypto, which is
 * native to the Workers runtime.
 *
 * The token format is unchanged — both libraries emit a standard HS256 JWT over
 * the same secret — so sessions issued by the old Vercel deployment keep
 * verifying here. Nobody gets logged out by the migration.
 */
import { SignJWT, jwtVerify } from "jose";

export interface JwtPayload {
  githubId: number;
  username: string;
  avatarUrl: string;
}

const TOKEN_TTL = "30d";

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be set");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secretKey());
}

/** Returns null for a missing, malformed, expired, or badly-signed token. */
export async function verifySession(token: string | undefined): Promise<JwtPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const { githubId, username, avatarUrl } = payload as unknown as JwtPayload;
    if (typeof githubId !== "number" || typeof username !== "string") return null;
    return { githubId, username, avatarUrl };
  } catch {
    return null;
  }
}

/* Admin sessions (Books, Modkeys, Curriculum) use the same secret under their
 * own audience, so a GitHub sign-in token never unlocks admin and an admin
 * token never passes verifySession (it has no githubId). `stamp` ties a token
 * to the admin password it was issued under: rotating the password ends every
 * admin session. */
const ADMIN_AUDIENCE = "nuroctane-admin";
export const ADMIN_TTL_SECONDS = 12 * 60 * 60;

export async function signAdminSession(stamp: string): Promise<string> {
  return new SignJWT({ stamp })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(ADMIN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_TTL_SECONDS}s`)
    .sign(secretKey());
}

/** False for a missing, malformed, expired, badly-signed or stale token. */
export async function verifyAdminSession(token: string | undefined, stamp: string): Promise<boolean> {
  if (!token || !stamp) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { audience: ADMIN_AUDIENCE });
    return payload.stamp === stamp;
  } catch {
    return false;
  }
}
