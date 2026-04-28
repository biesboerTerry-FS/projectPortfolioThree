const { getLandingCatalog } = require('../services/landingCatalogService');

async function landingCatalog(request, response) {
  try {
    const limit = Number(request.query.limit || 12);
    const items = await getLandingCatalog(limit);
    return response.json({
      success: true,
      ...items,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: 'Unable to load landing catalog',
    });
  }
}

module.exports = {
  landingCatalog,
};
