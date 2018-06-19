# Open graph scarper

## API

#### `POST /stories?url={url}`

Scrape a url. server would immediately reply by:
```
{ id: <url-id> }
```

If this is the first time this url was called, it would start scraping it asynchronously. The status code would be `201`.  
Otherwise, it would just return status `200`.

If you wish to force-scrape it anyway, pass 'force=true':  
`POST /stories?force=true&url={url}`

### GET /stories/{url}

Get details for a previously scraped url.  
- If url was never scraped, it would return status `404`.
- If url is currently being scraped, it would return: 
```
{
  "id": <url-id>
  "scrape_status": "pending",
  "updated_time": <ISO8601 time>
}
```
- If scraping had failed, it would return:
```
{
  "id": <url-id>
  "scrape_status": "error",
  "updated_time": <ISO8601 time>
}
```

Otherwise, it would return the scraping result:
```
{
  "scrape_status": "done",
  "id": "5ad42c6c7b4990e6ceeb326006ec9950",
  "title": "Open Graph protocol",
  "type": "website",
  "url": "http://ogp.me/",
  "image": {
      "url": "http://ogp.me/logo.png",
      "type": "image/png",
      "width": "300",
      "height": "300",
      "alt": "The Open Graph logo"
  },
  "description": "The Open Graph protocol enables any web page to become a rich object in a social graph.",
  "updated_time": "2018-06-19T09:34:20.182Z"
}
```
Note: `image`, or any other properties would be an array if there is more than one tags by that name.

### Examples

#### Get ogp.me open graph tags:
Create scrape:  
`curl -X POST /stories?url=http%3A%2F%2Fogp.me%2F`

Then get the created scrape:  
`curl -X GET /stories/5ad42c6c7b4990e6ceeb326006ec9950`

