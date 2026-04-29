/*
Postman setup for Music Search Portfolio routes.

Required Postman environment variables:
- baseUrl (example: http://127.0.0.1:3001)
- apiPrefix (example: /api/v42)
- jwt (empty initially; set after OAuth callback response)
- spotifyCode (manual one-time auth code from Spotify callback URL)
- googleCode (manual one-time auth code from Google callback URL)

Optional variables set by scripts:
- lastResponseStatus
- lastNoResults
- firstTrackSpotifyUrl
*/

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

/*
Collection request definitions (copy each into Postman):

1) GET {{baseUrl}}/
   Tests tab: Scripts.common

2) GET {{baseUrl}}{{apiPrefix}}/status
   Tests tab: Scripts.common + Scripts.status

3) GET {{baseUrl}}{{apiPrefix}}/auth/spotify/login
   This redirects to Spotify OAuth.

4) GET {{baseUrl}}{{apiPrefix}}/auth/google/login
   This redirects to Google OAuth.

5) GET {{baseUrl}}{{apiPrefix}}/auth/spotify/callback?code={{spotifyCode}}
   Tests tab: Scripts.common + Scripts.oauthCallback

6) GET {{baseUrl}}{{apiPrefix}}/auth/google/callback?code={{googleCode}}
   Tests tab: Scripts.common + Scripts.oauthCallback

7) GET {{baseUrl}}{{apiPrefix}}/auth/me
   Headers: Authorization: Bearer {{jwt}}
   Tests tab: Scripts.common + Scripts.me

8) GET {{baseUrl}}{{apiPrefix}}/spotify/player-token
   Headers: Authorization: Bearer {{jwt}}
   Tests tab: Scripts.common + Scripts.playerToken

9) GET {{baseUrl}}{{apiPrefix}}/search?q=daft%20punk&type=track&limit=10
   Headers: Authorization: Bearer {{jwt}}
   Tests tab: Scripts.common + Scripts.searchResults

10) GET {{baseUrl}}{{apiPrefix}}/search?q=zzzzzzzzzzzzzzzzzzzz&type=track&limit=5
    Headers: Authorization: Bearer {{jwt}}
    Tests tab: Scripts.common + Scripts.searchNoResults
*/

module.exports = Scripts;
