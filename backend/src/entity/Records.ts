import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    DeleteDateColumn,
    CreateDateColumn,
    UpdateDateColumn,

    OneToOne,
    JoinColumn,

} from 'typeorm';
import * as TypeBox from '@sinclair/typebox';

import { Users, usersSchema } from './Users';

import { Projects, projectsSchema } from './Projects';

export enum Record_type {

        Marketing = 'marketing',

        Development = 'development',

        Research = 'research',

}

/**
 * Schema for records entity
 */
export const recordsSchema = TypeBox.Type.Object({
    id: TypeBox.Type.String({ format: 'uuid' }),

        task: TypeBox.Type.String({ default: '' }),

        hours: TypeBox.Type.Number({ default: 0 }),

        user: TypeBox.Type.Optional(usersSchema),

        submitted: TypeBox.Type.Boolean({ default: false }),

        project: TypeBox.Type.Optional(projectsSchema),

        record_type: TypeBox.Type.Enum(Record_type),

});

/**
 * Schema for creating a new records
 */
export const newRecordsSchema = TypeBox.Type.Omit(
    recordsSchema,
    // remove metadata fields
    ['id'],
    { additionalProperties: false },
);

@Entity()
export class Records implements Omit<TypeBox.Static<typeof recordsSchema>, 'user' | 'project'> {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

        @Column({ default: '' })
        task!: string;

        @Column({ type: 'decimal', default: 0 })
        hours!: number;

        @OneToOne(() => Users, { eager: true, cascade: true })
    @JoinColumn()
        user?: Users;

        @Column({ default: false })
        submitted!: boolean;

        @OneToOne(() => Projects, { eager: true, cascade: true })
    @JoinColumn()
        project?: Projects;

        @Column({ type: 'enum', enum: Record_type })
        record_type!: Record_type;

}
