import { FastifyInstance } from 'fastify'
import { getCustomRepository, Like } from 'typeorm';
import * as TypeBox from '@sinclair/typebox';
import { validate as isValidUUID } from 'uuid';

import { ProjectsRepository } from '../repository/ProjectsRepository';
import { newProjectsSchema, projectsSchema } from '../entity/Projects';

export const tag = 'Projects';

export default async (app: FastifyInstance) => {
    const schema = TypeBox.Type.Object({
        q: TypeBox.Type.Optional(TypeBox.Type.Partial(projectsSchema, { description: 'Filter query', additionalProperties: false })),
        page: TypeBox.Type.Number({ default: 1, minimum: 1, description: 'Page number' }),
        limit: TypeBox.Type.Number({ minimum: 0, maximum: 20, default: 10, description: 'Page size' }),
    }, {
        style: 'deepObject',
    });

    app.get<{ Querystring: TypeBox.Static<typeof schema> }>('/projects', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAuthorized]),
        schema: {
            querystring: schema,
            security: [{
                bearerAuth: [],
            }],
            tags: [tag],
            summary: 'List projects',
        },
    }, async (req) => {
        // @ts-ignore
        const [items, count] = await getCustomRepository(ProjectsRepository).filter(req.query.q, req.query.page, req.query.limit);
        return {
            rows: items,
            count,
            isLastPage: (req.query.page + 1) * req.query.limit >= count,
        };
    });

    const autocompleteSchema = TypeBox.Type.Object({
        query: TypeBox.Type.String({ default: '' }),
        limit: TypeBox.Type.Number({ default: 100, max: 100, min: 1 }),
    });
    const autocompleteItems = TypeBox.Type.Array(TypeBox.Type.Object({
        id: TypeBox.Type.String(),
        label: TypeBox.Type.String(),
    }));

    app.get<{
        Querystring: TypeBox.Static<typeof autocompleteSchema>,
        Reply: TypeBox.Static<typeof autocompleteItems>,
    }>('/projects/autocomplete', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAuthorized]),
        schema: {
            querystring: autocompleteSchema,
            security: [{
                bearerAuth: [],
            }],
            tags: [tag],
            summary: 'Find projects instance to link as relations',
            response: {
                200: autocompleteItems,
                400: TypeBox.Type.Object({
                    statusCode: TypeBox.Type.Number({ default: 400 }),
                    error: TypeBox.Type.Optional(TypeBox.Type.String()),
                    message: TypeBox.Type.String(),
                }, { description: 'Validation error' }),
            }
        },
    }, async (req) => {
        const repo = getCustomRepository(ProjectsRepository);

        if (isValidUUID(req.query.query)) {
            const item = await repo.findOne(req.query.query);
            return item ? [{ id: item.id, label: item.name }] : [];
        } else {
            const items = await repo.find({
                where: {
                    name: Like(`%${req.query.query}%`),
                },
                order: {
                    name: 'ASC',
                },
            });
            return items.map(item => ({ id: item.id, label: item.name }));
        }
    });

    const postPayload = TypeBox.Type.Object({
        data: newProjectsSchema,
    });
    app.post<{
        Body: TypeBox.Static<typeof postPayload>,
        Reply: TypeBox.Static<typeof projectsSchema>
    }>('/projects', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAuthorized]),
        schema: {
            security: [{
                bearerAuth: [],
            }],
            tags: [tag],
            summary: 'Create new projects',
            body: postPayload,
            response: {
                200: projectsSchema,
                400: TypeBox.Type.Object({
                    statusCode: TypeBox.Type.Number({ default: 400 }),
                    error: TypeBox.Type.Optional(TypeBox.Type.String()),
                    message: TypeBox.Type.String(),
                }, { description: 'Validation error' }),
            },
        },
    }, async (req, reply) => {
        const repo = getCustomRepository(ProjectsRepository);
        return repo.save(req.body.data);
    });

    const find = TypeBox.Type.Object({
        id: TypeBox.Type.String({
            format: 'uuid',
        }),
    });

    app.get<{
        Params: TypeBox.Static<typeof find>,
        Reply: TypeBox.Static<typeof projectsSchema>
    }>('/projects/:id', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAuthorized]),
        schema: {
            params: find,
            tags: [tag],
            summary: 'Get specific projects',
            security: [{
                bearerAuth: [],
            }],
            response: {
                200: projectsSchema,
                404: TypeBox.Type.Object({
                    statusCode: TypeBox.Type.Number({ default: 404 }),
                    error: TypeBox.Type.String({ default: 'Not Found' }),
                    message: TypeBox.Type.String(),
                }, { description: 'Projects not found' }),
            },
        }
    // @ts-ignore
    }, async (req, reply) => {
        const entity = await getCustomRepository(ProjectsRepository).findOne({
            where: {
                id: req.params.id,
            },
        });

        return entity ? entity : reply.notFound('Projects not found');
    });

    const putSchema = TypeBox.Type.Object({
        id: TypeBox.Type.String({ format: 'uuid' }),
        data: TypeBox.Type.Partial(newProjectsSchema),
    });
    app.put<{
        Params: TypeBox.Static<typeof find>,
        Body: TypeBox.Static<typeof putSchema>,
    }>('/projects/:id', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAdmin]),
        schema: {
            summary: 'Edit existing projects',
            params: find,
            body: putSchema,
            tags: [tag],
            security: [{
                bearerAuth: [],
            }],
        }
    }, async (req, reply) => {
        return getCustomRepository(ProjectsRepository).save({
            ...req.body.data,
            id: req.params.id,
        });
    });

    app.delete<{
        Params: TypeBox.Static<typeof find>,
    }>('/projects/:id', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAdmin]),
        schema: {
            description: 'Delete projects',
            summary: 'Delete projects',
            params: find,
            tags: [tag],
            security: [{
                bearerAuth: [],
            }],
            response: {
                200: {
                    description: 'projects successfully deleted',
                    type: 'null',
                },
                404: TypeBox.Type.Object({
                    statusCode: TypeBox.Type.Number({ default: 404 }),
                    error: TypeBox.Type.String({ default: 'Not Found' }),
                    message: TypeBox.Type.String(),
                }, { description: 'projects not found' }),
            },
        }
    }, async (req, reply) => {
        const entity = await getCustomRepository(ProjectsRepository).softDelete(req.params.id);
        if (!entity.affected) {
            reply.notFound('projects not found');
            return;
        }

        reply.code(200).send();
    });
}
