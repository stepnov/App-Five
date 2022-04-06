import { EntityRepository, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dayjs from 'dayjs';

import { Records } from '../entity/Records';
import { applyFilters, EntityQuery } from './utils';

@EntityRepository(Records)
export class RecordsRepository extends Repository<Records> {

    filter(query: EntityQuery<Records> | undefined, page: number, size: number): Promise<[Records[], number]> {
        const qb = this.createQueryBuilder('e');
        applyFilters(qb, query);
        return qb
            .skip((page - 1) * size)
            .take(size)
            .getManyAndCount();
    }
}
