import type { FastifyPluginCallback, RouteOptions } from 'fastify'

declare module 'fastify' {
  interface FastifyContextConfig {
    /**
     * If set to `true`, the route will not be registered with a preset configuration.
     */
    skipPreset?: boolean
  }
}

type FastifyRoutePreset = FastifyPluginCallback<fastifyRoutePreset.FastifyRoutePresetOptions>

declare namespace fastifyRoutePreset {
  export interface FastifyRoutePresetOptions {
    /**
     * If set to `true`, HEAD routes will not be registered with a preset configuration.
     * Skips both auto-exposed HEADs and user-declared HEAD routes.
     *
     * @default false
     */
    skipHeadRoutes?: boolean
    /**
     * A function or array of functions that will be called when a route is registered with a preset.
     * The function will be called with the route options and the preset options.
     * 
     * @example
     * ```js
     * fastify.register(fastifyRoutePreset, {
     *   onPresetRoute: (routeOptions, presetOptions) => {
     *     console.log(routeOptions)
     *     console.log(presetOptions)
     *   },
     })
     * ```
     */
    onPresetRoute: OnPresetRoute | OnPresetRoute[]
  }

  export type OnPresetRoute = (routeOptions: RouteOptions, presetOptions: any) => void

  export const fastifyRoutePreset: FastifyRoutePreset
  export { fastifyRoutePreset as default }
}

declare function fastifyRoutePreset(
  ...params: Parameters<FastifyRoutePreset>
): ReturnType<FastifyRoutePreset>

export = fastifyRoutePreset
