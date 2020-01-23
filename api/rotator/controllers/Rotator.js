'use strict';
const { sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.rotator.search(ctx.query);
    } else {
      entities = await strapi.services.rotator.find(ctx.query, ['slides.desktop_login.file', 'slides.desktop_logout.file', 'slides.mobile_login.file', 'slides.mobile_logout.file']);
    }

    return entities.map(entity =>
      sanitizeEntity(entity, { model: strapi.models.rotator })
    );
  },

  async findOne(ctx) {
    const entity = await strapi.services.rotator.findOne(ctx.params, ['slides.desktop_login.file', 'slides.desktop_logout.file', 'slides.mobile_login.file', 'slides.mobile_logout.file']);
    return sanitizeEntity(entity, { model: strapi.models.rotator });
  },
};
