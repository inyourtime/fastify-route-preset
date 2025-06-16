/**
 * @type {import('fastify').FastifyPluginAsync<>}
 */
export default async function (fastify) {
  fastify.get('/', (_req, reply) => {
    reply.send('hello world')
  })

  fastify.post('/', (_req, reply) => {
    reply.send('hello world')
  })
}

export const autoConfig = {
  prefix: '/product',
  preset: {
    schema: { tags: ['product'] },
    constraints: { version: '1.0.0' },
  },
}
