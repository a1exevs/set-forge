import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { SetUserContactRequest } from '@profiles/dto';
import { UserContact } from '@profiles/user-contacts.model';

@Injectable()
export class UserContactsService {
  constructor(@InjectModel(UserContact) private contactRepository: typeof UserContact) {}

  public async getContactsByUserId(userId: number): Promise<UserContact> {
    return this.contactRepository.findOne({ where: { userId } });
  }

  public async setContacts(userId: number, dto: SetUserContactRequest.Dto) {
    await this.contactRepository.upsert({ userId, ...dto }, { returning: true });
    return this.getContactsByUserId(userId);
  }
}
