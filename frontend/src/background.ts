// chrome.history.onVisited.addListener((historyItem) => {

//     try {

//         let payload = {
//             url: historyItem.url,
//             title: historyItem.title
//         }

//         chrome.storage.sync.get(['userId'], async function(items) {
        
//             let userId = items.userId;
//             if (userId === null || userId === undefined) {
//                 userId =  crypto.randomUUID();
//                 chrome.storage.sync.set({userId: userId}).then(() => console.log("New user id set"), () => console.log("erroe in setting new user id!"));  
//             }

//             payload = {...payload, userId: userId}

//             let response = await fetch('http://localhost:5000/url', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(payload)
//             });

//             if (!response.ok) {
//                 throw new Error(`API call failed with status ${response.status}`);
//             }

//         });

//     } catch(error) {

//         console.log("Error storing URL :-", error);

//     }
    

// });
function getHTML() {
    return document.documentElement.innerText;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BLOCKED_DOMAINS = [
  // Email
  "mail.google.com",
  "outlook.live.com",
  "outlook.office.com",
  "mail.yahoo.com",
  "proton.me",
  "mail.proton.me",

  // Banking
  "bankofamerica.com",
  "chase.com",
  "wellsfargo.com",
  "capitalone.com",
  "citi.com",
  "americanexpress.com",
  "discover.com",
  "usbank.com",
  "pnc.com",
  "td.com",

  // Payments
  "paypal.com",
  "venmo.com",
  "cash.app",
  "stripe.com",

  // Healthcare
  "mychart.org",
  "mychart.com",
  "kaiserpermanente.org",

  // Government / Tax
  "irs.gov",
  "ssa.gov",

  // Cloud Storage
  "drive.google.com",
  "dropbox.com",
  "onedrive.live.com",

  // Password Managers
  "1password.com",
  "bitwarden.com",
  "lastpass.com",

  // Social Media
  "facebook.com",
  "twitter.com",
  "linkedin.com",
  "instagram.com",
  "reddit.com",
  "quora.com",

  // LLM Providers
  "chat.openai.com",
  "azure.com",
  "aws.amazon.com",
  "cloud.google.com",
  "gemini.google.com",
  "claude.ai",
  "anthropic.com",
  "luminous.ai",
  "ollama.com"
];

function isBlockedDomain(hostname: string): boolean {
  return BLOCKED_DOMAINS.some(domain =>
    hostname === domain ||
    hostname.endsWith(`.${domain}`)
  );
}

function containsSensitiveContent(text: string): boolean {

    const SENSITIVE_PATTERNS = [
        /social security/i,
        /\bssn\b/i,
        /routing number/i,
        /account number/i,
        /credit card/i,
        /\bcvv\b/i,
        /\bsecurity code\b/i,
        /\bdebit card\b/i,
        /\bchecking account\b/i,
        /\bsavings account\b/i,
        /\bwire transfer\b/i,
        /\btax return\b/i,
        /\bw-2\b/i,
        /\b1099\b/i,
        /\bmedical record\b/i,
        /\bpatient id\b/i,
        /\binsurance claim\b/i,
        /\bprescription\b/i,
        /\bpassword\b/i,
        /\bone-time password\b/i,
        /\botp\b/i,
        /\bmfa\b/i,
        /\btwo-factor authentication\b/i,
        /\bprivate key\b/i,
        /\bseed phrase\b/i,
        /\brecovery phrase\b/i
    ];

    return SENSITIVE_PATTERNS.some(pattern => pattern.test(text));
}

function isSensitiveUrl(url: string): boolean {

    const patterns = [
        "/login",
        "/signin",
        "/oauth",
        "/checkout",
        "/payment",
        "/billing",
        "/account",
        "/security",
        "/password",
        "/reset-password"
    ];

    const lowerUrl = url.toLowerCase();

    return patterns.some(pattern =>
        lowerUrl.includes(pattern)
    );
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        
        const url = tab.url;

        if (isSensitiveUrl(url)) {
            console.log("Sensitive URL detected");
            return;
        }
        
        const hostname = new URL(url).hostname;

        if (isBlockedDomain(hostname)) {
            console.log(`Sensitive domain detected !!`);
            return;
        }

        let htmlText = null;

        const scriptResponse = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: getHTML
        });

        if (scriptResponse != null) {
            htmlText = scriptResponse[0].result
            htmlText = htmlText.replace(/\s+/g, " ").trim();
            htmlText = htmlText.substring(0, 30000);
        }

        if (containsSensitiveContent(htmlText)) {
            console.log("Sensitive content detected !");
            return;
        }

        
        let response = await chrome.storage.sync.get(['userId']);
        let userId = response.userId;

        if (userId === null || userId === undefined) {
            userId =  crypto.randomUUID();
            chrome.storage.sync.set({userId: userId}).then(() => console.log("New user id set"), () => console.log("error in setting new user id!"));  
        }
    
        const dataPayload = {
            htmlText: htmlText,
            url: url,
            userId: userId,
            timestamp: new Date().toISOString()
        }

        fetch(`${API_BASE_URL}/api/v1/content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataPayload)
        }).then().catch(()=>console.log("error in fetch request"));

    }

})