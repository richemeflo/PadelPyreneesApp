import jwt from "jsonwebtoken";

export type JwtUserPayload = {
  uid: string;
  email?: string | null;
  pseudo?: string | null;
};

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function signAuthToken(payload: JwtUserPayload) {
  const secret = requireJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

  return jwt.sign(
    {
      uid: payload.uid,
      email: payload.email ?? null,
      pseudo: payload.pseudo ?? null,
    },
    secret,
    {
      expiresIn,
      subject: payload.uid,
    },
  );
}

export function verifyAuthToken(token: string): JwtUserPayload | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & JwtUserPayload;
    const uid = typeof decoded.uid === "string" ? decoded.uid : decoded.sub;
    if (!uid || typeof uid !== "string") return null;
    return {
      uid,
      email: decoded.email ?? null,
      pseudo: decoded.pseudo ?? null,
    };
  } catch {
    return null;
  }
}
