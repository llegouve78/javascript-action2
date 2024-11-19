const core = require('@actions/core')
const github = require('@actions/github')
const https = require('https')

async function getCertificateExpiryDate(hostname) {
  try {
    const options = {
      hostname,
      port: 443,
      method: 'GET',
      rejectUnauthorized: false // Bypass SSL validation
    }

    const req = https.request(options, res => {
      const certificate = res.connection.getPeerCertificate()
      if (!certificate || !certificate.valid_to) {
        console.error('No certificate information available.')
        return
      }
      return `The certificate for ${hostname} expires on: ${certificate.valid_to}`
    })

    req.on('error', e => {
      return `Problem with request: ${e.message}`
    })

    req.end()
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
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

    const whoToGreet = core.getInput('who-to-greet', { required: true })
    //core.info(`Hello, ${whoToGreet}!`)

    core.info(getCertificateExpiryDate(`${whoToGreet}`))

    const response = await octokit.rest.issues.create({
      // owner: github.context.repo.owner
      //
      ...github.context.repo,
      title,
      body,
      assignees: assignees ? assignees.split('\n') : undefined
    })

    core.setOutput('issue', response.data)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
