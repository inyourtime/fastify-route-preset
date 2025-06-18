# fastify-route-preset

[![CI](https://github.com/inyourtime/fastify-route-preset/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/inyourtime/fastify-route-preset/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/fastify-route-preset.svg?style=flat)](https://www.npmjs.com/package/fastify-route-preset)

A Fastify plugin that streamlines route configuration through preset-based modifications. Define reusable route patterns and apply them consistently across your application using `onRoute` hooks.

## Overview

This plugin enables you to create preset configurations that can be applied to multiple routes, eliminating repetitive route setup and ensuring consistency across your API endpoints.

## Installation

```bash
npm install fastify-route-preset
```

## Compatibility

| Plugin Version | Fastify Version |
|:--------------:|:---------------:|
| `>=0.x`        | `^5.x`          |

## Usage

The `fastify-route-preset` plugin works by leveraging Fastify's `onRoute` hook to intercept route registration and apply preset configurations. This allows you to define common route properties once and reuse them across multiple routes, promoting consistency and reducing code duplication.

```javascript
import Fastify from 'fastify'
import fastifyRoutePreset from 'fastify-route-preset'

const fastify = Fastify()

// Register the plugin
fastify.register(fastifyRoutePreset, {
  onPresetRoute: (routeOptions, presetOptions) => {
    // Merge preset schema with route schema
    routeOptions.schema = {
      ...presetOptions.schema,
      ...routeOptions.schema,
    }
  }
})

// Apply preset to route group
fastify.register(async function (fastify) {
  fastify.get('/users', async (request, reply) => {
    return { users: [] }
  })
  
  fastify.post('/users', async (request, reply) => {
    return { created: true }
  })
}, {
  preset: {
    schema: { 
      tags: ['users'],
      security: [{ bearerAuth: [] }]
    }
  }
})

await fastify.listen({ port: 3000 })

// Result: Both routes will have the preset schema applied
// [
//   {
//     method: 'GET',
//     url: '/users',
//     schema: {
//       tags: [ 'users' ],
//       security: [ { bearerAuth: [] } ]
//     }
//   },
//   {
//     method: 'POST',
//     url: '/users',
//     schema: {
//       tags: [ 'users' ],
//       security: [ { bearerAuth: [] } ]
//     }
//   }
// ]
```

In this example, instead of manually adding `tags: ['users']` and `security: [{ bearerAuth: [] }]` to each route, the preset automatically applies these properties to all routes within the registration context.

## Using with @fastify/autoload

The `fastify-route-preset` plugin works seamlessly with [`@fastify/autoload`](https://github.com/fastify/fastify-autoload) for automatic route discovery and registration. You can define presets in your route files using the `autoConfig` export, making it easy to organize and configure routes across your application.

### Route File Configuration

Create route files with the `autoConfig` export to define presets:

```javascript
// routes/user.js
export default async function (fastify) {
  fastify.get('/', (_req, reply) => {
    reply.send('hello world')
  })

  fastify.post('/', (_req, reply) => {
    reply.send('hello world')
  })
}

export const autoConfig = {
  prefix: '/user',
  preset: {
    schema: { tags: ['user'] },
    constraints: { version: '1.0.0' },
  },
}

// index.js
// Register autoload to automatically discover and load routes
fastify.register(fastifyAutoload, {
  dir: join(__dirname, 'routes'),
  dirNameRoutePrefix: false,
})
```

The resulting routes will have the preset configurations automatically applied:

```javascript
// Generated routes for user.js:
// GET /user/ - with tags: ['user'], version: '1.0.0'
// POST /user/ - with tags: ['user'], version: '1.0.0'
```

## Ignoring Preset for Specific Routes

Presets are applied by default; set `skipPreset: true` to opt out

```javascript
fastify.get('/ignore', { config: { skipPreset: true } }, () => {})
```

## Advanced Usage

### Multiple Handlers

Apply multiple transformations by providing an array of handlers:

```javascript
const presetSchema = (routeOptions, presetOptions) => {
  if (presetOptions.schema) {
    routeOptions.schema = {
      ...presetOptions.schema,
      ...routeOptions.schema,
    }
  }
}

const presetConstraint = (routeOptions, presetOptions) => {
  if (presetOptions.constraints) {
    routeOptions.constraints = {
      ...presetOptions.constraints,
      ...routeOptions.constraints,
    }
  }
}

const presetPreHandler = (routeOptions, presetOptions) => {
  if (presetOptions.preHandler) {
    const existingPreHandler = routeOptions.preHandler || []
    routeOptions.preHandler = [
      ...(Array.isArray(existingPreHandler) ? existingPreHandler : [existingPreHandler]),
      ...(Array.isArray(presetOptions.preHandler)
        ? presetOptions.preHandler
        : [presetOptions.preHandler]),
    ]
  }
}

// Register the plugin
fastify.register(fastifyRoutePreset, {
  onPresetRoute: [
    // Handler 1: Apply schema defaults
    presetSchema,
    // Handler 2: Apply constraints
    presetConstraint,
    // Handler 3: Apply hooks
    presetPreHandler,
  ],
})
```

### Complex Preset Example

```javascript
// Register routes with comprehensive preset
fastify.register(async function (fastify) {
  fastify.get('/admin/users', {
    handler: async (request, reply) => {
      return { adminUsers: [] }
    }
  })
  
  fastify.delete('/admin/users/:id', {
    handler: async (request, reply) => {
      return { deleted: true }
    }
  })
}, {
  preset: {
    schema: {
      tags: ['admin'],
      security: [{ adminAuth: [] }]
    },
    constraints: {
      version: '2.0.0'
    },
    preHandler: [
      async (request, reply) => {
        // Admin authentication logic
        if (!request.user?.isAdmin) {
          throw new Error('Admin required')
        }
      }
    ]
  }
})
```

## API Reference

### Plugin Registration Options

```typescript
interface FastifyRoutePresetOptions {
  onPresetRoute: OnPresetRoute | OnPresetRoute[]
}

type OnPresetRoute = (
  routeOptions: RouteOptions,
  presetOptions: any
) => void
```

**Parameters:**

- `onPresetRoute`: Function or array of functions called when registering routes with presets
  - `routeOptions`: Fastify route options object (mutable)
  - `presetOptions`: Preset configuration object

### Route Registration

When registering routes, include a `preset` option:

```javascript
fastify.register(routePlugin, {
  preset: {
    // Your preset configuration
    schema: { /* OpenAPI schema */ },
    constraints: { /* route constraints */ },
    preHandler: [ /* hooks */ ],
    // ... any other route options
  }
})
```

## Common Use Cases

### API Versioning

```javascript
import v1Routes from './routes/v1.js'

fastify.register(v1Routes, {
  preset: {
    constraints: { version: '1.0.0' },
    schema: { tags: ['v1'] }
  }
})
```

### Authentication Presets

```javascript
import { authMiddleware } from './middleware/auth.js'
import protectedRoutes from './routes/protected.js'

fastify.register(protectedRoutes, {
  preset: {
    preHandler: [authMiddleware],
    schema: {
      security: [{ bearerAuth: [] }]
    }
  }
})
```

### Documentation Grouping

```javascript
import userRoutes from './routes/users.js'

fastify.register(userRoutes, {
  preset: {
    schema: {
      tags: ['users'],
      description: 'User management endpoints'
    }
  }
})
```

## Contributing

Contributions are welcome!

## License

MIT
