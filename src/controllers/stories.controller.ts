import md5 from 'md5';
import validUrl from 'valid-url';
import { NextFunction, Request, Response } from 'express';
import { scrapeUrl } from '../lib/scraper';

// Just a POC. this should of course be changed to a persistent DB, such as mongo
const Storage = new Map<string, StoryModel>();

type StoryModel = any; // todo: move to model, once real storage is used

class StoriesController {

  /**
   * Starts scarping a story
   *
   * @param {Request} req - Client request
   * @param {Response} response - Response object
   * @param {NextFunction} next - next middleware
   */
  scrape(req: Request, response: Response, next: NextFunction) {
    const { url, force } = req.query;

    // Validate the url
    if (!validUrl.isUri(url)) {
      return response.status(500)
        .send('Invalid URL');
    }

    const urlId = this.createUrlId(url);

    if (Storage.has(urlId) && !force) {
      response
        .status(200) // consider changing to 304
        .json({ id: urlId });
      return; // already scrapped and force is not set, nothing to do
    }

    // Add to storage, as "pending"
    const story = { scrape_status: 'pending', id: urlId};
    Storage.set(urlId, story);

    // Before starting, respond with the id
    response
      .status(201)
      .json({ id: urlId });

    // Start scrapping. when done, it would update the story model
    scrapeUrl(url, story);
  }

  /**
   * Gets scarping result for a given canonical url id
   *
   * @param {Request} req - Client request
   * @param {Response} response - Response object
   * @param {NextFunction} next - next middleware
   */
  getStory(req: Request, response: Response, next: NextFunction) {
    const requestedUrlId = req.params.urlId;

    if (!Storage.has(requestedUrlId)) {
      return response.sendStatus(404);
    }

    response.json(Storage.get(requestedUrlId));
  }

  /**
   * Create a unique identifier string for a given url.
   * This should be ported to a library.
   * @param {string} url
   * @return {string}
   */
  private createUrlId(url: string): string {
    return md5(url);
  }
}

export default StoriesController;
