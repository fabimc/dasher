"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

const moment = require("moment");
const { get } = require("lodash");

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.image.search(ctx.query);
    } else {
      entities = await strapi.services.image.find(ctx.query);
    }
    return entities.filter(e => {
      const now = moment().valueOf();
      let publish_date = get(e, "schedule.publish_date", null);
      publish_date =
        publish_date === null ? null : moment(publish_date).valueOf();
      let expiration_date = get(e, "schedule.expiration_date", null);
      expiration_date =
        expiration_date === null ? null : moment(expiration_date).valueOf();

      if (
        e.schedule === null ||
        (publish_date === null && expiration_date === null)
      ) {
        return true;
      } else if (
        publish_date === null &&
        expiration_date !== null &&
        now < expiration_date
      ) {
        return true;
      } else if (
        expiration_date === null &&
        publish_date !== null &&
        publish_date <= now
      ) {
        return true;
      } else if (
        publish_date !== null &&
        expiration_date !== null &&
        publish_date < expiration_date &&
        now >= publish_date &&
        now < expiration_date
      ) {
        return true;
      } else {
        return false;
      }
    });
  }
};
