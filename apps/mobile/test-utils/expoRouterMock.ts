export const routerMock = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn(),
};

export const useRouter = () => routerMock;

export const useLocalSearchParams = () => ({});
