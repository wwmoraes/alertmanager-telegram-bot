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

### unit test

- [ ] create instance with non-existent disk database
- [ ] create instance with existing disk database
