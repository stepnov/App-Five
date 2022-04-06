import { EntityRepository, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dayjs from 'dayjs';

import { Projects } from '../entity/Projects';
import { applyFilters, EntityQuery } from './utils';

@EntityRepository(Projects)
export class ProjectsRepository extends Repository<Projects> {

    filter(query: EntityQuery<Projects> | undefined, page: number, size: number): Promise<[Projects[], number]> {
        const qb = this.createQueryBuilder('e');
        applyFilters(qb, query);
        return qb
            .skip((page - 1) * size)
            .take(size)
            .getManyAndCount();
    }
}
