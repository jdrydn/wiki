# Calendar Platform (Idea)

The following are some example usage queries to how I think a GraphQL Backend-API should work for a Calendar App.
Properties and names are not fixed, and feedback on any of this is welcome!

```graphql
{
  profile {
    id
    name
    emailAddress
    avatar
  }

  calendar {
    id
    type
    title
    color
  }

  events(where: { startAt: "2020-04-01", endAt: "2020-04-30" }, order: STARTING_ASC) {
    id
    title
    location {
      name
    }
    startAt
    endAt
    color
  }

  event(where: { id: "SOME-LONG-EVENT-ID" }) {
    id
    title
    location {
      name
      address
      latlon
    }
    startAt
    endAt
    color # Event could have a color? Fall back to calendar color by default?
    url
    notes
    repeats

    calendar {
      id
      title
      color
    }

    attendees {
      name
      emailAddress
      avatar

      member {
        id
        name
        emailAddress
        avatar
      }

      isOrganiser
      rsvp # ATTENDING, TENTATIVE, DECLINED
    }

    thread {
      # One
      id
    }
  }

  threads {
    id

    event {
      id
    }

    messages(limit: 20, order: CREATED_DESC) {
      id
    }
  }

  message(where: { id: "SOME-MESSAGE-ID" }) {
    id
    author {
      emailAddress
      avatar
    }
    text
    createdAt
  }
}
```

- Events listed by week with latest message

```graphql
{
  events(where: { startAt: "2020-04-06", endAt: "2020-04-12" }, order: STARTING_ASC) {
    id
    title
    startAt
    endAt
    isAllDay
    isManyDays
    location {
      name
    }
    color

    thread {
      id
      messages(limit: 1, order: CREATED_DESC) {
        id
        text
        author {
          avatar
        }
      }
    }
  }
}
```

- Events listed by month

```graphql
{
  events(where: { startAt: "2020-04-01", endAt: "2020-04-30" }, order: STARTING_ASC) {
    id
    title
    startAt
    endAt
    location {
      name
    }
    color
  }
}
```

- Message thread with event

```graphql
{
  thread(where: { id: "SOME-THREAD-ID" }) {
    id
    startAt
    total

    event {
      id
      title
      startAt
      endAt
      location {
        name
      }
      color
    }

    messages(page: 1, limit: 20, order: CREATED_DESC) {
      id
      author {
        # One
        emailAddress
        avatar
      }
      text
      createdAt
    }
  }
}
```

- Event details, ready to edit the event

```graphql
query EditEvent {
  event(where: { id: "SOME-EVENT-ID" }) {
    id
    title
    startAt
    endAt

    location {
      # One
      name
      address
      latlon
    }

    color # Inherit from calendar, but could an event have it's own color?
    repeats # NEVER (null), DAILY, WEEKLY, FORTNIGHTLY, MONTHLY, YEARLY
    url # Clever support for URLs, MAILTO or TEL prefixes in-app?
    notes

    calendar {
      # One
      id # Compare with calendars[*].id to choose a calendar
    }

    attendees {
      # Many
      name
      emailAddress
      avatar # Pulled from Gravatar?
      member {
        id
        name
        emailAddress
      }

      isOrganiser # Boolean to determine if this attendee created the event?
      rsvp # ATTENDING, TENTATIVE, DECLINED
    }
  }

  profile {
    id # Compare with events.attendees.id to find "YOU"
  }

  calendars {
    # Many
    id
    title
    color
  }
}
```

- Activity view (list of threads ordered by last updated)

```graphql
query Activity {
  threads(order: UPDATED_DESC) {
    id
    startAt
    total

    event {
      id
      title
      location {
        name
      }
      color
    }

    messages(page: 1, limit: 20, order: CREATED_DESC) {
      id
      author {
        # One
        emailAddress
        avatar
      }
      text
      createdAt
    }
  }
}
```

- Searching for "Coffee"

```graphql
query Search {
  events(where: { title: "%coffee%" }) {
    id
    title
    startAt
    endAt
    location {
      name
    }
    color
  }
}
```

- Creating an event

```graphql
mutation createEvent {
  createEvent(
    create: {
      title: "Tuesday stand-up"
      # 8AM UTC, 9AM BST
      startDate: "2020-04-07T08:00:00.000Z"
      # 9AM UTC, 10AM BST
      endDate: "2020-04-07T09:00:00.000Z"
      # Perhaps right now, single-calendar setup, we don't need this?
      # I think we should, even if we're not displaying multiple calendars in the app
      calendar: { id: "496baec6-cc5f-4c54-944d-18c2bfe18598" }
      # Manual location
      location: { name: "Office", address: "WeWork, Aldgate Tower, London E1 8FA", latlon: "51.513582,-0.0762422" }
      # Just throw a latlon at the API, and it could lookup a location from it?
      # Unsure which 3rd party service we'd need to support this feature though..
      location: { latlon: "51.513582,-0.0762422" }
      # Or perhaps an online meet?
      conference: {
        # TBD, a unified way of creating/generating conference-call data!
        type: "hangouts"
        # Ideally the app would make a request to fetch "new" conference data & send it up to the API
      }
      attendees: [
        { id: "0220743c-c9b2-40a6-a478-e168cfc005c4", isOrganiser: true }
        { name: "Alex", emailAddress: "alex@hotmail.com" }
        { name: "James", emailAddress: "james@gmail.com" }
      ]
    }
    options: {
      # In this case the app wants to control whether or not to send emails
      # Obviously this would default to true!
      sendCreateEmail: false
    }
  ) {
    id
    title
    startDate
    endDate
    location {
      name
    }
  }
}
```

- Updating events

```graphql
mutation updateEvent {
  updateEvent(
    update: {
      # Ideally the App would know what properties of the form have been updated
      # And just send the diff, but if you send an entire event object we can work with that too
      location: { name: "Office", address: "WeWork, Aldgate Tower, London E1 8FA" }
    }
    where: {
      # The where & updates are seperate for full flexibility
      id: "SOME-EVENT-ID"
    }
  ) {
    id
  }
}

mutation updateLotsOfEvents {
  updateManyEvents(
    update: {
      # This would "unset" the location property of events
      location: null
    }
    where: {
      # IMO this would be a neat "trick" to select an entire day
      startDate: ">= 2020-04-02"
      # If no TIME is present on the startDate then assume start-of-day
      endDate: "<= 2020-04-02"
      # If no TIME is present on the endDate then assume end-of-day
    }
  ) {
    # Array of Events affected returned, so this would be [{ id: 22 }]
    id
    # Returning IDs of those events affected
  }
}

mutation rsvpToEvent {
  replyToEvent(
    update: {
      # Simply replying YES
      rsvp: ATTENDING
      # What if we want to suggest a new start time?
      rsvp: TENTATIVE
      suggestStartDate: "2020-04-02T09:00:00.000Z"
      suggestEndDate: "2020-04-02T10:00:00.000Z"
      # Really though, this should mark your attendance but not edit the event
      # Instead, it should put a message in the chat to suggest a new time
      # With some sort of one-click approve? TBD
    }
    where: {
      # The where & updates are seperate for full flexibility
      id: "SOME-EVENT-ID"
    }
  ) {
    id
  }
}
```

- Write a new message

```graphql
mutation createTextMessage {
  createMessage(
    create: {
      # Attach a message to a thread
      thread: { id: "SOME-THREAD-ID" }
      # Or why not to a specific event
      thread: { event: { id: "SOME-EVENT-ID" } }
      # Because an event has one thread right?

      # A text message just needs text
      text: "Quick coffee to discuss my YC application?"
    }
  ) {
    id
    thread {
      # To get event information about the thread we just added to
      event {
        id
        title
      }
    }
    text
  }
}

query GetThreadMessages {
  thread(where: { id: "SOME-THREAD-ID" }) {
    messages(page: 1, limit: 20, order: CREATED_DESC) {
      id
      author {
        name
        emailAddress
        avatar
      }
      text
      createdAt
    }
  }
}
```

In the future we'll have more types of chat, so I see this format above being flexible enough to support other types:

```graphql
# GraphQL cannot handle incoming file types, so instead we need two mutations:
# First to get a set of upload credentials, so the app can upload direct to S3
# Second to mark an upload as complete, and get back an assetID to use in other mutations

mutation getImageUploadCredentials {
  createAsset(
    create: {
      type: IMAGE
      # The name of the image
      fileName: "IMG_0932.JPG"
      # The mimetype of the image
      fileMime: "image/jpeg"
      # The file size of the image, in bytes
      fileSize: 20420492
      # Sha1 hash so we can verify the image was uploaded correctly
      fileSha1: "mkldsfv8jq32rfjkarnvkq34nf9u"
    }
  ) {
    token # Used to confirm the upload was finished
    url
    headers
    body
  }
}

# Then the client uploads the image to upload.url with upload.headers & upload.body
# Once done, the client notifies the server that the image has been uploaded, so the server can perform final checks
# Use `fileSha1` to verify the image is correct, trigger moderation, etc. etc.

mutation finallyFinishedUploadingImage($token: String!) {
  uploadedAsset(token: $token) {
    id # The ID of the image
    fileName
    fileLocation # The final URL this image will be available at
    fileMime
    fileSize
    fileSha1
  }
}

mutation createImageMessage {
  createMessage(
    create: {
      thread: { id: "SOME-THREAD-ID" }
      text: "Sat downstairs at table 15, see you in bit!"
      image: { id: $imageID }
    }
  ) {
    id
    author {
      emailAddress
      avatar
    }
    text
    image {
      fileName
      fileLocation
      fileSize # "${fileName} is greater than 2MB, tap to show"
    }
    createdAt
  }
}

mutation createEmbedMessage {
  createMessage(
    create: {
      thread: { id: "SOME-THREAD-ID" }
      text: "Lol, what about this"
      # Provide a URL to expand
      url: "https://vm.tiktok.com/nCGxS3/"
    }
  ) {
    id
    author {
      emailAddress
      avatar
    }
    text
    # For an example, check out https://github.com/someimportantcompany/yoem
    embed {
      title # Due to the wide-ranging nature of embeds
      description # Literally any one of these fields could be NULL
      url # Except `url`, that guy is super reliable 🤦‍♂️
      provider {
        name
        url
      }
      author {
        name
        url
      }
      thumbnail {
        url
        height
        width
      }
      iframe {
        html
        height
        width
      }
    }
    createdAt
  }
}

mutation getDocumentUploadCredentials {
  createAsset(
    create: {
      type: DOCUMENT
      # The name of the document
      fileName: "Paperwork.docx"
      # The mimetype of the document
      fileMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      # The file size of the document, in bytes
      fileSize: 20420492
      # Sha1 hash so we can verify the document was uploaded correctly
      fileSha1: "dfvsdfvwrfsfvqrfafsv4wdec"
    }
  ) {
    token # Used to confirm the upload was finished
    url
    headers
    body
  }
}

# Then the client uploads the document to upload.url with upload.headers & upload.body
# Once done, the client notifies the server that the document has been uploaded, so the server can perform final checks
# Use `fileSha1` to verify the document is correct, trigger moderation, etc. etc.

mutation finallyFinishedUploadingImage($token: String!) {
  uploadedAsset(token: $token) {
    id # The ID of the document
    fileName
    fileLocation # The final URL this document will be available at
    fileMime
    fileSize
    fileSha1
  }
}

mutation createDocumentMessage($documentID: ID!) {
  createMessage(
    create: {
      thread: { id: "SOME-THREAD-ID" }
      text: "Could you please read over this before we catch-up? Thanks"
      document: { id: $documentID }
    }
  ) {
    id
    author {
      emailAddress
      avatar
    }
    text
    document {
      fileName
      fileLocation
      fileSize # "${fileName} is greater than 2MB, tap to show"
    }
    createdAt
  }
}

mutation createLocationMessage {
  createMessage(
    create: {
      thread: { id: "SOME-THREAD-ID" }
      text: "How about we meet here?"
      location: { name: "Pret, Aldgate East", latlon: "51.513582,-0.0762422" }
    }
  ) {
    id
    author {
      emailAddress
      avatar
    }
    text
    location {
      latlon
    }
    createdAt
  }
}

query EverythingIsNamespacedSoItAllFitsTogether {
  thread(where: { id: "SOME-THREAD-ID" }) {
    messages(page: 1, limit: 20, order: CREATED_DESC) {
      id
      author {
        emailAddress
        avatar
      }
      text
      image {
        fileName
        fileLocation
        fileSize # "${fileName} is greater than 2MB, tap to show"
      }
      embed {
        title
        description
        url
      }
      document {
        fileName
        fileLocation
        fileSize # "${fileName} is greater than 2MB, tap to show"
      }
      location {
        name
        latlon
      }
      createdAt
    }
  }
}
```

## Potential Subscriptions

```graphql
{
  createdEvent {
    # EVENT_CREATED
    id
  }
  updatedEvent {
    # EVENT_UPDATED
    id
  }
  updatedThread {
    # THREAD_UPDATED
    id
  }
  updatedMessage {
    # MESSAGE_UPDATED
    id
  }
}
```

## Questions

- Event locations need to consider online meetups, Google Meet or Microsoft Teams
  - Support more types? Slack? Zoom?
- Event alerts? Email alerts?
- Event timezone support?
- Only time when on-device account management fails is when you want to switch an event between calendars... that would
  technically involve deleting from one provider & creating in another?
- Messages have color?
- When a message is sent, the thread should be updated. But not the event?
- When the event is updated, a new context/status message should be generated so the thread should get an update
  triggered too?
