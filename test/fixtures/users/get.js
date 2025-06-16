'use strict'

/**
 * @type {import('fastify').FastifyPluginAsync<>}
 */
module.exports = async function (fastify) {
  fastify.get('/', function (_req, reply) {
    reply.send({ hello: 'world' })
  })
}

module.exports.autoConfig = {
  preset: {
    schema: { tags: ['user'] },
    constraints: { version: '1.0.0' },
  },
}
