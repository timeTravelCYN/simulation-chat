export function getRandomMsg (messages) {
  if (typeof messages === 'string' || !messages.length) {
    return messages
  }

  const id = Math.floor(Math.random() * messages.length)
  return messages[id]
}

export function delay (amount = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, amount)
  })
}

export function getMockMsgSize () {
  const $mockMsg = document.getElementById('mock-msg')
  return {
    width: $mockMsg.clientWidth,
    height: $mockMsg.clientHeight
  }
}

export function onImageLoad () {
  return new Promise(resolve => {
    const img = document.getElementById('mock-msg').getElementsByTagName('img')
    if (img.length === 0) {
      return resolve()
    }
    function imgLoad (img) {
      img.removeEventListener('load', imgLoad)
      img.complete && resolve()
    }
    Array.from(img).forEach(img => {
      img.addEventListener('load', imgLoad(img))
    })
  })
}

export function updateScroll () {
  const $chatbox = document.getElementById('mobile-body-content')
  const distance = $chatbox.scrollHeight - $chatbox.clientHeight + $chatbox.scrollTop
  const duration = 250
  const startTime = Date.now()

  requestAnimationFrame(function step () {
    const p = Math.min(1, (Date.now() - startTime) / duration)
    $chatbox.scrollTop = $chatbox.scrollTop + distance * p
    p < 1 && requestAnimationFrame(step)
  })
}
