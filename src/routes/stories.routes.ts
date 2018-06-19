import { Express } from 'express';
import StoriesController from '../controllers/stories.controller';

const storiesController = new StoriesController();
/**
 * API routes for CRUD operations on the device
 * @param {object} app - express application
 */
export default (app: Express) => {
  app.route('/stories')
    .post(storiesController.scrape.bind(storiesController));

  app.route('/stories/:urlId')
    .get(storiesController.getStory.bind(storiesController));
};
