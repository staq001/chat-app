const socket = io()
// // this will allow us to sen and receive event from the client to the server and otherwise.

// socket.on('countUpdated', (count) => {
//   // it's important that name picked here matches the one in socket.emit on the server.
//   console.log('The count has been updated!', count)
//   // count as an argument receives the value for count that was served to the server.

// }) // if we refresh the html page at this juncture, it must print that to the browser console.
// // accepts two arguments


// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked!')
//   socket.emit('increment')
// })

// Elements
const $messageForm = document.querySelector('#message-form')
const $messsageFormInput = $messageForm.querySelector('input')
const $messsageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const $urlTemplate = document.querySelector('#url-template').innerHTML
const messageTemplate = document.querySelector('#message-template').innerHTML
// this gives us access to HTML elements present in the messageTemplate. // div and p
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) // for parsing the query string in the url. ignoreQueryPrefix makes sure the question mark goes away.

const autoscroll = () => {
  // New message element.
  const $newMessage = $messages.lastElementChild
  // lastElementChild will grab the last child property

  // Height of the new message.
  const newMessageStyle = getComputedStyle($newMessage)
  // getting the computed style of the element-- so we know what the margin-bottom spacing is.
  const newMessageMargin = parseInt(newMessageStyle.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  // this grabs the height of message except that it doesn't take into account the margin + newMessageMargin

  // Visible Height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const containerHeight = $messages.scrollHeight

  // How far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight
  // gives us the amount of scroll distance we've scrolled from the top

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }


  // console.log(newMessageStyle)
  // console.log(newMessageMargin)
}

socket.on('message', (object) => {
  console.log(object)
  const html = Mustache.render(messageTemplate, {
    username: object.username,
    message: object.text,
    createdAt: moment(object.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)

  autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  // disable button
  $messsageFormButton.setAttribute('disabled', 'disabled')

  const message = e.target.elements.message.value
  //less likely to break-- using the name on the input element

  socket.emit('sendMessage', message, (error) => {
    // re-enable button
    $messsageFormButton.removeAttribute('disabled')
    $messsageFormInput.value = ''
    $messsageFormInput.focus() // adding the focus back to the input.

    if (error) {
      return console.log(error)
    }

    console.log('Message delivered!')
  })
})


socket.on('sendMessage', (message) => {
  console.log(message)
})



$locationButton.addEventListener('click', () => {
  // always remember the not all browsers support geolocation so we consider them when writing our code.
  $locationButton.setAttribute('disabled', 'disabled')
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.')
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      console.log('Location shared successfully!')
      $locationButton.removeAttribute('disabled')
    })
  })
})

socket.on('locationMessage', (object) => {
  console.log(object)

  const html = Mustache.render($urlTemplate, {
    username: object.username,
    url: object.text,
    createdAt: moment(object.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  // document.getElementById('url').href = url
})

socket.on('roomData', ({ room, users }) => {
  // console.log(room)
  // console.log(users)

  const html = Mustache.render(sideBarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})