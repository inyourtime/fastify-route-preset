import Fastify from 'fastify'
import type { RouteOptions } from 'fastify'
import { expect } from 'tstyche'
import fastifyRoutePreset from '../..'

const app = Fastify()

app.register(fastifyRoutePreset, {
  onPresetRoute: (routeOptions, presetOptions) => {
    expect(routeOptions).type.toBe<RouteOptions>()
    expect(presetOptions).type.toBe<unknown>()
  },
})

app.register(fastifyRoutePreset, {
  onPresetRoute: [
    (routeOptions, presetOptions) => {
      expect(routeOptions).type.toBe<RouteOptions>()
      expect(presetOptions).type.toBe<unknown>()
    },
  ],
})
