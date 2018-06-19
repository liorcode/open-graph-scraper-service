import rp from 'request-promise-native';
import { parse } from './opg-parser'

type StoryModel = any; // todo: move to model

/**
 * Start url scrapping, using the scrapeUrl function.
 * When done, update the story model.
 *
 * @param {string} url
 * @param {StoryModel} story
 * @return {Promise<void>}
 */
export const scrapeUrl = async (url: string, story: StoryModel) => {
  try {
    const resp = await rp.get(url);
    const ogp = parse(resp);
    // merge the parsed graph to the story
    Object.assign(story, ogp, { updated_time: (new Date()).toISOString(), scrape_status: 'done' });
  } catch (e) {
    if (story.scrape_status === 'pending') {
      // if this was a pending scrape, set status to 'error'
      Object.assign(story, { updated_time: (new Date()).toISOString(), scrape_status: 'error' });
    }
  }
};
