const presetSchema = (routeOptions, preset) => {
  routeOptions.schema = {
    ...preset.schema,
    ...routeOptions.schema,
  }
}

const presetVersion = (routeOptions, preset) => {
  routeOptions.constraints = {
    ...preset.constraints,
    ...routeOptions.constraints,
  }
}

export { presetSchema, presetVersion }
