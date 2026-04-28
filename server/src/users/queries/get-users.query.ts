import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { ErrorMessages } from '@common/constants';

export namespace GetUsersQuery {
  export class Params {
    private static readonly minPage = 1;
    private static readonly minUsersCount = 1;
    private static readonly maxUsersCount = 100;

    @ApiProperty({ example: 1, description: 'Номер страницы', default: 1, required: false })
    @Type(() => Number)
    @IsInt({ message: ErrorMessages.ru.MUST_BE_AN_INTEGER_NUMBER })
    @Min(Params.minPage, { message: ErrorMessages.ru.NUMERIC_MUST_NOT_BE_LESS_THAN_N.format(Params.minPage) })
    readonly page: number = 1;

    @ApiProperty({ example: 10, description: 'Количество пациентов внутри ответа', default: 10, required: false })
    @Type(() => Number)
    @IsInt({ message: ErrorMessages.ru.MUST_BE_AN_INTEGER_NUMBER })
    @Min(Params.minUsersCount, {
      message: ErrorMessages.ru.NUMERIC_MUST_NOT_BE_LESS_THAN_N.format(Params.minUsersCount),
    })
    @Max(Params.maxUsersCount, {
      message: ErrorMessages.ru.NUMERIC_MUST_NOT_BE_GREATER_THAN_N.format(Params.maxUsersCount),
    })
    readonly count: number = 10;

    constructor(page, count) {
      this.page = page;
      this.count = count;
    }
  }

  export namespace Swagger {
    export class GetUsersQueryParams extends Params {}
  }
}
