const { Build } = require('./db')
const { getBuilds } = require('./get-chromium-builds')
const Promise = require('bluebird')

function saveBuild(build) {
  return Build.create(build)
}

function scrape() {
  console.log('Getting builds')
  return getBuilds()
  .then(builds => {
    return Promise.map(builds, (build) => {
      console.log(`Getting downloads for Chromium ${build.version} ${build.channel} on ${build.os}`)
      return build.getDownloads()
      .then(downloads => {
        console.log(`Received downloads for Chromium ${build.version} ${build.channel} on ${build.os}`)
        build.downloads = downloads
        return build
      })
      .then(saveBuild)
      .catch(() => {
        console.error(`Had an error storing downloads for Chromium ${build.version} ${build.channel} on ${build.os}`)
        return
      })
    })
  })
}

function start() {
  return scrape()
  .then(() => {
    return Promise.delay(5 * 60 * 1000)
  })
  .then(start)
}

module.exports = {
  start
}
