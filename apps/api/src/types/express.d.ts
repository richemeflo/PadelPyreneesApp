declare global {
  namespace Express {
    interface Request {
      firebaseUser?: {
        uid: string;
        email?: string | null;
        name?: string | null;
        provider?: "jwt";
      };
    }
  }
}

export {};
