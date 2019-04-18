# SYNOPSIS

🐕 Opinionated wrapper to the browser's default fetch method.

## USAGE

```sh
npm i -S joemccann/enhanced-fetch
```

In your web app:

```js
const Fetch = require('enhanced-fetch')
const fetch = new Fetch({root: 'https://www.your-domain.com'})

~(async () => {
  const { err, data, res } = await fetch.request('path/to/api', {
    method: 'POST',
    body: {
      name: 'Joe',
      email: 'foo@bar.com'
    },
    headers: {
      'x-custom-api-header': 'XXX'
    }
  })
  if(err) console.error(err)
  else console.log(data)
})();
````

## AUTHORS

- [Joe McCann](https://twitter.com/joemccann)

## LICENSE

MIT