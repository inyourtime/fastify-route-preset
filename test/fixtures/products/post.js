/**
 * @type {import('fastify').FastifyPluginAsync<>}
 */
export default async function (fastify) {
  fastify.post('/', function (_req, reply) {
    reply.send({ hello: 'world' })
  })
}

export const autoConfig = {
  preset: {
    schema: { tags: ['product'] },
    constraints: { version: '1.0.0' },
  },
}
