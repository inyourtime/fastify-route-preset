import Fastify from 'fastify'
import type { RouteOptions } from 'fastify'
import { expect } from 'tstyche'
import fastifyRoutePreset from '../..'

const app = Fastify()

app.register(fastifyRoutePreset, {
  onPresetRoute: (routeOptions, presetOptions) => {
    expect<RouteOptions>().type.toBe(routeOptions)
    expect<unknown>().type.toBe(presetOptions)
  },
})

app.register(fastifyRoutePreset, {
  onPresetRoute: [
    (routeOptions, presetOptions) => {
      expect<RouteOptions>().type.toBe(routeOptions)
      expect<unknown>().type.toBe(presetOptions)
    },
  ],
})
