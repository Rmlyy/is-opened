const hostElem = document.getElementById('host')
const portElem = document.getElementById('port')
const resultElem = document.getElementById('result')
const submitBtnElem = document.getElementById('submit')
const submitBtnDefVal = submitBtnElem.value

document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    submitBtnElem.click()
  }
})

function handleError(msg) {
  resetBtn()
  resultElem.style.visibility = ''
  resultElem.style.color = 'red'

  resultElem.innerText = msg
}

function disableBtn() {
  submitBtnElem.disabled = true
  submitBtnElem.value = 'Please wait...'
}

function resetBtn() {
  submitBtnElem.disabled = false
  submitBtnElem.value = submitBtnDefVal
}

function parseData(inputStr) {
  const parsedObject = {}
  const lines = inputStr.split('\n')

  lines.forEach((line) => {
    const [key, value] = line.split('=')
    parsedObject[key] = value
  })

  return parsedObject
}

async function request(url, resType) {
  disableBtn()
  try {
    const res = await fetch(url)

    if (!res.ok) return null

    switch (resType) {
      case 'json':
        return res.json()
      case 'text':
        return res.text()
    }
  } catch (e) {
    console.log(e)
    return null
  } finally {
    resetBtn()
  }
}

async function main() {
  disableBtn()
  const host = hostElem.value
  const port = portElem.value

  if (!host) {
    return handleError('Please enter a valid public IP address or DNS.')
  }

  if (!port || isNaN(port) || port <= 0 || port > 65535) {
    return handleError('Please enter a valid port.')
  }

  const reqURL = `https://api.rmly.dev/connect/?target=${host}&port=${port}`
  const isOpened = await request(reqURL, 'json')

  if (!isOpened) {
    return handleError('There was an unknown error. Please try again later')
  }

  if (isOpened.status !== 'success' && isOpened.message) {
    return handleError(isOpened.message)
  }

  if (!isOpened.opened) {
    let msg = `Port ${port} is closed on ${host}`

    if (isOpened.query !== isOpened.address) msg += ` [${isOpened.address}]`

    return handleError(msg)
  }

  resultElem.style.visibility = ''
  resultElem.style.color = ''

  let msg = `Port <span class="green">${port}</span> is opened on <span class="green">${host}`

  if (isOpened.query !== isOpened.address) msg += ` [${isOpened.address}]</span>`
  else msg += '</span>'

  resultElem.innerHTML = msg
}

;(async () => {
  const res = await request('https://1.1.1.1/cdn-cgi/trace', 'text')

  if (!res) return

  const data = parseData(res)

  if (!data) return
  if (!data.ip) return

  hostElem.value = data.ip
})()
