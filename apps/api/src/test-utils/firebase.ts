export const mockVerifyIdToken = jest.fn();

export const firebaseAdminMock = {
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
};

export const firebaseAuthMock = {
  getAuth: () => ({
    verifyIdToken: mockVerifyIdToken,
  }),
};
