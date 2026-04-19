import { AuthorizedOnlyPipe } from './authorized-only.pipe';

describe('AuthorizedOnlyPipe', () => {
  it('create an instance', () => {
    const pipe = new AuthorizedOnlyPipe();
    expect(pipe).toBeTruthy();
  });
});
