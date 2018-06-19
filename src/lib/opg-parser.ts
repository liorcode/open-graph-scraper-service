import cheerio from 'cheerio';

interface MetaTagNode {
  property: string;
  value: string;
}

interface MetaTagTree {
  [key: string]: string | MetaTagTree | MetaTagTreeArray
}

type MetaTagTreeArray = (string | MetaTagTree)[];

export const parse = (html: string) => {
  const metaTagsArray = getOgMetaTags(html);
  // Start creating the tree from the root element: "og"
  return buildMetaTagsTree(metaTagsArray, 'og');
};

/**
 * Get all the meta tag nodes which start by 'og:'
 * @param {string} html
 * @return {MetaTagNode[]} - Array of meta tag nodes with "property" and "value"
 */
function getOgMetaTags(html: string): MetaTagNode[] {
  const $ = cheerio.load(html);
  // Get all meta tags
  return <any[]>$('head > meta')
    // Keep only meta tags with a "property" attribute, which start by 'og:'
    .filter((index, element) => $(element).attr('property') && $(element).attr('property').startsWith('og:'))
    // convert each meta tag Element to a simple object
    .map((key, val) => ({ property: $(val).attr('property'), value: $(val).attr('content')}))
    .get();
}

/**
 * Extract OPG meta tag nodes recursively
 *
 * @param {MetaTagNode[]} source - Source array
 * @param {string} prefix - Property prefix to find
 * @return {MetaTagTree}
 */
function buildMetaTagsTree (source: MetaTagNode[], prefix: string) {
  const result = <MetaTagTree>{};
  const prefixWithColon = `${prefix}:`;
  if (source.length === 0) {
    return result;
  }
  let node = source.shift();
  while (node !== undefined && node.property.startsWith(prefixWithColon)) {
    const children = buildMetaTagsTree(source, node.property);
    const propWithoutPrefix = node.property.replace(prefixWithColon, '');
    mergeWithResult(result, propWithoutPrefix, node.value, children);

    node = source.shift();
  }
  // push back remaining element
  if (node !== undefined) {
    source.unshift(node);
  }
  // Convert to object
  return result;
}

/**
 *
 * @param {MetaTagTree} result
 * @param {string} propertyName
 * @param {string} value
 * @param {MetaTagTree} children
 */
function mergeWithResult (result: MetaTagTree, propertyName: string, value: string, children: MetaTagTree) {
  const obj = buildTreeNode(propertyName, value, children);
  if (result[propertyName]) { // A property by this name already exists. append to it
    appendToExisting(result, propertyName, obj);
  } else {
    Object.assign(result, obj);
  }
}

/**
 * Build the result tree node element out of it's property name, value and children.
 *
 * @param {string} propertyName
 * @param {string} value
 * @param {MetaTagTree} children
 * @return {MetaTagTree}
 */
function buildTreeNode (propertyName: string, value: string, children: MetaTagTree): MetaTagTree {
  let obj: MetaTagTree;
  if (Object.keys(children).length) {
    /**
     * This is a structured root node.
     * Under the OPG specs, seems that when there are "structured" node, their root element
     * is the url.
     * For example:
     * <meta property="og:image" content="http://example.com/ogp.jpg" />
     * <meta property="og:image:type" content="image/jpeg" />
     */
    obj = { [propertyName]: Object.assign({url: value}, children) };
  } else {
    // regular root node with no children. just convert to a simple hash
    obj = { [propertyName]: value };
  }

  return obj;
}

/**
 * Append a tree node to existing tree node
 * @param {MetaTagTree} result
 * @param {string} prop
 * @param {MetaTagTree} treeNode
 */
function appendToExisting (result: MetaTagTree, prop: string, treeNode: MetaTagTree) {
  if (!Array.isArray(result[prop])) { // if it exists but not an array, convert to array
    result[prop] = <MetaTagTreeArray>[result[prop]];
  }

  (<MetaTagTreeArray>result[prop]).push(<any>treeNode[prop]);
}
