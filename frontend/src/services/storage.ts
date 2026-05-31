export async function getOrSetUserID(){

  try {
    if (chrome.storage) {

      let resp = await chrome.storage.sync.get(['userId'])
      let userId = resp.userId;
    
      if (userId === null || userId === undefined) {
        userId =  crypto.randomUUID();
        await chrome.storage.sync.set({userId: userId});
      } 
      console.log("UserID fetched from chrome.storage ", userId);
      return userId;

    } else {
      let userId = localStorage.getItem('userId');

      if (!userId) {
        userId =  crypto.randomUUID();
        localStorage.setItem('userId', userId);
      }

      console.log("UserID fetched from localStorage ", userId);
      return userId;
    }

  } catch(err) {

    console.log("Error fetching userID from storage ");
    throw err;
  }
  
}