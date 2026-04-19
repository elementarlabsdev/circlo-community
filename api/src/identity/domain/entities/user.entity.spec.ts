import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

describe('User Password Verification', () => {
  it('should verify password correctly after creation', async () => {
    const password = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = User.create({
      id: 'some-uuid',
      email: 'test@example.com',
      passwordHash,
      roleId: 'role-id',
      profile: {
        name: 'Test User',
        username: 'testuser',
        preferredColorScheme: 'light',
      },
      registrationProvider: 'email',
      accountStatus: { verified: true } as any,
    });

    const isValid = await user.verifyPassword(password);
    expect(isValid).toBe(true);
  });

  it('should verify password with special characters', async () => {
    const password = 'abc&<def>';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = User.create({
      id: 'some-uuid',
      email: 'test@example.com',
      passwordHash,
      roleId: 'role-id',
      profile: {
        name: 'Test User',
        username: 'testuser',
        preferredColorScheme: 'light',
      },
      registrationProvider: 'email',
      accountStatus: { verified: true } as any,
    });

    const isValid = await user.verifyPassword(password);
    expect(isValid).toBe(true);

    // If the user gets "abc&amp;&lt;def&gt;" from the email and enters it:
    const escapedPassword = 'abc&amp;&lt;def&gt;';
    const isEscapedValid = await user.verifyPassword(escapedPassword);
    expect(isEscapedValid).toBe(false);
  });
});
