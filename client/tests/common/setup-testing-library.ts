jest.mock('src/entities/session/lib/bootstrap-session', () => ({
  bootstrapSessionAndPrimeCache: jest.fn(
    async (qc: { setQueryData: (key: readonly unknown[], data: unknown) => void }) => {
      const user = { id: 1, email: 'test@example.com' };
      qc.setQueryData(['session', 'me'], user);
      return user;
    },
  ),
}));

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
