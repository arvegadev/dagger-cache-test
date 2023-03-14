
import { connect } from "@dagger.io/dagger"

connect(async (client) => {

  // create a cache volume
  const nodeCache = client.cacheVolume("node")

  // use a node:16-slim container
  // mount the source code directory on the host
  // at /src in the container
  const source = client.container()
    .from("node:19")
    .withMountedDirectory('/src', client.host().directory('.'))

  // set the working directory in the container
  // install application dependencies
  const runner = source
    .withWorkdir("/src")
    .withExec(["npm", "install"])

  // run application tests
  const test = runner
    .withExec(["npm", "run", "test"])

  // first stage
  // build application
  const buildDir = test
    .withExec(["npm", "run", "compile"])
    .directory("./build")

  // second stage
  // use an node:19-alpine container
  // copy the build/ directory from the first stage
  // publish the resulting container to a registry
  const imageRef = await client.container()
    .from("node:19-alpine")
    .withDirectory('/app', buildDir)
    .publish(`${process.env['DOCKER_USERNAME']}/${process.env['DOCKER_IMAGE']}:${Math.random().toString(36).substring(2, 15)}`)

  console.log(`Published image to: ${imageRef}`)

}, { LogOutput: process.stdout })
