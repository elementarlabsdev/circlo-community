export class Setting<T> {
  constructor(
    public readonly name: string,
    public readonly data: T,
  ) {}
}
