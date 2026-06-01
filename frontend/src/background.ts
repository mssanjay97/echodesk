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
  "ollama.com",
  "chatgpt.com"
];

function isBlockedDomain(hostname: string): boolean {
  return BLOCKED_DOMAINS.some(domain =>
    hostname === domain ||
    hostname.endsWith(`.${domain}`)
  );
}

const HIGH_RISK_PATTERNS = [
    /\b\d{3}-\d{2}-\d{4}\b/,                  // SSN
    /\b4[0-9]{12}(?:[0-9]{3})?\b/,           // Visa
    /\b5[1-5][0-9]{14}\b/,                   // Mastercard
    /\b3[47][0-9]{13}\b/,                    // Amex
    /\b\d{9}\b.*routing/i,
    /\bprivate key\b/i,
    /\bseed phrase\b/i,
    /\brecovery phrase\b/i,
    /\bwallet secret\b/i,
    /\bapi key\b/i,
    /\bsecret key\b/i,
    /\baccess token\b/i,
    /\brefresh token\b/i,
    /\bclient secret\b/i,
    /\baws_access_key_id\b/i,
    /\baws_secret_access_key\b/i,
    /\bgithub token\b/i,
    /\bopenai api key\b/i,
    /\bgoogle api key\b/i,
    /\bbearer token\b/i
];

const MEDIUM_RISK_PATTERNS = [
    /\bssn\b/i,
    /\bsocial security number\b/i,
    /\brouting number\b/i,
    /\baccount number\b/i,
    /\bcredit card\b/i,
    /\bcvv\b/i,
    /\bdebit card\b/i,
    /\bchecking account\b/i,
    /\bsavings account\b/i,
    /\bpatient id\b/i,
    /\bmedical record number\b/i,
    /\binsurance member id\b/i,
    /\bpassport number\b/i,
    /\bdriver.?license\b/i,
    /\bach transfer\b/i,
    /\biban\b/i,
    /\bswift code\b/i,
    /\bbeneficiary\b/i,
    /\bdate of birth\b/i,
    /\bdob\b/i
];

const LOW_RISK_PATTERNS = [
    /\bpassword\b/i,
    /\bone-time password\b/i,
    /\botp\b/i,
    /\bmfa\b/i,
    /\btwo-factor authentication\b/i,
    /\blogin\b/i,
    /\bsign in\b/i,
    /\bverification code\b/i,
    /\bsecurity question\b/i,
    /\bsecurity answer\b/i,
    /\binsurance claim\b/i,
    /\bmedical record\b/i,
    /\bprescription\b/i,
    /\btax return\b/i,
    /\bw-2\b/i,
    /\b1099\b/i,
    /\bauthenticator app\b/i,
    /\bbackup codes\b/i,
    /\bwallet address\b/i,
    /\bmetamask\b/i,
    /\btrezor\b/i,
    /\bledger\b/i
];

function containsSensitiveContent(text: string): boolean {
    let score = 0;

    HIGH_RISK_PATTERNS.forEach(pattern => {
        if (pattern.test(text)) {
            score += 5;
        }
    });

    MEDIUM_RISK_PATTERNS.forEach(pattern => {
        if (pattern.test(text)) {
            score += 3;
        }
    });

    LOW_RISK_PATTERNS.forEach(pattern => {
        if (pattern.test(text)) {
            score += 1;
        }
    });

    console.log(`Sensitive content score: ${score}`);

    return score >= 5;
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