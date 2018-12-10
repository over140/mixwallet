# mixwallet
Mixwallet is a Mixin Network-based full set cryptocurrency wallet that securely manages your digital assets with a private key and a 6-digit PIN code. Please note that we will not save your private key and digital PIN code, once the private key and PIN code lost, both of them cannot be recovered, please keep the private key and remember the 6-digit PIN code carefully.

### Get Started

##### Register develper account
You need a Mixin Messenger account to create a developer account. Visit https://mixin.one/messenger to download our app and create an account, then visit https://developers.mixin.one/dashboard. Use Mixin Messenger camera to scan the QR code, then give permission to developer website.

##### Create app
After you logged in, click Create New App to create your first app.
![dev-guide](https://developers.mixin.one/api/images/register-app.png)


##### Nginx
Install nginx and config nginx.conf, `sudo nginx` later.

##### Config
Replace app id、private key and session id from your app infomation in webpack.config.js

##### Run
`npm install` to install dependencies, `npm run watch` to run the project.
