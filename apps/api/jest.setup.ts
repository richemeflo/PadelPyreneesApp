import { firebaseAdminMock, firebaseAuthMock } from "./src/test-utils/firebase";
import { prismaMock } from "./src/test-utils/prisma";

process.env.NODE_ENV = "test";
process.env.TZ = "UTC";

jest.mock("firebase-admin", () => ({
  __esModule: true,
  default: firebaseAdminMock,
}));

jest.mock("firebase-admin/auth", () => firebaseAuthMock);

jest.mock("./src/lib/prisma", () => ({
  prisma: prismaMock,
}));

afterEach(() => {
  jest.resetAllMocks();
});
