/**
 * @type {import('fastify').FastifyPluginAsync<>}
 */
export default async function (fastify) {
  fastify.get('/', function (_req, reply) {
    reply.send({ hello: 'world' })
  })
}

export const autoConfig = {
  preset: {
    schema: { tags: ['user'] },
    constraints: { version: '1.0.0' },
  },
}
