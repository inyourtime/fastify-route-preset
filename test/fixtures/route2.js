'use strict'

/**
 * @type {import('fastify').FastifyPluginAsync<>}
 */
module.exports = async function (fastify) {
  fastify.post('/example/post', function (_req, reply) {
    reply.send({ hello: 'world' })
  })

  fastify.put('/example/put', function (_req, reply) {
    reply.send({ hello: 'world' })
  })
}
