import { FollowersCountPipe } from './followers-count.pipe';

describe('FollowersCountPipe', () => {
  it('create an instance', () => {
    const pipe = new FollowersCountPipe();
    expect(pipe).toBeTruthy();
  });
});
