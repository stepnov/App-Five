import { FastifyInstance } from 'fastify'
import { getCustomRepository, Like } from 'typeorm';
import * as TypeBox from '@sinclair/typebox';
import { validate as isValidUUID } from 'uuid';

import { RecordsRepository } from '../repository/RecordsRepository';
import { newRecordsSchema, recordsSchema } from '../entity/Records';

export const tag = 'Records';

export default async (app: FastifyInstance) => {
    const schema = TypeBox.Type.Object({
        q: TypeBox.Type.Optional(TypeBox.Type.Partial(recordsSchema, { description: 'Filter query', additionalProperties: false })),
        page: TypeBox.Type.Number({ default: 1, minimum: 1, description: 'Page number' }),
        limit: TypeBox.Type.Number({ minimum: 0, maximum: 20, default: 10, description: 'Page size' }),
    }, {
        style: 'deepObject',
    });

    app.get<{ Querystring: TypeBox.Static<typeof schema> }>('/records', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAuthorized]),
        schema: {
            querystring: schema,
            security: [{
                bearerAuth: [],
            }],
            tags: [tag],
            summary: 'List records',
        },
    }, async (req) => {
        // @ts-ignore
        const [items, count] = await getCustomRepository(RecordsRepository).filter(req.query.q, req.query.page, req.query.limit);
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
    }>('/records/autocomplete', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAuthorized]),
        schema: {
            querystring: autocompleteSchema,
            security: [{
                bearerAuth: [],
            }],
            tags: [tag],
            summary: 'Find records instance to link as relations',
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
        const repo = getCustomRepository(RecordsRepository);

        if (isValidUUID(req.query.query)) {
            const item = await repo.findOne(req.query.query);
            return item ? [{ id: item.id, label: item.task }] : [];
        } else {
            const items = await repo.find({
                where: {
                    task: Like(`%${req.query.query}%`),
                },
                order: {
                    task: 'ASC',
                },
            });
            return items.map(item => ({ id: item.id, label: item.task }));
        }
    });

    const postPayload = TypeBox.Type.Object({
        data: newRecordsSchema,
    });
    app.post<{
        Body: TypeBox.Static<typeof postPayload>,
        Reply: TypeBox.Static<typeof recordsSchema>
    }>('/records', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAuthorized]),
        schema: {
            security: [{
                bearerAuth: [],
            }],
            tags: [tag],
            summary: 'Create new records',
            body: postPayload,
            response: {
                200: recordsSchema,
                400: TypeBox.Type.Object({
                    statusCode: TypeBox.Type.Number({ default: 400 }),
                    error: TypeBox.Type.Optional(TypeBox.Type.String()),
                    message: TypeBox.Type.String(),
                }, { description: 'Validation error' }),
            },
        },
    }, async (req, reply) => {
        const repo = getCustomRepository(RecordsRepository);
        return repo.save(req.body.data);
    });

    const find = TypeBox.Type.Object({
        id: TypeBox.Type.String({
            format: 'uuid',
        }),
    });

    app.get<{
        Params: TypeBox.Static<typeof find>,
        Reply: TypeBox.Static<typeof recordsSchema>
    }>('/records/:id', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAuthorized]),
        schema: {
            params: find,
            tags: [tag],
            summary: 'Get specific records',
            security: [{
                bearerAuth: [],
            }],
            response: {
                200: recordsSchema,
                404: TypeBox.Type.Object({
                    statusCode: TypeBox.Type.Number({ default: 404 }),
                    error: TypeBox.Type.String({ default: 'Not Found' }),
                    message: TypeBox.Type.String(),
                }, { description: 'Records not found' }),
            },
        }
    // @ts-ignore
    }, async (req, reply) => {
        const entity = await getCustomRepository(RecordsRepository).findOne({
            where: {
                id: req.params.id,
            },
        });

        return entity ? entity : reply.notFound('Records not found');
    });

    const putSchema = TypeBox.Type.Object({
        id: TypeBox.Type.String({ format: 'uuid' }),
        data: TypeBox.Type.Partial(newRecordsSchema),
    });
    app.put<{
        Params: TypeBox.Static<typeof find>,
        Body: TypeBox.Static<typeof putSchema>,
    }>('/records/:id', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAdmin]),
        schema: {
            summary: 'Edit existing records',
            params: find,
            body: putSchema,
            tags: [tag],
            security: [{
                bearerAuth: [],
            }],
        }
    }, async (req, reply) => {
        return getCustomRepository(RecordsRepository).save({
            ...req.body.data,
            id: req.params.id,
        });
    });

    app.delete<{
        Params: TypeBox.Static<typeof find>,
    }>('/records/:id', {
        // @ts-ignore
        preHandler: app.auth([app.verifyAdmin]),
        schema: {
            description: 'Delete records',
            summary: 'Delete records',
            params: find,
            tags: [tag],
            security: [{
                bearerAuth: [],
            }],
            response: {
                200: {
                    description: 'records successfully deleted',
                    type: 'null',
                },
                404: TypeBox.Type.Object({
                    statusCode: TypeBox.Type.Number({ default: 404 }),
                    error: TypeBox.Type.String({ default: 'Not Found' }),
                    message: TypeBox.Type.String(),
                }, { description: 'records not found' }),
            },
        }
    }, async (req, reply) => {
        const entity = await getCustomRepository(RecordsRepository).softDelete(req.params.id);
        if (!entity.affected) {
            reply.notFound('records not found');
            return;
        }

        reply.code(200).send();
    });
}
