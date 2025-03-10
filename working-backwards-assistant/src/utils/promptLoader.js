/**
 * Re-export the PromptLoader from PromptLoaderServer
 * This file provides compatibility for older code that imports from './promptLoader'
 */

const { PromptLoader } = require('./PromptLoaderServer');

module.exports = { PromptLoader }; 