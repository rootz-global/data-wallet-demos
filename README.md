# Data Wallet Demos

These demos exercise the epistery plugin to create and employ data wallets for various different use cases.
Each is configured to run as a subdomain of https://thirdparty.company to simulate and demonstrate the context.
Each runs as a standalone app.

| Path | Language | Description
| --- |----------| --- |
|https://messaging.thirdparty.company| node     |Basic exchange of text messages |
|https://music.thirdparty.company| node     |Example of uploading a song and transferring ownership |
|https://adsupported.thirdparty.company| node     |A site that uses epistery to track anonymous/private browser interaction |
|https://email.thirdparty.company| dotnet   |A service that can be sent an email to be recorded as data-wallet |

>**NOTE**: Epistery has not been released to npm, so these demos are dependent on a relative path to the epistery repository provided in package.json 
