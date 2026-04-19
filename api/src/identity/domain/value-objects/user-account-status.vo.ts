import { BadRequestException } from '@nestjs/common';

/**
 * Интерфейс для свойств, описывающих статус аккаунта.
 * Использование `Partial` в `create` делает его более гибким.
 */
export interface UserAccountStatusProps {
  isBlocked: boolean;
  verified: boolean;
  isSuperAdmin: boolean;
  isDeactivated: boolean;
  hasPaidAccount: boolean;
}

export class UserAccountStatus {
  public readonly isBlocked: boolean;
  public readonly verified: boolean;
  public readonly isSuperAdmin: boolean;
  public readonly isDeactivated: boolean;
  public readonly hasPaidAccount: boolean;

  /**
   * Приватный конструктор для контроля над созданием экземпляров.
   */
  private constructor(props: UserAccountStatusProps) {
    this.isBlocked = props.isBlocked;
    this.verified = props.verified;
    this.isSuperAdmin = props.isSuperAdmin;
    this.isDeactivated = props.isDeactivated;
    this.hasPaidAccount = props.hasPaidAccount;
    Object.freeze(this);
  }

  /**
   * Статический фабричный метод для создания статуса.
   * Устанавливает безопасные значения по умолчанию для нового аккаунта.
   */
  public static create(
    initialProps?: Partial<UserAccountStatusProps>,
  ): UserAccountStatus {
    const defaults: UserAccountStatusProps = {
      isBlocked: false,
      verified: false, // Часто верификация происходит позже
      isSuperAdmin: false,
      isDeactivated: false,
      hasPaidAccount: false,
    };

    const props = { ...defaults, ...initialProps };

    // Бизнес-правило: Суперадмин не может быть создан в заблокированном состоянии.
    if (props.isSuperAdmin && props.isBlocked) {
      throw new BadRequestException(
        'A super admin cannot be blocked at creation.',
      );
    }

    return new UserAccountStatus(props);
  }

  /**
   * Возвращает новый экземпляр статуса с флагом блокировки.
   * Инкапсулирует бизнес-правило о блокировке суперадмина.
   * @returns {UserAccountStatus} Новый объект статуса.
   * @throws {Error} Если есть попытка заблокировать суперадмина.
   */
  public block(): UserAccountStatus {
    if (this.isSuperAdmin) {
      throw new Error('You cannot block a super admin.');
    }
    // Возвращаем новый экземпляр, а не мутируем текущий
    return new UserAccountStatus({ ...this, isBlocked: true });
  }

  public unblock(): UserAccountStatus {
    return new UserAccountStatus({ ...this, isBlocked: false });
  }

  public verify(): UserAccountStatus {
    return new UserAccountStatus({ ...this, verified: true });
  }

  /**
   * Сравнивает текущий объект статуса с другим.
   */
  public equals(other: UserAccountStatus): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return (
      this.isBlocked === other.isBlocked &&
      this.verified === other.verified &&
      this.isSuperAdmin === other.isSuperAdmin &&
      this.isDeactivated === other.isDeactivated &&
      this.hasPaidAccount === other.hasPaidAccount
    );
  }
}
