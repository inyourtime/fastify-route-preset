import type { RouteOptions } from 'fastify'
import Fastify from 'fastify'
import fastifyRoutePreset, {
  fastifyRoutePreset as namedFastifyRoutePreset,
} from 'fastify-route-preset'
import { expect } from 'tstyche'

const app = Fastify()

app.register(fastifyRoutePreset, {
  onPresetRoute: (routeOptions, presetOptions) => {
    expect(routeOptions).type.toBe<RouteOptions>()
    expect(presetOptions).type.toBe<any>()
  },
  skipHeadRoutes: true,
})

app.register(fastifyRoutePreset, {
  onPresetRoute: [
    (routeOptions, presetOptions) => {
      expect(routeOptions).type.toBe<RouteOptions>()
      expect(presetOptions).type.toBe<any>()
    },
  ],
  skipHeadRoutes: false,
})

app.register(fastifyRoutePreset, {
  onPresetRoute: (routeOptions, presetOptions: { schema: { tags: string[] } }) => {
    expect(routeOptions).type.toBe<RouteOptions>()
    expect(presetOptions.schema).type.toBe<{ tags: string[] }>()
  },
})

interface PresetOptions {
  schema: {
    tags: string[]
  }
  constraints: {
    version: string
  }
}

app.register(fastifyRoutePreset, {
  onPresetRoute: (routeOptions, presetOptions: PresetOptions) => {
    expect(routeOptions).type.toBe<RouteOptions>()
    expect(presetOptions).type.toBe<PresetOptions>()
  },
})

app.register(namedFastifyRoutePreset, {
  onPresetRoute: [],
})

app.get('/foo', { config: { skipPreset: true } }, () => {})
