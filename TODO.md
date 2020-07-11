# To dos

## General

- [ ] replace mock user data with [faker.js](https://github.com/Marak/Faker.js)

## AlertManager

### e2e test

- [ ] create instance
- [ ] register user 1
- [ ] receive firing alert 1
- [ ] send alert 1 to user 1
- [ ] user 1 silences alert 1
- [ ] send message about user 1 silencing alert 1
- [ ] register user 2
- [ ] receive firing alert 1
- [ ] send alert 1 to user 2
- [ ] receive firing alert 2
- [ ] send alert 2 to user 1 and 2
- [ ] user 2 silences alert 2
- [ ] send message about user 2 silencing alert 2
- [ ] received resolved alert 1
- [ ] send alert 1 to user 1 and 2
- [ ] deregister user 2
- [ ] remove messages for user 2
- [ ] received resolved alert 2
- [ ] send alert 2 to user 1

## refactors

- [ ] decouple alert send/edit logic from alertmanager
  - [ ] Alert -> FiringAlert class
  - [ ] Alert -> ResolvedAlert class
  - [ ] Alert.from: create child type
  - [ ] AlertManager.sendAlertMessages: use sendAlert from alert instance
- [ ] decouple message logic from AlertManager
- [ ] get rid of all `export default`

## Responsibility definitions

### AlertManager module

- `AlertManager`
  - Alert state management
  - enroll state management
  - process webhook requests from AlertManager
  - Alert message send/edit
  - process Telegram callback (e.g. inline keyboard)
- `Alert`:
  - constructs `IAlert` instances from compatible data
  - format `IAlert` into message string

### UserOnly module

- `userOnlyMiddleware`: drop requests from unlisted users
