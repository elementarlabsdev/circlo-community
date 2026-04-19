import { BadRequestException } from '@nestjs/common';

/**
 * Интерфейс для свойств, описывающих временные метки.
 * Используется при восстановлении объекта из базы данных.
 */
export interface UserTimestampsProps {
  createdAt: Date;
  updatedAt: Date | null;
  lastActivityAt: Date | null;
  notificationsViewedAt: Date | null;
}

/**
 * Value Object для управления временными метками пользователя.
 * Обеспечивает неизменяемость и инкапсулирует логику обновления дат.
 */
export class UserTimestamps {
  public readonly createdAt: Date;
  public readonly updatedAt: Date | null;
  public readonly lastActivityAt: Date | null;
  public readonly notificationsViewedAt: Date | null;

  /**
   * Конструктор является приватным для обеспечения создания
   * экземпляров только через статические фабричные методы.
   */
  private constructor(props: UserTimestampsProps) {
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.lastActivityAt = props.lastActivityAt;
    this.notificationsViewedAt = props.notificationsViewedAt;
    Object.freeze(this);
  }

  /**
   * Статический фабричный метод для создания VО для нового пользователя.
   * Устанавливает `createdAt` и задает начальные значения null для остальных полей.
   */
  public static create(): UserTimestamps {
    return new UserTimestamps({
      createdAt: new Date(),
      updatedAt: null,
      lastActivityAt: null,
      notificationsViewedAt: null,
    });
  }

  /**
   * Статический фабричный метод для восстановления VО из базы данных.
   * Принимает существующие данные и создает из них объект.
   * @param props - Данные временных меток из хранилища.
   */
  public static reconstitute(props: UserTimestampsProps): UserTimestamps {
    // Пример бизнес-правила: дата обновления не может быть раньше даты создания.
    if (props.updatedAt && props.updatedAt < props.createdAt) {
      throw new BadRequestException(
        'Updated date cannot be earlier than the created date.',
      );
    }
    return new UserTimestamps(props);
  }

  /**
   * Возвращает новый экземпляр с обновленной датой `updatedAt` на текущее время.
   * Используется для отслеживания изменений в агрегате.
   */
  public touch(): UserTimestamps {
    // Возвращаем новый экземпляр, сохраняя остальные значения
    return new UserTimestamps({ ...this, updatedAt: new Date() });
  }

  /**
   * Возвращает новый экземпляр с обновленной датой последней активности.
   */
  public recordActivity(): UserTimestamps {
    return new UserTimestamps({ ...this, lastActivityAt: new Date() });
  }

  /**
   * Возвращает новый экземпляр с обновленной датой просмотра уведомлений.
   */
  public recordNotificationsViewed(): UserTimestamps {
    return new UserTimestamps({ ...this, notificationsViewedAt: new Date() });
  }

  /**
   * Сравнивает текущий объект с другим по значению.
   */
  public equals(other: UserTimestamps): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    // Сравниваем время в миллисекундах для корректного сравнения дат
    return (
      this.createdAt.getTime() === other.createdAt.getTime() &&
      this.updatedAt?.getTime() === other.updatedAt?.getTime() &&
      this.lastActivityAt?.getTime() === other.lastActivityAt?.getTime() &&
      this.notificationsViewedAt?.getTime() ===
        other.notificationsViewedAt?.getTime()
    );
  }
}
