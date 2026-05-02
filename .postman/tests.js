const Scripts = {
  common: `
pm.test("Response status is success", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201, 302]);
});
pm.environment.set("lastResponseStatus", String(pm.response.code));
`,

  status: `
pm.test("Status route returns online", function () {
  const body = pm.response.json();
  pm.expect(body.status).to.eql("Online");
});
`,

  oauthCallback: `
pm.test("OAuth callback returns JWT payload", function () {
  const body = pm.response.json();
  pm.expect(body.token).to.be.a("string");
  pm.expect(body.user).to.be.an("object");
});
const body = pm.response.json();
pm.environment.set("jwt", body.token);
`,

  me: `
pm.test("Auth me returns profile", function () {
  const body = pm.response.json();
  pm.expect(body.user).to.be.an("object");
  pm.expect(body.user.id).to.be.a("string");
});
`,

  playerToken: `
pm.test("Player token route returns access token", function () {
  const body = pm.response.json();
  pm.expect(body.accessToken).to.be.a("string");
  pm.expect(body.expiresIn).to.be.a("number");
});
`,

  searchResults: `
pm.test("Search returns normalized items", function () {
  const body = pm.response.json();
  pm.expect(body.success).to.eql(true);
  pm.expect(body.noResults).to.eql(false);
  pm.expect(body.items).to.be.an("array");
  pm.expect(body.items.length).to.be.greaterThan(0);
  pm.expect(body.items[0].external_urls.spotify).to.be.a("string");
});
const body = pm.response.json();
pm.environment.set("firstTrackSpotifyUrl", body.items[0].external_urls.spotify);
`,

  searchNoResults: `
pm.test("No results contract is returned", function () {
  const body = pm.response.json();
  pm.expect(body.success).to.eql(true);
  pm.expect(body.noResults).to.eql(true);
  pm.expect(body.items).to.be.an("array").that.is.empty;
  pm.expect(body.message).to.be.a("string");
});
const body = pm.response.json();
pm.environment.set("lastNoResults", String(body.noResults));
`,
};

module.exports = Scripts;
