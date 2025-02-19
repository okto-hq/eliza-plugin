import {
  elizaLogger
} from "@elizaos/core";
import { OAuth2Client } from 'google-auth-library';
import open from 'open';
import http from 'http';
import url from 'url';


export async function getGoogleIdToken(
    googleClientId: string,
    googleClientSecret: string,
    redirectUrl: string = 'http://localhost:5000'
) {
    return new Promise((resolve, reject) => {
      const oauth2Client = new OAuth2Client(
        googleClientId,
        googleClientSecret,
        redirectUrl
      );

      const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email']
      });
      elizaLogger.info("Okto Google authorize URL: ", authorizeUrl)

      const server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/?code') > -1) {
            // acquire the code from the querystring, and close the web server.
            const qs = new url.URL(req.url, redirectUrl)
              .searchParams;
            const code = qs.get('code');
            res.end('Authentication successful! Please return to the console.');
            server.close();

            // Now that we have the code, use that to acquire tokens.
            const {tokens} = await oauth2Client.getToken(code);
            resolve(tokens);
          }
        } catch (e) {
          console.log("Error: ", e)
          reject(e);
        }
      })
      .listen(5000, () => {
        elizaLogger.info("Google auth server listening on port 5000")
        open(authorizeUrl);
      });      
    })
  }