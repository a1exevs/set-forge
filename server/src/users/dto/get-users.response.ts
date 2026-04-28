import { ApiProperty } from '@nestjs/swagger';

export namespace GetUsersResponse {
  export class Avatar {
    @ApiProperty()
    readonly small: string;

    @ApiProperty()
    readonly large: string;
  }

  export class User {
    @ApiProperty()
    readonly id: number;

    @ApiProperty()
    readonly email: string;

    @ApiProperty()
    readonly status: string;

    @ApiProperty()
    readonly followed: boolean;

    @ApiProperty()
    readonly avatar: Avatar;

    constructor(props: User) {
      this.id = props.id;
      this.email = props.email;
      this.status = props.status;
      this.followed = props.followed;
      this.avatar = props.avatar;
    }
  }

  export class Data {
    @ApiProperty({ type: () => [Swagger.GetUsersResponseUser], description: 'Массив пользователей' })
    readonly items?: User[] = null;

    @ApiProperty({ type: Number, example: '1234', description: 'Общее количество пользователей' })
    readonly totalCount?: number = 0;

    @ApiProperty({ type: String, example: '1234', description: 'Максимальный размер страницы - 100 пользователей' })
    readonly error?: string = null;

    constructor(props: Data) {
      this.items = props.items;
      this.totalCount = props.totalCount;
      this.error = props.error;
    }
  }

  export namespace Swagger {
    export class GetUsersResponseData extends Data {}

    export class GetUsersResponseUser extends User {}
  }
}
