import { SignJWT } from "jose";
import { auth } from "../../auth";

export async function getBackendAuthHeaders() {
  const session = await auth();
  const email = session?.user?.email;
  const secret = process.env.BACKEND_JWT_SECRET;

  if (!email) return null;
  if (!secret) throw new Error("BACKEND_JWT_SECRET is not configured");

  const token = await new SignJWT({
    email,
    name: session.user.name ?? email,
    role: session.user.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer("inzu-frontend")
    .setAudience("inzu-backend")
    .setSubject(session.user.id)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(secret));

  return { Authorization: `Bearer ${token}` };
}
