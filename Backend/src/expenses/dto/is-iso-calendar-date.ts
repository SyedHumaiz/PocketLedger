import { registerDecorator, type ValidationOptions } from 'class-validator';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function IsIsoCalendarDate(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'isIsoCalendarDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || !isoDatePattern.test(value)) {
            return false;
          }

          const parsedDate = new Date(`${value}T00:00:00.000Z`);
          return (
            !Number.isNaN(parsedDate.getTime()) &&
            parsedDate.toISOString().slice(0, 10) === value
          );
        },
      },
    });
  };
}
