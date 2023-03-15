import { connect } from "@dagger.io/dagger"

connect(async (client) => {

  // use a node:19 container
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
    .directory("./dist")

  if(process.env['RUNNING_ON_PIPELINE']){

    // second stage
    // use an node:19-alpine container
    // copy the build/ directory from the first stage
    // publish the resulting container to a registry
    const imageRef = await client.container()
    .from("node:19-alpine")
    .withDirectory('/app', buildDir)
    .publish(`${process.env['DOCKER_USERNAME']}/${process.env['DOCKER_IMAGE']}:latest`)

    console.log(`☁️ Published image to: ${imageRef}`)

  } else {

    console.log("💻 Running locally, skipping publish step...")

    await test.stdout()

  }

}, { LogOutput: process.stdout })
