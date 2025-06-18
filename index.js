'use strict'

const fp = require('fastify-plugin')

const kRoutePreset = Symbol('fastifyRoutePreset')

/**
 * @type {import('fastify').FastifyPluginCallback<import('.').FastifyRoutePresetOptions>}
 */
function plugin(fastify, pluginOptions, next) {
  fastify.decorate(kRoutePreset, null)

  let onPresetRouteFns = pluginOptions.onPresetRoute

  if (typeof onPresetRouteFns === 'function') {
    onPresetRouteFns = [onPresetRouteFns]
  } else if (
    !Array.isArray(onPresetRouteFns) ||
    !onPresetRouteFns.every((fn) => typeof fn === 'function')
  ) {
    return next(new TypeError('"onPresetRoute" must be a function or array of functions'))
  }

  fastify.addHook('onRegister', function (instance, registerOptions) {
    if (registerOptions.preset) {
      instance[kRoutePreset] = {
        ...instance[kRoutePreset],
        ...registerOptions.preset,
      }
    }
  })

  fastify.addHook('onRoute', function (routeOptions) {
    if (this[kRoutePreset] && !routeOptions.config?.skipPreset) {
      for (const fn of onPresetRouteFns) {
        fn(routeOptions, this[kRoutePreset])
      }
    }
  })

  next()
}

const fastifyRoutePreset = fp(plugin, {
  fastify: '5.x',
  name: 'fastify-route-preset',
})

module.exports = fastifyRoutePreset
module.exports.default = fastifyRoutePreset
module.exports.fastifyRoutePreset = fastifyRoutePreset
