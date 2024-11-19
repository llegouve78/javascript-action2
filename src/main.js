const core = require('@actions/core')
const github = require('@actions/github')
const https = require('https')

async function getCertificateExpiryDate(hostname) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      method: 'GET',
      rejectUnauthorized: false // Bypass SSL validation
    }

    const req = https.request(options, res => {
      const certificate = res.connection.getPeerCertificate()
      if (!certificate || !certificate.valid_to) {
        //('No certificate information available.')
        reject(new Error('No certificate information available.'))
        return
      }
      resolve(
        `The certificate for ${hostname} expires on: ${certificate.valid_to}`
      )
    })

    req.on('error', e => {
      //reject(`Problem with request: ${e.message}`)
      reject(new Error(`Problem with request: ${e.message}`))
    })

    req.end()
  })
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const token = core.getInput('token')
    const title = core.getInput('title')
    const body = core.getInput('body')
    const assignees = core.getInput('assignees')

    const octokit = github.getOctokit(token)

    const whoToGreed = core.getInput('who-to-greed', { required: true })
    //core.info(`Hello, ${whoToGreet}!`)

    //core.info(getCertificateExpiryDate(`${whoToGreed}`))

    //const response = await octokit.rest.issues.create({
    //owner: github.context.repo.owner

    //...github.context.repo,
    //title,
    //body,
    //assignees: assignees ? assignees.split('\n') : undefined
    //who-to-greed:
    //})
    const expiryMessage = await getCertificateExpiryDate(`${whoToGreed}`)
    core.setOutput('checked', expiryMessage)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
