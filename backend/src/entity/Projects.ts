import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    DeleteDateColumn,
    CreateDateColumn,
    UpdateDateColumn,

} from 'typeorm';
import * as TypeBox from '@sinclair/typebox';

/**
 * Schema for projects entity
 */
export const projectsSchema = TypeBox.Type.Object({
    id: TypeBox.Type.String({ format: 'uuid' }),

        name: TypeBox.Type.String({ default: '' }),

        rate: TypeBox.Type.Number({ default: 0 }),

});

/**
 * Schema for creating a new projects
 */
export const newProjectsSchema = TypeBox.Type.Omit(
    projectsSchema,
    // remove metadata fields
    ['id'],
    { additionalProperties: false },
);

@Entity()
export class Projects implements TypeBox.Static<typeof projectsSchema> {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

        @Column({ default: '' })
        name!: string;

        @Column({ type: 'decimal', default: 0 })
        rate!: number;

}
